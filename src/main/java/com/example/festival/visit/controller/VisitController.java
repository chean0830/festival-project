package com.example.festival.visit.controller;

import com.example.festival.visit.dto.CheckInRequest;
import com.example.festival.visit.dto.CheckInResponse;
import com.example.festival.visit.dto.VisitPinDto;
import com.example.festival.visit.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 페스티벌 방문 GPS 체크인 + 방문 지도용 API.
 */
@RestController
@RequestMapping("/api/members/{memberId}/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @PostMapping("/check-in")
    public CheckInResponse checkIn(@PathVariable Long memberId, @Valid @RequestBody CheckInRequest request) {
        return visitService.checkIn(memberId, request);
    }

    @GetMapping("/map")
    public List<VisitPinDto> getVisitPins(@PathVariable Long memberId) {
        return visitService.getVisitPins(memberId);
    }
}
