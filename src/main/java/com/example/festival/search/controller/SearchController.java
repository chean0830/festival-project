package com.example.festival.search.controller;

import com.example.festival.search.dto.SearchResultDto;
import com.example.festival.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 아티스트 / 페스티벌 / 공연 통합 검색 API.
 */
@RestController
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/api/search")
    public List<SearchResultDto> search(@RequestParam(name = "q", defaultValue = "") String query) {
        return searchService.search(query);
    }
}
