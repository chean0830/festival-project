package com.example.festival.venue.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * 카카오 로컬 API 주소 검색(address.json) 응답 매핑.
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide#address-coord
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record KakaoAddressSearchResponse(
        List<Document> documents
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Document(
            @JsonProperty("x") String longitude,
            @JsonProperty("y") String latitude
    ) {
    }
}
