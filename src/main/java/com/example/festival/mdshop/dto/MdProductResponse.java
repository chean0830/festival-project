package com.example.festival.mdshop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MdProductResponse(
        Long productId,
        String name,
        String category,
        BigDecimal price,
        int stock,
        String imageUrl,
        String status,
        LocalDateTime preorderDeadline,
        String eventName
) {
}
