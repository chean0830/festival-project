package com.example.festival.tradechat.dto;

import java.time.LocalDateTime;

public record TradeChatRoomListItemDto(
        Long roomId,
        Long transactionId,
        Long counterpartId,
        String counterpartNickname,
        String counterpartProfileImage,
        String listingTitle,
        String listingImageUrl,
        String listingStatus,
        String transactionStatus,
        String lastMessage,
        String lastMessageType,
        LocalDateTime lastMessageAt,
        long unreadCount,
        boolean counterpartOnline,
        LocalDateTime counterpartLastSeenAt
) {
}
