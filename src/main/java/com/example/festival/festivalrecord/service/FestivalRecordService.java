package com.example.festival.festivalrecord.service;

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
import com.example.festival.festivalrecord.entity.RecordFood;
import com.example.festival.festivalrecord.entity.RecordImage;
import com.example.festival.festivalrecord.entity.RecordShare;
import com.example.festival.festivalrecord.entity.RecordSong;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FestivalRecordService {

    private static final String RECORD_IMAGE_SUBDIR = "festival-record";
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final int FREE_POSTER_REGEN_LIMIT = 3;
    private static final String RECORD_REMINDER_TYPE = "RECORD_REMINDER";

    private final FestivalRecordRepository festivalRecordRepository;
    private final RecordImageRepository recordImageRepository;
    private final RecordSongRepository recordSongRepository;
    private final RecordFoodRepository recordFoodRepository;
    private final RecordShareRepository recordShareRepository;
    private final MemberRepository memberRepository;
    private final EventRepository eventRepository;
    private final EventVisitRepository eventVisitRepository;
    private final NotificationService notificationService;
    private final Path uploadRoot;

    public FestivalRecordService(
            FestivalRecordRepository festivalRecordRepository,
            RecordImageRepository recordImageRepository,
            RecordSongRepository recordSongRepository,
            RecordFoodRepository recordFoodRepository,
            RecordShareRepository recordShareRepository,
            MemberRepository memberRepository,
            EventRepository eventRepository,
            EventVisitRepository eventVisitRepository,
            NotificationService notificationService,
            @Value("${file.upload-dir:uploads}") String uploadDir
    ) {
        this.festivalRecordRepository = festivalRecordRepository;
        this.recordImageRepository = recordImageRepository;
        this.recordSongRepository = recordSongRepository;
        this.recordFoodRepository = recordFoodRepository;
        this.recordShareRepository = recordShareRepository;
        this.memberRepository = memberRepository;
        this.eventRepository = eventRepository;
        this.eventVisitRepository = eventVisitRepository;
        this.notificationService = notificationService;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
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

        FestivalRecord record = FestivalRecord.create(member, event);
        record.updateContent(request.title(), request.content(), request.rating(),
                request.oneLineReview(), request.memo(), request.hashtag());
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
            record.changeEvent(getEventOrThrow(request.eventId()));
        }
        record.updateContent(request.title(), request.content(), request.rating(),
                request.oneLineReview(), request.memo(), request.hashtag());

        replaceSongs(record, request.songs());
        replaceFoods(record, request.foods());

        return toResponse(record);
    }

    @Transactional
    public void deleteRecord(Long memberId, Long recordId) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);

        recordImageRepository.findAllByRecord_RecordIdOrderByDisplayOrderAscImageIdAsc(record.getRecordId())
                .forEach(image -> deletePhysicalFileIfExists(image.getImageUrl()));

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

    @Transactional
    public FestivalRecordResponse regeneratePoster(Long memberId, Long recordId) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);
        if (record.getAiRegeneratedCount() >= FREE_POSTER_REGEN_LIMIT) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "무료 재생성 횟수를 모두 사용했습니다.");
        }
        record.incrementAiRegeneratedCount();
        return toResponse(record);
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
                record.isShared(),
                record.getAiRegeneratedCount(),
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
