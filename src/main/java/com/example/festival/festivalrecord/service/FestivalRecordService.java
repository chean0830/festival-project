package com.example.festival.festivalrecord.service;

import com.example.festival.ai.GeminiPosterClient;
import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.festivalrecord.dto.FestivalRecordRequest;
import com.example.festival.festivalrecord.dto.FestivalRecordResponse;
import com.example.festival.festivalrecord.dto.FestivalRecordSummaryResponse;
import com.example.festival.festivalrecord.dto.RecordImageResponse;
import com.example.festival.festivalrecord.dto.RecordSongResponse;
import com.example.festival.festivalrecord.dto.ShareRequest;
import com.example.festival.festivalrecord.dto.SongInput;
import com.example.festival.festivalrecord.entity.FestivalRecord;
import com.example.festival.festivalrecord.entity.FestivalRecordAiQuota;
import com.example.festival.festivalrecord.entity.RecordFood;
import com.example.festival.festivalrecord.entity.RecordImage;
import com.example.festival.festivalrecord.entity.RecordShare;
import com.example.festival.festivalrecord.entity.RecordSong;
import com.example.festival.festivalrecord.repository.FestivalRecordAiQuotaRepository;
import com.example.festival.festivalrecord.repository.FestivalRecordRepository;
import com.example.festival.festivalrecord.repository.RecordFoodRepository;
import com.example.festival.festivalrecord.repository.RecordImageRepository;
import com.example.festival.festivalrecord.repository.RecordShareRepository;
import com.example.festival.festivalrecord.repository.RecordSongRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.notification.service.NotificationService;
import com.example.festival.visit.entity.EventVisit;
import com.example.festival.visit.repository.EventVisitRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FestivalRecordService {

    private static final String RECORD_IMAGE_SUBDIR = "festival-record";
    private static final String POSTER_SUBDIR = "festival-record/posters";
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final int FREE_POSTER_REGEN_LIMIT = 3;
    private static final int MAX_POSTER_REFERENCE_IMAGES = 6;
    private static final String RECORD_REMINDER_TYPE = "RECORD_REMINDER";
    private static final List<String> POSTER_STYLE_REFERENCE_PATHS = List.of(
            "ai/poster-style/example-1.jpg",
            "ai/poster-style/example-2.jpg",
            "ai/poster-style/example-3.jpg"
    );

    private final FestivalRecordRepository festivalRecordRepository;
    private final FestivalRecordAiQuotaRepository festivalRecordAiQuotaRepository;
    private final RecordImageRepository recordImageRepository;
    private final RecordSongRepository recordSongRepository;
    private final RecordFoodRepository recordFoodRepository;
    private final RecordShareRepository recordShareRepository;
    private final MemberRepository memberRepository;
    private final EventRepository eventRepository;
    private final EventVisitRepository eventVisitRepository;
    private final NotificationService notificationService;
    private final GeminiPosterClient geminiPosterClient;
    private final Path uploadRoot;
    private final List<byte[]> posterStyleReferenceImages;
    private final List<String> posterStyleReferenceMimeTypes;

    public FestivalRecordService(
            FestivalRecordRepository festivalRecordRepository,
            FestivalRecordAiQuotaRepository festivalRecordAiQuotaRepository,
            RecordImageRepository recordImageRepository,
            RecordSongRepository recordSongRepository,
            RecordFoodRepository recordFoodRepository,
            RecordShareRepository recordShareRepository,
            MemberRepository memberRepository,
            EventRepository eventRepository,
            EventVisitRepository eventVisitRepository,
            NotificationService notificationService,
            GeminiPosterClient geminiPosterClient,
            @Value("${file.upload-dir:uploads}") String uploadDir
    ) {
        this.festivalRecordRepository = festivalRecordRepository;
        this.festivalRecordAiQuotaRepository = festivalRecordAiQuotaRepository;
        this.recordImageRepository = recordImageRepository;
        this.recordSongRepository = recordSongRepository;
        this.recordFoodRepository = recordFoodRepository;
        this.recordShareRepository = recordShareRepository;
        this.memberRepository = memberRepository;
        this.eventRepository = eventRepository;
        this.eventVisitRepository = eventVisitRepository;
        this.notificationService = notificationService;
        this.geminiPosterClient = geminiPosterClient;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        this.posterStyleReferenceImages = new ArrayList<>();
        this.posterStyleReferenceMimeTypes = new ArrayList<>();
        for (String resourcePath : POSTER_STYLE_REFERENCE_PATHS) {
            try (InputStream in = new ClassPathResource(resourcePath).getInputStream()) {
                posterStyleReferenceImages.add(in.readAllBytes());
                posterStyleReferenceMimeTypes.add("image/jpeg");
            } catch (IOException e) {
                throw new UncheckedIOException("포스터 스타일 참고 이미지를 불러오지 못했습니다: " + resourcePath, e);
            }
        }
    }

    public List<FestivalRecordSummaryResponse> getRecords(Long memberId) {
        getMemberOrThrow(memberId);
        return festivalRecordRepository.findAllByMemberIdWithEvent(memberId).stream()
                .map(this::toSummary)
                .toList();
    }

    public FestivalRecordResponse getRecord(Long memberId, Long recordId) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);
        return toResponse(record);
    }

    @Transactional
    public FestivalRecordResponse createRecord(Long memberId, FestivalRecordRequest request) {
        Member member = getMemberOrThrow(memberId);
        Event event = getEventOrThrow(request.eventId());

        if (festivalRecordRepository.existsByMember_IdAndEvent_EventId(memberId, event.getEventId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 기록을 작성한 공연이에요. 기존 기록을 수정해주세요.");
        }

        FestivalRecord record = FestivalRecord.create(member, event);
        record.updateContent(request.title(), request.content(), request.rating(),
                request.oneLineReview(), request.memo(), request.hashtag(), request.mood());
        festivalRecordRepository.save(record);

        replaceSongs(record, request.songs());
        replaceFoods(record, request.foods());

        notificationService.notifyMember(
                memberId,
                event.getEventId(),
                "FESTIVAL_RECORD",
                "새 페스티벌 기록이 저장됐어요!",
                event.getName() + " 기록이 나의 페스티벌 기록에 추가됐어요."
        );

        return toResponse(record);
    }

    @Transactional
    public FestivalRecordResponse updateRecord(Long memberId, Long recordId, FestivalRecordRequest request) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);

        if (!request.eventId().equals(record.getEvent().getEventId())) {
            if (festivalRecordRepository.existsByMember_IdAndEvent_EventId(memberId, request.eventId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 기록을 작성한 공연이에요. 기존 기록을 수정해주세요.");
            }
            record.changeEvent(getEventOrThrow(request.eventId()));
        }
        record.updateContent(request.title(), request.content(), request.rating(),
                request.oneLineReview(), request.memo(), request.hashtag(), request.mood());

        replaceSongs(record, request.songs());
        replaceFoods(record, request.foods());

        return toResponse(record);
    }

    @Transactional
    public void deleteRecord(Long memberId, Long recordId) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);

        recordImageRepository.findAllByRecord_RecordIdOrderByDisplayOrderAscImageIdAsc(record.getRecordId())
                .forEach(image -> deletePhysicalFileIfExists(image.getImageUrl()));
        deletePhysicalFileIfExists(record.getPosterImageUrl());

        recordImageRepository.deleteAllByRecord_RecordId(record.getRecordId());
        recordSongRepository.deleteAllByRecord_RecordId(record.getRecordId());
        recordFoodRepository.deleteAllByRecord_RecordId(record.getRecordId());
        recordShareRepository.deleteAllByRecord_RecordId(record.getRecordId());
        festivalRecordRepository.delete(record);
    }

    @Transactional
    public FestivalRecordResponse addImage(Long memberId, Long recordId, MultipartFile file) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일이 비어 있습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg, png, webp, gif 형식의 이미지만 등록할 수 있습니다.");
        }

        String storedFileName = storeFile(file, recordId);
        String publicUrl = "/uploads/" + RECORD_IMAGE_SUBDIR + "/" + storedFileName;
        int nextOrder = recordImageRepository.findAllByRecord_RecordIdOrderByDisplayOrderAscImageIdAsc(record.getRecordId()).size();
        recordImageRepository.save(RecordImage.of(record, publicUrl, nextOrder));

        return toResponse(record);
    }

    @Transactional
    public FestivalRecordResponse reorderImages(Long memberId, Long recordId, List<Long> orderedImageIds) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);
        List<RecordImage> images = recordImageRepository.findAllByRecord_RecordIdOrderByDisplayOrderAscImageIdAsc(record.getRecordId());

        if (orderedImageIds == null || orderedImageIds.size() != images.size()
                || !orderedImageIds.containsAll(images.stream().map(RecordImage::getImageId).toList())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "사진 목록이 올바르지 않습니다.");
        }

        for (RecordImage image : images) {
            image.changeDisplayOrder(orderedImageIds.indexOf(image.getImageId()));
        }

        return toResponse(record);
    }

    @Transactional
    public void deleteImage(Long memberId, Long recordId, Long imageId) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);
        RecordImage image = recordImageRepository.findByImageIdAndRecord_RecordId(imageId, record.getRecordId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다."));

        recordImageRepository.delete(image);
        deletePhysicalFileIfExists(image.getImageUrl());
    }

    /**
     * 업로드된 사진 + 공연명/무드/한줄평/해시태그를 Gemini에 보내 포스터 이미지 한 장을 합성한다.
     * 무료 생성 횟수(3회)는 기록이 아니라 (회원, 공연) 단위로 세므로, 기록을 지우고 같은 공연으로
     * 새 기록을 만들어도 초기화되지 않는다. 이 API는 호출마다 실제 과금이 발생한다.
     */
    @Transactional
    public FestivalRecordResponse generatePoster(Long memberId, Long recordId) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);
        FestivalRecordAiQuota quota = getOrCreateAiQuota(record.getMember(), record.getEvent());
        if (quota.getUsedCount() >= FREE_POSTER_REGEN_LIMIT) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "무료 생성 횟수를 모두 사용했습니다.");
        }
        if (!geminiPosterClient.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI 포스터 생성 기능이 아직 설정되지 않았습니다.");
        }

        List<RecordImage> images = recordImageRepository.findAllByRecord_RecordIdOrderByDisplayOrderAscImageIdAsc(record.getRecordId());
        if (images.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "포스터를 만들려면 사진을 1장 이상 올려주세요.");
        }

        List<byte[]> referenceImages = new ArrayList<>(posterStyleReferenceImages);
        List<String> mimeTypes = new ArrayList<>(posterStyleReferenceMimeTypes);
        for (RecordImage image : images.subList(0, Math.min(images.size(), MAX_POSTER_REFERENCE_IMAGES))) {
            Path filePath = resolveUploadPath(image.getImageUrl());
            try {
                referenceImages.add(Files.readAllBytes(filePath));
                String detected = Files.probeContentType(filePath);
                mimeTypes.add(detected != null ? detected : "image/jpeg");
            } catch (IOException e) {
                throw new UncheckedIOException("기록 이미지를 읽는 데 실패했습니다.", e);
            }
        }

        String prompt = buildPosterPrompt(record);
        GeminiPosterClient.GeneratedImage generated = geminiPosterClient.generatePoster(prompt, referenceImages, mimeTypes);

        deletePhysicalFileIfExists(record.getPosterImageUrl());
        String publicUrl = storePosterFile(generated, recordId);
        record.changePosterImage(publicUrl);
        quota.increment();

        return toResponse(record);
    }

    private FestivalRecordAiQuota getOrCreateAiQuota(Member member, Event event) {
        return festivalRecordAiQuotaRepository.findByMember_IdAndEvent_EventId(member.getId(), event.getEventId())
                .orElseGet(() -> festivalRecordAiQuotaRepository.save(FestivalRecordAiQuota.create(member, event)));
    }

    private String buildPosterPrompt(FestivalRecord record) {
        StringBuilder prompt = new StringBuilder();
        int styleCount = POSTER_STYLE_REFERENCE_PATHS.size();
        prompt.append("가장 처음 ").append(styleCount).append("장의 이미지는 스타일 참고용 예시 포스터야. ")
                .append("예시 속 사진, 인물, 공연명, 문구는 절대 그대로 쓰지 말고, ")
                .append("폴라로이드/찢어진 종이 프레임으로 사진을 콜라주처럼 배치하는 방식, 굵은 타이포 타이틀, ")
                .append("마스킹테이프·티켓·스티커 같은 그래픽 요소, 손글씨 느낌의 짧은 문구를 곁들이는 스타일만 참고해줘. ");
        prompt.append("그 다음에 첨부된 사진들이 실제로 포스터에 들어갈 진짜 사진이야. ")
                .append("이 사진들 속 인물과 분위기를 살려서 세로 방향 포스터로 합성해줘. ");
        prompt.append("공연명 \"").append(record.getEvent().getName()).append("\"을 포스터 안에 큰 타이틀 텍스트로 넣어줘. ");
        String dateRange = formatEventDateRange(record.getEvent());
        if (dateRange != null) {
            prompt.append("공연 날짜 \"").append(dateRange).append("\"도 포스터 상단 어딘가에 작게 넣어줘. ");
        }
        if (record.getMood() != null && !record.getMood().isBlank()) {
            prompt.append("원하는 분위기: ").append(record.getMood()).append(". ");
        }
        if (record.getOneLineReview() != null && !record.getOneLineReview().isBlank()) {
            prompt.append("한줄평 \"").append(record.getOneLineReview()).append("\"도 손글씨/타이핑 느낌의 짧은 문구로 이미지 안에 넣어줘. ");
        }
        if (record.getHashtag() != null && !record.getHashtag().isBlank()) {
            prompt.append("키워드: ").append(record.getHashtag()).append(". ");
        }
        prompt.append("타이틀과 문구는 한글이면 오탈자 없이 또박또박한 글자 모양으로 정확하게 그려줘.");
        return prompt.toString();
    }

    private String formatEventDateRange(Event event) {
        if (event.getStartDate() == null) {
            return null;
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");
        if (event.getEndDate() == null || event.getEndDate().equals(event.getStartDate())) {
            return event.getStartDate().format(formatter);
        }
        return event.getStartDate().format(formatter) + " - " + event.getEndDate().format(formatter);
    }

    @Transactional
    public FestivalRecordResponse shareRecord(Long memberId, Long recordId, ShareRequest request) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);
        recordShareRepository.save(RecordShare.of(record, request.platform(), request.shareUrl()));
        record.markShared();
        return toResponse(record);
    }

    /**
     * 이미 끝난 공연에 다녀왔는데(event_visit) 아직 기록(festival_record)이 없는 회원에게
     * "기록 남겨보세요" 알림을 보낸다. FestivalRecordReminderScheduler가 주기적으로 호출한다.
     * 체크인(event_visit 생성) 자체는 담당 범위 밖이라 여기서는 읽기만 한다.
     */
    @Transactional
    public void notifyUnrecordedVisits() {
        List<EventVisit> visits = eventVisitRepository.findAllForEndedEvents();

        Set<String> seen = new HashSet<>();
        for (EventVisit visit : visits) {
            Long memberId = visit.getMember().getId();
            Long eventId = visit.getEvent().getEventId();
            String dedupeKey = memberId + ":" + eventId;
            if (!seen.add(dedupeKey)) {
                continue;
            }
            if (festivalRecordRepository.existsByMember_IdAndEvent_EventId(memberId, eventId)) {
                continue;
            }
            if (notificationService.hasNotified(memberId, eventId, RECORD_REMINDER_TYPE)) {
                continue;
            }
            notificationService.notifyMember(
                    memberId,
                    eventId,
                    RECORD_REMINDER_TYPE,
                    "다녀온 공연, 기록으로 남겨보세요!",
                    visit.getEvent().getName() + " 기록을 아직 안 남기셨어요. 사진과 함께 나만의 페스티벌 기록을 만들어보세요."
            );
        }
    }

    private void replaceSongs(FestivalRecord record, List<SongInput> songs) {
        recordSongRepository.deleteAllByRecord_RecordId(record.getRecordId());
        if (songs == null || songs.isEmpty()) {
            return;
        }
        List<RecordSong> entities = songs.stream()
                .map(song -> RecordSong.of(record, song.songTitle(), song.artistName(), song.albumCoverUrl()))
                .toList();
        recordSongRepository.saveAll(entities);
    }

    private void replaceFoods(FestivalRecord record, List<String> foods) {
        recordFoodRepository.deleteAllByRecord_RecordId(record.getRecordId());
        if (foods == null || foods.isEmpty()) {
            return;
        }
        List<RecordFood> entities = foods.stream()
                .filter(food -> food != null && !food.isBlank())
                .map(food -> RecordFood.of(record, food))
                .toList();
        recordFoodRepository.saveAll(entities);
    }

    private FestivalRecord getOwnedRecordOrThrow(Long memberId, Long recordId) {
        FestivalRecord record = festivalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "기록을 찾을 수 없습니다."));
        if (!record.getMember().getId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "기록을 찾을 수 없습니다.");
        }
        return record;
    }

    private Member getMemberOrThrow(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }

    private Event getEventOrThrow(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));
    }

    private FestivalRecordSummaryResponse toSummary(FestivalRecord record) {
        Event event = record.getEvent();
        return new FestivalRecordSummaryResponse(
                record.getRecordId(),
                event.getEventId(),
                event.getName(),
                resolveThumbnail(record, event),
                record.getTitle(),
                toRatingInt(record.getRating()),
                record.getOneLineReview(),
                record.getCreatedAt()
        );
    }

    /**
     * 목록 카드 썸네일 = 사용자가 순서 1번(대표)으로 올린 본인 기록 사진.
     * 아직 사진을 안 올렸으면 공연 포스터 이미지로 대체한다.
     */
    private String resolveThumbnail(FestivalRecord record, Event event) {
        List<RecordImage> images = recordImageRepository.findAllByRecord_RecordIdOrderByDisplayOrderAscImageIdAsc(record.getRecordId());
        if (!images.isEmpty()) {
            return images.get(0).getImageUrl();
        }
        return event.getPosterImage();
    }

    private FestivalRecordResponse toResponse(FestivalRecord record) {
        Event event = record.getEvent();

        List<RecordImageResponse> images = recordImageRepository.findAllByRecord_RecordIdOrderByDisplayOrderAscImageIdAsc(record.getRecordId()).stream()
                .map(image -> new RecordImageResponse(image.getImageId(), image.getImageUrl()))
                .toList();
        List<RecordSongResponse> songs = recordSongRepository.findAllByRecord_RecordId(record.getRecordId()).stream()
                .map(song -> new RecordSongResponse(song.getSongId(), song.getSongTitle(), song.getArtistName(), song.getAlbumCoverUrl()))
                .toList();
        List<String> foods = recordFoodRepository.findAllByRecord_RecordId(record.getRecordId()).stream()
                .map(RecordFood::getFoodName)
                .toList();
        int aiUsedCount = festivalRecordAiQuotaRepository
                .findByMember_IdAndEvent_EventId(record.getMember().getId(), event.getEventId())
                .map(FestivalRecordAiQuota::getUsedCount)
                .orElse(0);

        return new FestivalRecordResponse(
                record.getRecordId(),
                event.getEventId(),
                event.getName(),
                event.getPosterImage(),
                record.getTitle(),
                record.getContent(),
                toRatingInt(record.getRating()),
                record.getOneLineReview(),
                record.getMemo(),
                record.getHashtag(),
                record.getMood(),
                record.getPosterImageUrl(),
                record.isShared(),
                aiUsedCount,
                images,
                songs,
                foods,
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }

    private String storeFile(MultipartFile file, Long recordId) {
        try {
            Path targetDir = uploadRoot.resolve(RECORD_IMAGE_SUBDIR);
            Files.createDirectories(targetDir);

            String extension = extractExtension(file.getOriginalFilename());
            String fileName = recordId + "_" + UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(fileName).normalize();

            file.transferTo(targetPath);
            return fileName;
        } catch (IOException e) {
            throw new UncheckedIOException("기록 이미지 저장에 실패했습니다.", e);
        }
    }

    private Path resolveUploadPath(String publicUrl) {
        String prefix = "/uploads/";
        if (publicUrl == null || !publicUrl.startsWith(prefix)) {
            throw new UncheckedIOException(new IOException("잘못된 이미지 경로입니다: " + publicUrl));
        }
        return uploadRoot.resolve(Path.of(publicUrl.substring(prefix.length()))).normalize();
    }

    private String storePosterFile(GeminiPosterClient.GeneratedImage generated, Long recordId) {
        try {
            Path targetDir = uploadRoot.resolve(POSTER_SUBDIR);
            Files.createDirectories(targetDir);

            String extension = generated.mimeType().contains("png") ? ".png" : ".jpg";
            String fileName = recordId + "_" + UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(fileName).normalize();

            Files.write(targetPath, generated.bytes());
            return "/uploads/" + POSTER_SUBDIR + "/" + fileName;
        } catch (IOException e) {
            throw new UncheckedIOException("포스터 이미지 저장에 실패했습니다.", e);
        }
    }

    private void deletePhysicalFileIfExists(String publicUrl) {
        if (publicUrl == null || publicUrl.isBlank()) {
            return;
        }
        String prefix = "/uploads/";
        if (!publicUrl.startsWith(prefix)) {
            return;
        }
        try {
            Path relativePath = Path.of(publicUrl.substring(prefix.length()));
            Path filePath = uploadRoot.resolve(relativePath).normalize();
            if (filePath.startsWith(uploadRoot)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            throw new UncheckedIOException("기록 이미지 삭제에 실패했습니다.", e);
        }
    }

    private Integer toRatingInt(Byte rating) {
        return rating == null ? null : rating.intValue();
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        return dotIndex >= 0 ? originalFilename.substring(dotIndex) : "";
    }
}
