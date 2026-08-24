package com.example.festival.weather.dto;

/**
 * 공연 날짜의 날씨 예보. available=false면 이유는 message에 담겨서 나감
 * (예보 기간 밖 / 위치 정보 없음 / API 조회 실패 등).
 */
public record WeatherForecastResponse(
        boolean available,
        String message,
        Double minTemp,
        Double maxTemp,
        Integer rainChancePercent,
        String description,
        String icon
) {
    public static WeatherForecastResponse unavailable(String message) {
        return new WeatherForecastResponse(false, message, null, null, null, null, null);
    }
}
