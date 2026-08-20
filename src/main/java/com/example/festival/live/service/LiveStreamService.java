package com.example.festival.live.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.live.dto.LiveEventOptionResponse;
import com.example.festival.live.dto.LiveStreamCreateRequest;
import com.example.festival.live.dto.LiveStreamResponse;
import com.example.festival.live.entity.LiveStream;
import com.example.festival.live.entity.LiveStreamStatus;
import com.example.festival.live.repository.LiveStreamRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class LiveStreamService {

    private static final Pattern YOUTUBE_VIDEO_ID = Pattern.compile("^[A-Za-z0-9_-]{11}$");

    private final LiveStreamRepository liveStreamRepository;
    private final EventRepository eventRepository;
    private final MemberRepository memberRepository;

    public LiveStreamService(
            LiveStreamRepository liveStreamRepository,
            EventRepository eventRepository,
            MemberRepository memberRepository
    ) {
        this.liveStreamRepository = liveStreamRepository;
        this.eventRepository = eventRepository;
        this.memberRepository = memberRepository;
    }

    public List<LiveStreamResponse> getLiveStreams() {
        return liveStreamRepository.findAllByStatusOrderByStartAtDesc(LiveStreamStatus.LIVE).stream()
                .map(stream -> toResponse(stream, null))
                .toList();
    }

    public List<LiveStreamResponse> getMyStreams(Long memberId) {
        return liveStreamRepository.findAllByHost_IdOrderByCreatedAtDesc(memberId).stream()
                .map(stream -> toResponse(stream, memberId))
                .toList();
    }

    public List<LiveEventOptionResponse> getEvents() {
        return eventRepository.findAll(Sort.by(Sort.Direction.DESC, "startDate")).stream()
                .map(LiveEventOptionResponse::from)
                .toList();
    }

    public LiveStreamResponse getWatchStream(Long streamId, Long requesterId) {
        LiveStream stream = getStream(streamId);
        if (stream.getStatus() != LiveStreamStatus.LIVE && !stream.isOwnedBy(requesterId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "현재 시청할 수 없는 방송입니다.");
        }
        return toResponse(stream, requesterId);
    }

    @Transactional
    public LiveStreamResponse create(Long memberId, LiveStreamCreateRequest request) {
        Member host = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연 정보를 찾을 수 없습니다."));

        String videoId = extractYoutubeVideoId(request.youtubeUrl());
        String watchUrl = youtubeWatchUrl(videoId);
        String thumbnailUrl = normalize(request.thumbnailUrl());
        if (thumbnailUrl == null) {
            thumbnailUrl = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
        }

        LiveStream stream = LiveStream.create(
                event,
                host,
                request.title().trim(),
                normalize(request.description()),
                thumbnailUrl,
                watchUrl
        );
        return toResponse(liveStreamRepository.save(stream), memberId);
    }

    @Transactional
    public LiveStreamResponse start(Long streamId, Long memberId) {
        LiveStream stream = getOwnedStream(streamId, memberId);
        if (stream.getStatus() != LiveStreamStatus.SCHEDULED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "방송 대기 상태에서만 시작할 수 있습니다.");
        }
        stream.start(LocalDateTime.now());
        return toResponse(stream, memberId);
    }

    @Transactional
    public LiveStreamResponse end(Long streamId, Long memberId) {
        LiveStream stream = getOwnedStream(streamId, memberId);
        if (stream.getStatus() != LiveStreamStatus.LIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "진행 중인 방송만 종료할 수 있습니다.");
        }
        stream.end(LocalDateTime.now());
        return toResponse(stream, memberId);
    }

    @Transactional
    public List<String> endActiveStreamsForLogout(Long memberId) {
        List<LiveStream> activeStreams = liveStreamRepository.findAllByHost_IdAndStatus(
                memberId,
                LiveStreamStatus.LIVE
        );
        LocalDateTime endedAt = LocalDateTime.now();
        activeStreams.forEach(stream -> stream.end(endedAt));
        return activeStreams.stream()
                .map(LiveStream::getStreamUrl)
                .map(this::extractYoutubeVideoId)
                .toList();
    }

    private LiveStream getStream(Long streamId) {
        return liveStreamRepository.findById(streamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방송을 찾을 수 없습니다."));
    }

    private LiveStream getOwnedStream(Long streamId, Long memberId) {
        LiveStream stream = getStream(streamId);
        if (!stream.isOwnedBy(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방송 주최자만 변경할 수 있습니다.");
        }
        return stream;
    }

    private LiveStreamResponse toResponse(LiveStream stream, Long requesterId) {
        String videoId = extractYoutubeVideoId(stream.getStreamUrl());
        Member host = stream.getHost();
        return new LiveStreamResponse(
                stream.getId(),
                stream.getEvent().getEventId(),
                stream.getEvent().getName(),
                stream.getTitle(),
                stream.getDescription(),
                stream.getThumbnailUrl(),
                videoId,
                youtubeWatchUrl(videoId),
                "https://www.youtube.com/embed/" + videoId + "?autoplay=1",
                stream.getStatus(),
                stream.getStartAt(),
                stream.getEndAt(),
                host == null ? null : host.getId(),
                host == null ? "알 수 없는 주최자" : host.getNickname(),
                host == null ? null : host.getProfileImage(),
                stream.isOwnedBy(requesterId),
                stream.getCreatedAt()
        );
    }

    private String extractYoutubeVideoId(String value) {
        String input = value == null ? "" : value.trim();
        if (YOUTUBE_VIDEO_ID.matcher(input).matches()) {
            return input;
        }

        try {
            URI uri = URI.create(input);
            String host = uri.getHost();
            if (host == null) {
                throw invalidYoutubeUrl();
            }
            host = host.toLowerCase(Locale.ROOT);

            String candidate = null;
            if (host.equals("youtu.be") || host.endsWith(".youtu.be")) {
                candidate = firstPathSegment(uri.getPath());
            } else if (host.equals("youtube.com") || host.endsWith(".youtube.com")
                    || host.equals("youtube-nocookie.com") || host.endsWith(".youtube-nocookie.com")) {
                candidate = queryParameter(uri.getRawQuery(), "v");
                if (candidate == null) {
                    List<String> segments = pathSegments(uri.getPath());
                    if (segments.size() >= 2 && List.of("live", "embed", "shorts").contains(segments.getFirst())) {
                        candidate = segments.get(1);
                    }
                }
            }

            if (candidate != null && YOUTUBE_VIDEO_ID.matcher(candidate).matches()) {
                return candidate;
            }
        } catch (IllegalArgumentException ignored) {
            // 아래의 사용자용 오류로 변환한다.
        }
        throw invalidYoutubeUrl();
    }

    private List<String> pathSegments(String path) {
        if (path == null) {
            return List.of();
        }
        return Arrays.stream(path.split("/"))
                .filter(segment -> !segment.isBlank())
                .toList();
    }

    private String firstPathSegment(String path) {
        List<String> segments = pathSegments(path);
        return segments.isEmpty() ? null : segments.getFirst();
    }

    private String queryParameter(String rawQuery, String key) {
        if (rawQuery == null) {
            return null;
        }
        return Arrays.stream(rawQuery.split("&"))
                .map(pair -> pair.split("=", 2))
                .filter(parts -> parts.length == 2 && URLDecoder.decode(parts[0], StandardCharsets.UTF_8).equals(key))
                .map(parts -> URLDecoder.decode(parts[1], StandardCharsets.UTF_8))
                .findFirst()
                .orElse(null);
    }

    private String youtubeWatchUrl(String videoId) {
        return "https://www.youtube.com/watch?v=" + videoId;
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private ResponseStatusException invalidYoutubeUrl() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "올바른 YouTube 영상 주소 또는 11자리 영상 ID를 입력해 주세요."
        );
    }
}
