package com.example.festival.mdshop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MdOrderResponse(
        Long orderId,
        String orderNumber,
        Long productId,
        String productName,
        String productImageUrl,
        int quantity,
        BigDecimal totalPrice,
        String shippingName,
        String shippingAddress,
        String shippingPhone,
        String status,
        LocalDateTime createdAt
) {
}
