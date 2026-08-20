package com.example.festival.festivalrecord.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record FestivalRecordRequest(
        @NotNull(message = "공연을 선택해주세요.")
        Long eventId,

        @Size(max = 200)
        String title,

        String content,

        @Min(1)
        @Max(5)
        Integer rating,

        @Size(max = 200)
        String oneLineReview,

        @Size(max = 500)
        String memo,

        @Size(max = 300)
        String hashtag,

        @Valid
        List<SongInput> songs,

        List<@Size(max = 200) String> foods
) {
}
