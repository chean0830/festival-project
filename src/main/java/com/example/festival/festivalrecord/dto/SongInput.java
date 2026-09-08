package com.example.festival.festivalrecord.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SongInput(
        @NotBlank(message = "곡 제목을 입력해주세요.")
        @Size(max = 200)
        String songTitle,

        @Size(max = 100)
        String artistName,

        @Size(max = 500)
        String albumCoverUrl
) {
}
