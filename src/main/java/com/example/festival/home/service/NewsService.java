package com.example.festival.home.service;

import com.example.festival.home.dto.NewsSummaryDto;
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
        return eventNewsRepository.findTop10ByOrderByCreatedAtDesc().stream()
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
