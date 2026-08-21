package com.example.festival.home.service;

import com.example.festival.home.dto.NewsSummaryDto;
import com.example.festival.news.entity.EventNews;
import com.example.festival.news.repository.EventNewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsService {

    private final EventNewsRepository eventNewsRepository;

    public List<NewsSummaryDto> getRecentNews() {
        return toDtoList(eventNewsRepository.findTop10ByOrderByCreatedAtDesc());
    }

    public List<NewsSummaryDto> getAllNews() {
        return toDtoList(eventNewsRepository.findAllByOrderByCreatedAtDesc());
    }

    private List<NewsSummaryDto> toDtoList(List<EventNews> newsList) {
        return newsList.stream()
                .map(news -> new NewsSummaryDto(
                        news.getNewsId(),
                        news.getTitle(),
                        news.getImageUrl(),
                        news.getSourceUrl(),
                        news.getNewsType(),
                        news.getCreatedAt()
                ))
                .toList();
    }
}
