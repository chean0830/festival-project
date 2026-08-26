package com.example.festival.tradechat.dto;

import java.time.LocalDateTime;

public record TradeChatRoomDto(
        Long roomId,
        Long transactionId,
        String transactionStatus,
        Long listingId,
        String listingTitle,
        String listingImageUrl,
        String listingStatus,
        Long counterpartId,
        String counterpartNickname,
        String counterpartProfileImage,
        boolean blocked,
        boolean blockedByMe,
        boolean counterpartOnline,
        LocalDateTime counterpartLastSeenAt
) {
}
