package com.example.festival.weather.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * OpenWeatherMap "5 Day / 3 Hour Forecast" 응답 중 우리가 쓰는 필드만 매핑.
 * https://openweathermap.org/forecast5
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OwmForecastResponse(List<Entry> list) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Entry(String dt_txt, Main main, List<Weather> weather, Double pop) {

        @JsonIgnoreProperties(ignoreUnknown = true)
        public record Main(Double temp_min, Double temp_max) {
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public record Weather(String main, String description, String icon) {
        }
    }
}
