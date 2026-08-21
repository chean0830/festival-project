package com.example.festival.home.controller;

import com.example.festival.home.dto.NewsSummaryDto;
import com.example.festival.home.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 홈 화면 뉴스 섹션용 API.
 */
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/news")
    public List<NewsSummaryDto> getRecentNews() {
        return newsService.getRecentNews();
    }
}
