package com.example.festival.nearby.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * 카카오 로컬 API 카테고리 검색(category.json) 응답 매핑.
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-category
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record KakaoCategoryResponse(
        List<Document> documents
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Document(
            @JsonProperty("id") String id,
            @JsonProperty("place_name") String placeName,
            @JsonProperty("category_name") String categoryName,
            @JsonProperty("phone") String phone,
            @JsonProperty("address_name") String addressName,
            @JsonProperty("road_address_name") String roadAddressName,
            @JsonProperty("x") String longitude,
            @JsonProperty("y") String latitude,
            @JsonProperty("place_url") String placeUrl,
            @JsonProperty("distance") String distance
    ) {
    }
}
