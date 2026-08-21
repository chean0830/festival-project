package com.example.festival.interest.service;

import com.example.festival.artist.entity.Artist;
import com.example.festival.artist.repository.ArtistRepository;
import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.interest.dto.InterestStatusResponse;
import com.example.festival.interest.dto.InterestedArtistResponse;
import com.example.festival.interest.dto.InterestedEventResponse;
import com.example.festival.interest.entity.MemberArtist;
import com.example.festival.interest.entity.MemberEvent;
import com.example.festival.interest.repository.MemberArtistRepository;
import com.example.festival.interest.repository.MemberEventRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * 관심 아티스트 / 관심 공연(하트) 담당 API.
 * member_artist, member_event 테이블에 대한 등록/조회/삭제를 모두 이곳에서 처리한다.
 */
@Service
@Transactional(readOnly = true)
public class InterestService {

    private static final String EVENT_INTEREST_STATUS = "INTERESTED";

    private final MemberRepository memberRepository;
    private final ArtistRepository artistRepository;
    private final EventRepository eventRepository;
    private final MemberArtistRepository memberArtistRepository;
    private final MemberEventRepository memberEventRepository;

    public InterestService(
            MemberRepository memberRepository,
            ArtistRepository artistRepository,
            EventRepository eventRepository,
            MemberArtistRepository memberArtistRepository,
            MemberEventRepository memberEventRepository
    ) {
        this.memberRepository = memberRepository;
        this.artistRepository = artistRepository;
        this.eventRepository = eventRepository;
        this.memberArtistRepository = memberArtistRepository;
        this.memberEventRepository = memberEventRepository;
    }

    public List<InterestedArtistResponse> getInterestedArtists(Long memberId) {
        getMemberOrThrow(memberId);
        return memberArtistRepository.findAllByMemberIdWithArtist(memberId).stream()
                .map(this::toInterestedArtistResponse)
                .toList();
    }

    public InterestStatusResponse getInterestedArtistStatus(Long memberId, Long artistId) {
        getMemberOrThrow(memberId);
        boolean interested = memberArtistRepository.findByMember_IdAndArtist_ArtistId(memberId, artistId).isPresent();
        return new InterestStatusResponse(interested);
    }

    @Transactional
    public InterestedArtistResponse addInterestedArtist(Long memberId, Long artistId) {
        Member member = getMemberOrThrow(memberId);
        MemberArtist existing = memberArtistRepository.findByMember_IdAndArtist_ArtistId(memberId, artistId).orElse(null);
        if (existing != null) {
            return toInterestedArtistResponse(existing);
        }

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "아티스트를 찾을 수 없습니다."));

        MemberArtist memberArtist = memberArtistRepository.save(new MemberArtist(member, artist));
        return toInterestedArtistResponse(memberArtist);
    }

    @Transactional
    public void removeInterestedArtist(Long memberId, Long artistId) {
        getMemberOrThrow(memberId);
        long deleted = memberArtistRepository.deleteByMember_IdAndArtist_ArtistId(memberId, artistId);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "관심 가수 등록 내역을 찾을 수 없습니다.");
        }
    }

    public List<InterestedEventResponse> getInterestedEvents(Long memberId) {
        getMemberOrThrow(memberId);
        return memberEventRepository.findAllByMemberIdWithEvent(memberId).stream()
                .map(this::toInterestedEventResponse)
                .toList();
    }

    public InterestStatusResponse getInterestedEventStatus(Long memberId, Long eventId) {
        getMemberOrThrow(memberId);
        boolean interested = memberEventRepository.findByMember_IdAndEvent_EventId(memberId, eventId).isPresent();
        return new InterestStatusResponse(interested);
    }

    @Transactional
    public InterestedEventResponse addInterestedEvent(Long memberId, Long eventId) {
        Member member = getMemberOrThrow(memberId);
        MemberEvent existing = memberEventRepository.findByMember_IdAndEvent_EventId(memberId, eventId).orElse(null);
        if (existing != null) {
            return toInterestedEventResponse(existing);
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));

        MemberEvent memberEvent = memberEventRepository.save(new MemberEvent(member, event, EVENT_INTEREST_STATUS));
        return toInterestedEventResponse(memberEvent);
    }

    @Transactional
    public void removeInterestedEvent(Long memberId, Long eventId) {
        getMemberOrThrow(memberId);
        long deleted = memberEventRepository.deleteByMember_IdAndEvent_EventId(memberId, eventId);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "관심 공연 등록 내역을 찾을 수 없습니다.");
        }
    }

    private Member getMemberOrThrow(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }

    private InterestedArtistResponse toInterestedArtistResponse(MemberArtist memberArtist) {
        Artist artist = memberArtist.getArtist();
        return new InterestedArtistResponse(
                artist.getArtistId(),
                artist.getName(),
                artist.getArtistType(),
                artist.getProfileImage()
        );
    }

    private InterestedEventResponse toInterestedEventResponse(MemberEvent memberEvent) {
        Event event = memberEvent.getEvent();
        return new InterestedEventResponse(
                event.getEventId(),
                event.getName(),
                event.getPosterImage(),
                event.getStartDate(),
                event.getEndDate(),
                event.getStatus(),
                memberEvent.getStatus()
        );
    }
}
