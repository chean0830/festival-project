package com.example.festival.usedtrade.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record UsedListingDetailResponse(
        Long listingId,
        String title,
        String category,
        String tags,
        String description,
        BigDecimal price,
        String condition,
        String tradeMethod,
        String region,
        List<String> imageUrls,
        String status,
        Long sellerId,
        String sellerNickname,
        long likeCount,
        LocalDateTime createdAt
) {
}
