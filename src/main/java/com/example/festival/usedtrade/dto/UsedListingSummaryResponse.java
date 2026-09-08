package com.example.festival.usedtrade.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UsedListingSummaryResponse(
        Long listingId,
        String title,
        String category,
        String tags,
        BigDecimal price,
        String imageUrl,
        String status,
        String region,
        String sellerNickname,
        long likeCount,
        LocalDateTime createdAt
) {
}
