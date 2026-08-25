package com.example.festival.usedtrade.dto;

import java.util.List;

public record UsedListingPageResponse(
        List<UsedListingSummaryResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {
}
