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
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FestivalRecordService {

    private static final String RECORD_IMAGE_SUBDIR = "festival-record";
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final FestivalRecordRepository festivalRecordRepository;
    private final RecordImageRepository recordImageRepository;
    private final RecordSongRepository recordSongRepository;
    private final RecordFoodRepository recordFoodRepository;
    private final RecordShareRepository recordShareRepository;
    private final MemberRepository memberRepository;
    private final EventRepository eventRepository;
    private final Path uploadRoot;

    public FestivalRecordService(
            FestivalRecordRepository festivalRecordRepository,
            RecordImageRepository recordImageRepository,
            RecordSongRepository recordSongRepository,
            RecordFoodRepository recordFoodRepository,
            RecordShareRepository recordShareRepository,
            MemberRepository memberRepository,
            EventRepository eventRepository,
            @Value("${file.upload-dir:uploads}") String uploadDir
    ) {
        this.festivalRecordRepository = festivalRecordRepository;
        this.recordImageRepository = recordImageRepository;
        this.recordSongRepository = recordSongRepository;
        this.recordFoodRepository = recordFoodRepository;
        this.recordShareRepository = recordShareRepository;
        this.memberRepository = memberRepository;
        this.eventRepository = eventRepository;
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

        recordImageRepository.findAllByRecord_RecordIdOrderByImageIdAsc(record.getRecordId())
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
        recordImageRepository.save(RecordImage.of(record, publicUrl));

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
    public FestivalRecordResponse shareRecord(Long memberId, Long recordId, ShareRequest request) {
        FestivalRecord record = getOwnedRecordOrThrow(memberId, recordId);
        recordShareRepository.save(RecordShare.of(record, request.platform(), request.shareUrl()));
        record.markShared();
        return toResponse(record);
    }

    private void replaceSongs(FestivalRecord record, List<SongInput> songs) {
        recordSongRepository.deleteAllByRecord_RecordId(record.getRecordId());
        if (songs == null || songs.isEmpty()) {
            return;
        }
        List<RecordSong> entities = songs.stream()
                .map(song -> RecordSong.of(record, song.songTitle(), song.artistName()))
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
                event.getPosterImage(),
                record.getTitle(),
                toRatingInt(record.getRating()),
                record.getOneLineReview(),
                record.getCreatedAt()
        );
    }

    private FestivalRecordResponse toResponse(FestivalRecord record) {
        Event event = record.getEvent();

        List<RecordImageResponse> images = recordImageRepository.findAllByRecord_RecordIdOrderByImageIdAsc(record.getRecordId()).stream()
                .map(image -> new RecordImageResponse(image.getImageId(), image.getImageUrl()))
                .toList();
        List<RecordSongResponse> songs = recordSongRepository.findAllByRecord_RecordId(record.getRecordId()).stream()
                .map(song -> new RecordSongResponse(song.getSongId(), song.getSongTitle(), song.getArtistName()))
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
