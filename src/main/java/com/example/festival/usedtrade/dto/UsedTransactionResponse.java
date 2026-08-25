package com.example.festival.usedtrade.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UsedTransactionResponse(
        Long transactionId,
        Long listingId,
        String listingTitle,
        String listingImageUrl,
        Long buyerId,
        String buyerNickname,
        Long sellerId,
        String sellerNickname,
        BigDecimal price,
        String status,
        LocalDateTime createdAt,
        LocalDateTime completedAt
) {
}
