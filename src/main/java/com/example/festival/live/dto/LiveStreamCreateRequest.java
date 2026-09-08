package com.example.festival.live.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record LiveStreamCreateRequest(
        @NotNull(message = "공연을 선택해 주세요.")
        Long eventId,

        @NotBlank(message = "방송 제목을 입력해 주세요.")
        @Size(max = 200, message = "방송 제목은 200자 이하로 입력해 주세요.")
        String title,

        @Size(max = 1000, message = "방송 설명은 1000자 이하로 입력해 주세요.")
        String description,

        @Size(max = 500, message = "썸네일 주소가 너무 깁니다.")
        String thumbnailUrl,

        @NotNull(message = "입장료 설정을 확인해 주세요.")
        BigDecimal entranceFee
) {
}
