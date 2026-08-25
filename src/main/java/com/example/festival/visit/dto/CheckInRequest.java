package com.example.festival.visit.dto;

import jakarta.validation.constraints.NotNull;

public record CheckInRequest(
        @NotNull(message = "공연을 선택해주세요.")
        Long eventId,

        @NotNull(message = "위치 정보가 필요해요.")
        Double latitude,

        @NotNull(message = "위치 정보가 필요해요.")
        Double longitude
) {
}
