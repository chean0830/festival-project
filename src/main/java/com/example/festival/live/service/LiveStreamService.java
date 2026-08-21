package com.example.festival.live.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.live.dto.LiveEventOptionResponse;
import com.example.festival.live.dto.LiveStreamCreateRequest;
import com.example.festival.live.dto.LiveStreamResponse;
import com.example.festival.live.entity.LiveSourceType;
import com.example.festival.live.entity.LiveStream;
import com.example.festival.live.entity.LiveStreamStatus;
import com.example.festival.live.repository.LiveStreamRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.entity.MemberRole;
import com.example.festival.member.repository.MemberRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class LiveStreamService {

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
        requireAdmin(memberId);
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
        if (stream.getStatus() != LiveStreamStatus.LIVE && !isManagedBy(stream, requesterId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "현재 시청할 수 없는 방송입니다.");
        }
        return toResponse(stream, requesterId);
    }

    @Transactional
    public LiveStreamResponse create(Long memberId, LiveStreamCreateRequest request) {
        Member host = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));
        verifyAdmin(host);
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연 정보를 찾을 수 없습니다."));

        String thumbnailUrl = normalize(request.thumbnailUrl());
        if (thumbnailUrl == null) {
            thumbnailUrl = "/favicon.svg";
        }

        LiveStream stream = LiveStream.create(
                event,
                host,
                request.title().trim(),
                normalize(request.description()),
                thumbnailUrl,
                LiveSourceType.BROWSER,
                null
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
    public LiveStreamResponse changeChatEnabled(Long streamId, Long memberId, boolean enabled) {
        LiveStream stream = getOwnedStream(streamId, memberId);
        if (stream.getStatus() == LiveStreamStatus.ENDED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "종료된 방송의 채팅 설정은 변경할 수 없습니다.");
        }
        stream.changeChatEnabled(enabled);
        return toResponse(stream, memberId);
    }

    @Transactional
    public boolean endActiveStreamsForLogout(Long memberId) {
        List<LiveStream> activeStreams = liveStreamRepository.findAllByHost_IdAndStatus(
                memberId,
                LiveStreamStatus.LIVE
        );
        LocalDateTime endedAt = LocalDateTime.now();
        activeStreams.forEach(stream -> stream.end(endedAt));
        return !activeStreams.isEmpty();
    }

    private LiveStream getStream(Long streamId) {
        return liveStreamRepository.findById(streamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방송을 찾을 수 없습니다."));
    }

    private LiveStream getOwnedStream(Long streamId, Long memberId) {
        LiveStream stream = getStream(streamId);
        if (!isManagedBy(stream, memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방송 주최자만 변경할 수 있습니다.");
        }
        return stream;
    }

    private Member requireAdmin(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));
        verifyAdmin(member);
        return member;
    }

    private void verifyAdmin(Member member) {
        if (member.getRole() != MemberRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자만 라이브 방송을 관리할 수 있습니다.");
        }
    }

    private boolean isManagedBy(LiveStream stream, Long requesterId) {
        Member host = stream.getHost();
        return stream.isOwnedBy(requesterId)
                && host != null
                && host.getRole() == MemberRole.ADMIN;
    }

    private LiveStreamResponse toResponse(LiveStream stream, Long requesterId) {
        Member host = stream.getHost();
        return new LiveStreamResponse(
                stream.getId(),
                stream.getEvent().getEventId(),
                stream.getEvent().getName(),
                stream.getTitle(),
                stream.getDescription(),
                stream.getThumbnailUrl(),
                stream.getSourceType(),
                stream.getStatus(),
                stream.getStartAt(),
                stream.getEndAt(),
                host == null ? null : host.getId(),
                host == null ? "알 수 없는 주최자" : host.getNickname(),
                host == null ? null : host.getProfileImage(),
                isManagedBy(stream, requesterId),
                stream.isChatEnabled(),
                stream.getCreatedAt()
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
