package com.example.festival.usedtrade.controller;

import com.example.festival.usedtrade.dto.UsedImageUploadResponse;
import com.example.festival.usedtrade.dto.UsedLikeStatusResponse;
import com.example.festival.usedtrade.dto.UsedListingCreateRequest;
import com.example.festival.usedtrade.dto.UsedListingDetailResponse;
import com.example.festival.usedtrade.dto.UsedListingPageResponse;
import com.example.festival.usedtrade.dto.UsedListingStatusUpdateRequest;
import com.example.festival.usedtrade.dto.UsedListingSummaryResponse;
import com.example.festival.usedtrade.dto.UsedTransactionResponse;
import com.example.festival.usedtrade.service.UsedTradeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

/**
 * MD 중고거래 매물 조회/등록, 찜, 구매 요청/승인/완료/취소 API.
 * 로그인/인증이 아직 SecurityContext 기반이 아니라, memberId를 경로로 직접 받는
 * 프로젝트 전반의 다른 컨트롤러들과 같은 방식으로 설계했다.
 */
@RestController
public class UsedTradeController {

    private final UsedTradeService usedTradeService;

    public UsedTradeController(UsedTradeService usedTradeService) {
        this.usedTradeService = usedTradeService;
    }

    @GetMapping("/api/used/listings")
    public UsedListingPageResponse getListings(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "false") boolean onSaleOnly,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return usedTradeService.getListings(category, tag, keyword, minPrice, maxPrice, onSaleOnly, sellerId, sort, page, size);
    }

    @GetMapping("/api/used/listings/{listingId}")
    public UsedListingDetailResponse getListing(@PathVariable Long listingId) {
        return usedTradeService.getListing(listingId);
    }

    @PostMapping("/api/members/{memberId}/used/listings/image")
    public ResponseEntity<UsedImageUploadResponse> uploadListingImage(
            @PathVariable Long memberId,
            @RequestParam("file") MultipartFile file
    ) {
        UsedImageUploadResponse response = usedTradeService.uploadListingImage(memberId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/api/members/{memberId}/used/listings")
    public ResponseEntity<UsedListingDetailResponse> createListing(
            @PathVariable Long memberId,
            @Valid @RequestBody UsedListingCreateRequest request
    ) {
        UsedListingDetailResponse response = usedTradeService.createListing(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/members/{memberId}/used/listings")
    public List<UsedListingSummaryResponse> getMyListings(@PathVariable Long memberId) {
        return usedTradeService.getMyListings(memberId);
    }

    @PutMapping("/api/members/{memberId}/used/listings/{listingId}")
    public UsedListingDetailResponse updateListing(
            @PathVariable Long memberId,
            @PathVariable Long listingId,
            @Valid @RequestBody UsedListingCreateRequest request
    ) {
        return usedTradeService.updateListing(memberId, listingId, request);
    }

    @PatchMapping("/api/members/{memberId}/used/listings/{listingId}/status")
    public UsedListingDetailResponse changeListingStatus(
            @PathVariable Long memberId,
            @PathVariable Long listingId,
            @Valid @RequestBody UsedListingStatusUpdateRequest request
    ) {
        return usedTradeService.changeListingStatus(memberId, listingId, request.status());
    }

    @DeleteMapping("/api/members/{memberId}/used/listings/{listingId}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long memberId, @PathVariable Long listingId) {
        usedTradeService.deleteListing(memberId, listingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/members/{memberId}/used/listings/{listingId}/like")
    public UsedLikeStatusResponse getLikeStatus(@PathVariable Long memberId, @PathVariable Long listingId) {
        return usedTradeService.getLikeStatus(memberId, listingId);
    }

    @PostMapping("/api/members/{memberId}/used/listings/{listingId}/like")
    public ResponseEntity<UsedLikeStatusResponse> likeListing(@PathVariable Long memberId, @PathVariable Long listingId) {
        UsedLikeStatusResponse response = usedTradeService.likeListing(memberId, listingId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/api/members/{memberId}/used/listings/{listingId}/like")
    public ResponseEntity<Void> unlikeListing(@PathVariable Long memberId, @PathVariable Long listingId) {
        usedTradeService.unlikeListing(memberId, listingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/members/{memberId}/used/likes")
    public List<UsedListingSummaryResponse> getLikedListings(@PathVariable Long memberId) {
        return usedTradeService.getLikedListings(memberId);
    }

    @PostMapping("/api/members/{memberId}/used/transactions/{listingId}")
    public ResponseEntity<UsedTransactionResponse> requestPurchase(@PathVariable Long memberId, @PathVariable Long listingId) {
        UsedTransactionResponse response = usedTradeService.requestPurchase(memberId, listingId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/members/{memberId}/used/transactions/buying")
    public List<UsedTransactionResponse> getMyPurchaseRequests(@PathVariable Long memberId) {
        return usedTradeService.getMyPurchaseRequests(memberId);
    }

    @GetMapping("/api/members/{memberId}/used/transactions/selling")
    public List<UsedTransactionResponse> getReceivedPurchaseRequests(@PathVariable Long memberId) {
        return usedTradeService.getReceivedPurchaseRequests(memberId);
    }

    @PostMapping("/api/members/{memberId}/used/transactions/{transactionId}/approve")
    public UsedTransactionResponse approveTransaction(@PathVariable Long memberId, @PathVariable Long transactionId) {
        return usedTradeService.approveTransaction(memberId, transactionId);
    }

    @PostMapping("/api/members/{memberId}/used/transactions/{transactionId}/complete")
    public UsedTransactionResponse completeTransaction(@PathVariable Long memberId, @PathVariable Long transactionId) {
        return usedTradeService.completeTransaction(memberId, transactionId);
    }

    @PostMapping("/api/members/{memberId}/used/transactions/{transactionId}/cancel")
    public UsedTransactionResponse cancelTransaction(@PathVariable Long memberId, @PathVariable Long transactionId) {
        return usedTradeService.cancelTransaction(memberId, transactionId);
    }
}
