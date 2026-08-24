package com.example.festival.visit.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.venue.entity.Venue;
import com.example.festival.visit.dto.CheckInRequest;
import com.example.festival.visit.dto.CheckInResponse;
import com.example.festival.visit.dto.VisitPinDto;
import com.example.festival.visit.entity.EventVisit;
import com.example.festival.visit.repository.EventVisitRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 페스티벌 방문 GPS 체크인 + 방문 지도 조회.
 */
@Service
@Transactional(readOnly = true)
public class VisitService {

    private static final double CHECK_IN_RADIUS_METERS = 500;
    private static final double EARTH_RADIUS_METERS = 6371000;

    private final EventVisitRepository eventVisitRepository;
    private final EventRepository eventRepository;
    private final MemberRepository memberRepository;

    public VisitService(
            EventVisitRepository eventVisitRepository,
            EventRepository eventRepository,
            MemberRepository memberRepository
    ) {
        this.eventVisitRepository = eventVisitRepository;
        this.eventRepository = eventRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public CheckInResponse checkIn(Long memberId, CheckInRequest request) {
        Member member = getMemberOrThrow(memberId);
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        if (today.isBefore(event.getStartDate()) || today.isAfter(event.getEndDate())) {
            return new CheckInResponse(false, "공연 기간이 아니에요.", null);
        }

        Venue venue = event.getVenue();
        if (venue.getLatitude() == null || venue.getLongitude() == null) {
            return new CheckInResponse(false, "이 공연장은 위치 정보가 등록되어 있지 않아요.", null);
        }

        int distance = (int) Math.round(distanceMeters(
                venue.getLatitude().doubleValue(), venue.getLongitude().doubleValue(),
                request.latitude(), request.longitude()
        ));

        if (distance > CHECK_IN_RADIUS_METERS) {
            return new CheckInResponse(false, "공연장 근처에서만 체크인할 수 있어요.", distance);
        }

        EventVisit visit = eventVisitRepository
                .findFirstByMember_IdAndEvent_EventId(memberId, event.getEventId())
                .orElse(null);

        if (visit == null) {
            eventVisitRepository.save(new EventVisit(member, event, LocalDateTime.now(), true, true));
        } else if (!visit.isVerified()) {
            visit.verify();
        }

        return new CheckInResponse(true, "체크인 완료!", distance);
    }

    public List<VisitPinDto> getVisitPins(Long memberId) {
        getMemberOrThrow(memberId);
        return eventVisitRepository.findAllVerifiedByMemberIdWithEvent(memberId).stream()
                .map(this::toPinDto)
                .toList();
    }

    private VisitPinDto toPinDto(EventVisit visit) {
        Event event = visit.getEvent();
        Venue venue = event.getVenue();
        return new VisitPinDto(
                event.getEventId(),
                event.getName(),
                venue.getName(),
                venue.getLatitude() != null ? venue.getLatitude().doubleValue() : null,
                venue.getLongitude() != null ? venue.getLongitude().doubleValue() : null,
                event.getStartDate(),
                event.getEndDate()
        );
    }

    private double distanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double sinLat = Math.sin(dLat / 2);
        double sinLng = Math.sin(dLng / 2);
        double h = sinLat * sinLat + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * sinLng * sinLng;
        return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
    }

    private Member getMemberOrThrow(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }
}
