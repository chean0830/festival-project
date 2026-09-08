package com.example.festival.usedtrade.service;

import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.notification.service.NotificationService;
import com.example.festival.usedtrade.dto.UsedImageUploadResponse;
import com.example.festival.usedtrade.dto.UsedLikeStatusResponse;
import com.example.festival.usedtrade.dto.UsedListingCreateRequest;
import com.example.festival.usedtrade.dto.UsedListingDetailResponse;
import com.example.festival.usedtrade.dto.UsedListingPageResponse;
import com.example.festival.usedtrade.dto.UsedListingSummaryResponse;
import com.example.festival.usedtrade.dto.UsedTransactionResponse;
import com.example.festival.usedtrade.entity.UsedListing;
import com.example.festival.usedtrade.entity.UsedLike;
import com.example.festival.usedtrade.entity.UsedTransaction;
import com.example.festival.usedtrade.entity.UsedTransactionPayment;
import com.example.festival.usedtrade.repository.UsedLikeRepository;
import com.example.festival.usedtrade.repository.UsedListingRepository;
import com.example.festival.usedtrade.repository.UsedTransactionPaymentRepository;
import com.example.festival.usedtrade.repository.UsedTransactionRepository;
import com.example.festival.payment.TossPaymentClient;
import com.example.festival.payment.dto.TossConfirmResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * MD 중고거래 매물 조회/등록, 찜, 구매 요청/승인/결제/완료/취소.
 * 구매 요청은 REQUEST -> APPROVED -> PAID -> COMPLETED 순으로 진행되며,
 * 판매자가 승인(APPROVED)한 뒤 구매자가 Toss Payments로 결제해야(PAID) 거래완료 처리할 수 있다.
 * 아티스트/공연 테이블과는 정식으로 연결하지 않고, tags(해시태그)로 검색만 지원한다.
 * 실시간 채팅(trade_chat)은 별도 작업으로, 이 서비스 범위에 포함하지 않는다.
 */
@Service
@Transactional(readOnly = true)
public class UsedTradeService {

    private static final Set<String> VALID_CATEGORIES = Set.of(
            "CLOTHING", "ALBUM", "FASHION_GOODS", "POSTER_PRINT",
            "CHARACTER_GOODS", "LIVING_GOODS", "ACCESSORY", "SLOGAN_TOWEL"
    );

    private static final String LISTING_ON_SALE = "ON_SALE";
    private static final String LISTING_RESERVED = "RESERVED";
    private static final String LISTING_SOLD = "SOLD";
    private static final String LISTING_CANCELED = "CANCELED";
    private static final Set<String> MANUAL_STATUSES = Set.of(LISTING_ON_SALE, LISTING_RESERVED, LISTING_SOLD);

    private static final String SORT_NEWEST = "NEWEST";
    private static final String SORT_PRICE_ASC = "PRICE_ASC";
    private static final String SORT_PRICE_DESC = "PRICE_DESC";
    private static final String SORT_POPULAR = "POPULAR";
    private static final Set<String> VALID_SORTS = Set.of(SORT_NEWEST, SORT_PRICE_ASC, SORT_PRICE_DESC, SORT_POPULAR);
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 60;

    private static final String TX_REQUEST = "REQUEST";
    private static final String TX_APPROVED = "APPROVED";
    private static final String TX_PAID = "PAID";
    private static final String TX_COMPLETED = "COMPLETED";
    private static final String TX_CANCELED = "CANCELED";

    private static final String NOTIFICATION_TYPE_TX_REQUEST = "USED_TX_REQUEST";
    private static final String NOTIFICATION_TYPE_TX_APPROVED = "USED_TX_APPROVED";
    private static final String NOTIFICATION_TYPE_TX_PAID = "USED_TX_PAID";
    private static final String NOTIFICATION_TYPE_TX_COMPLETED = "USED_TX_COMPLETED";
    private static final String NOTIFICATION_TYPE_TX_CANCELED = "USED_TX_CANCELED";

    private static final String LISTING_IMAGE_SUBDIR = "usedtrade";
    private static final String IMAGE_DELIMITER = ",";
    private static final List<String> ALLOWED_IMAGE_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final UsedListingRepository usedListingRepository;
    private final UsedLikeRepository usedLikeRepository;
    private final UsedTransactionRepository usedTransactionRepository;
    private final UsedTransactionPaymentRepository usedTransactionPaymentRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;
    private final TossPaymentClient tossPaymentClient;
    private final Path uploadRoot;

    public UsedTradeService(
            UsedListingRepository usedListingRepository,
            UsedLikeRepository usedLikeRepository,
            UsedTransactionRepository usedTransactionRepository,
            UsedTransactionPaymentRepository usedTransactionPaymentRepository,
            MemberRepository memberRepository,
            NotificationService notificationService,
            TossPaymentClient tossPaymentClient,
            @Value("${file.upload-dir:uploads}") String uploadDir
    ) {
        this.usedListingRepository = usedListingRepository;
        this.usedLikeRepository = usedLikeRepository;
        this.usedTransactionRepository = usedTransactionRepository;
        this.usedTransactionPaymentRepository = usedTransactionPaymentRepository;
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
        this.tossPaymentClient = tossPaymentClient;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public UsedImageUploadResponse uploadListingImage(Long memberId, MultipartFile file) {
        getMemberOrThrow(memberId);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일이 비어 있습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg, png, webp, gif 형식의 이미지만 등록할 수 있습니다.");
        }

        try {
            Path targetDir = uploadRoot.resolve(LISTING_IMAGE_SUBDIR);
            Files.createDirectories(targetDir);

            String extension = extractExtension(file.getOriginalFilename());
            String fileName = memberId + "_" + UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(fileName).normalize();

            file.transferTo(targetPath);
            return new UsedImageUploadResponse("/uploads/" + LISTING_IMAGE_SUBDIR + "/" + fileName);
        } catch (IOException e) {
            throw new UncheckedIOException("매물 이미지 저장에 실패했습니다.", e);
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        return dotIndex >= 0 ? originalFilename.substring(dotIndex) : "";
    }

    public UsedListingPageResponse getListings(
            String category,
            String tag,
            String keyword,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            boolean onSaleOnly,
            Long sellerId,
            String sort,
            Integer page,
            Integer size
    ) {
        if (category != null && !VALID_CATEGORIES.contains(category)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바르지 않은 카테고리입니다.");
        }
        String sortKey = (sort == null || sort.isBlank()) ? SORT_NEWEST : sort;
        if (!VALID_SORTS.contains(sortKey)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바르지 않은 정렬 방식입니다.");
        }

        List<UsedListingSummaryResponse> all = usedListingRepository
                .findAllWithFilters(category, normalizeTag(tag), normalizeKeyword(keyword), minPrice, maxPrice, onSaleOnly, sellerId)
                .stream()
                .map(this::toSummary)
                .toList();

        List<UsedListingSummaryResponse> sorted = switch (sortKey) {
            case SORT_PRICE_ASC -> all.stream()
                    .sorted(Comparator.comparing(UsedListingSummaryResponse::price))
                    .toList();
            case SORT_PRICE_DESC -> all.stream()
                    .sorted(Comparator.comparing(UsedListingSummaryResponse::price).reversed())
                    .toList();
            case SORT_POPULAR -> all.stream()
                    .sorted(Comparator.comparingLong(UsedListingSummaryResponse::likeCount).reversed())
                    .toList();
            default -> all;
        };

        int pageSize = (size == null || size < 1) ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        int totalElements = sorted.size();
        int totalPages = (int) Math.ceil(totalElements / (double) pageSize);
        int pageIndex = (page == null || page < 0) ? 0 : Math.min(page, Math.max(0, totalPages - 1));

        int fromIndex = Math.min(pageIndex * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        List<UsedListingSummaryResponse> content = sorted.subList(fromIndex, toIndex);

        return new UsedListingPageResponse(
                content,
                pageIndex,
                pageSize,
                totalElements,
                totalPages,
                toIndex < totalElements
        );
    }

    private String normalizeKeyword(String keyword) {
        return (keyword == null || keyword.isBlank()) ? null : keyword.trim();
    }

    public UsedListingDetailResponse getListing(Long listingId) {
        return toDetail(getListingOrThrow(listingId));
    }

    public List<UsedListingSummaryResponse> getMyListings(Long memberId) {
        getMemberOrThrow(memberId);
        return usedListingRepository.findAllBySellerIdWithDetails(memberId).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional
    public UsedListingDetailResponse updateListing(Long memberId, Long listingId, UsedListingCreateRequest request) {
        UsedListing listing = getListingOrThrow(listingId);
        requireSeller(memberId, listing);

        if (!LISTING_ON_SALE.equals(listing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "판매중 상태의 매물만 수정할 수 있습니다.");
        }
        if (!VALID_CATEGORIES.contains(request.category())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바르지 않은 카테고리입니다.");
        }

        listing.updateDetails(
                request.category(),
                request.tags(),
                request.title(),
                request.description(),
                request.price(),
                request.condition(),
                request.tradeMethod(),
                request.region(),
                joinImages(request.imageUrls())
        );

        return toDetail(listing);
    }

    @Transactional
    public UsedListingDetailResponse changeListingStatus(Long memberId, Long listingId, String status) {
        UsedListing listing = getListingOrThrow(listingId);
        requireSeller(memberId, listing);

        if (LISTING_CANCELED.equals(listing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "삭제된 매물은 상태를 변경할 수 없습니다.");
        }
        if (!MANUAL_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "판매중, 예약중, 판매완료 중에서만 변경할 수 있습니다.");
        }

        listing.changeStatus(status);
        return toDetail(listing);
    }

    @Transactional
    public void deleteListing(Long memberId, Long listingId) {
        UsedListing listing = getListingOrThrow(listingId);
        requireSeller(memberId, listing);

        if (!LISTING_ON_SALE.equals(listing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "판매중 상태의 매물만 삭제할 수 있습니다.");
        }

        listing.changeStatus(LISTING_CANCELED);
    }

    @Transactional
    public UsedListingDetailResponse createListing(Long memberId, UsedListingCreateRequest request) {
        Member seller = getMemberOrThrow(memberId);

        if (!VALID_CATEGORIES.contains(request.category())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바르지 않은 카테고리입니다.");
        }

        UsedListing listing = new UsedListing(
                seller,
                request.category(),
                request.tags(),
                request.title(),
                request.description(),
                request.price(),
                request.condition(),
                request.tradeMethod(),
                request.region(),
                joinImages(request.imageUrls()),
                LISTING_ON_SALE
        );

        usedListingRepository.save(listing);
        return toDetail(listing);
    }

    @Transactional
    public UsedLikeStatusResponse likeListing(Long memberId, Long listingId) {
        Member member = getMemberOrThrow(memberId);
        UsedListing listing = getListingOrThrow(listingId);

        if (usedLikeRepository.findByListing_ListingIdAndMember_Id(listingId, memberId).isEmpty()) {
            usedLikeRepository.save(new UsedLike(listing, member));
        }
        return getLikeStatus(memberId, listingId);
    }

    @Transactional
    public UsedLikeStatusResponse unlikeListing(Long memberId, Long listingId) {
        getMemberOrThrow(memberId);
        getListingOrThrow(listingId);
        long deleted = usedLikeRepository.deleteByListing_ListingIdAndMember_Id(listingId, memberId);
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "찜 내역을 찾을 수 없습니다.");
        }
        return getLikeStatus(memberId, listingId);
    }

    public UsedLikeStatusResponse getLikeStatus(Long memberId, Long listingId) {
        boolean liked = usedLikeRepository.findByListing_ListingIdAndMember_Id(listingId, memberId).isPresent();
        long likeCount = usedLikeRepository.countByListing_ListingId(listingId);
        return new UsedLikeStatusResponse(liked, likeCount);
    }

    public List<UsedListingSummaryResponse> getLikedListings(Long memberId) {
        getMemberOrThrow(memberId);
        return usedLikeRepository.findAllByMemberIdWithListing(memberId).stream()
                .map(like -> toSummary(like.getListing()))
                .toList();
    }

    @Transactional
    public UsedTransactionResponse requestPurchase(Long memberId, Long listingId) {
        Member buyer = getMemberOrThrow(memberId);
        UsedListing listing = getListingOrThrow(listingId);

        if (!LISTING_ON_SALE.equals(listing.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "구매 요청이 가능한 매물이 아닙니다.");
        }
        if (listing.getSeller().getId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인 매물은 구매 요청할 수 없습니다.");
        }

        UsedTransaction transaction = new UsedTransaction(listing, buyer, listing.getPrice(), TX_REQUEST);
        usedTransactionRepository.save(transaction);

        notificationService.notifyMember(
                listing.getSeller().getId(),
                null,
                NOTIFICATION_TYPE_TX_REQUEST,
                "중고거래 구매 요청이 왔어요",
                listing.getTitle() + " 매물에 구매 요청이 들어왔어요."
        );

        return toTransactionResponse(transaction);
    }

    public List<UsedTransactionResponse> getMyPurchaseRequests(Long memberId) {
        getMemberOrThrow(memberId);
        return usedTransactionRepository.findAllByBuyerIdWithListing(memberId).stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    public List<UsedTransactionResponse> getReceivedPurchaseRequests(Long memberId) {
        getMemberOrThrow(memberId);
        return usedTransactionRepository.findAllBySellerIdWithListing(memberId).stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    @Transactional
    public UsedTransactionResponse approveTransaction(Long memberId, Long transactionId) {
        UsedTransaction transaction = getTransactionOrThrow(transactionId);
        UsedListing listing = transaction.getListing();
        requireSeller(memberId, listing);

        if (!TX_REQUEST.equals(transaction.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "요청 상태의 구매 요청만 승인할 수 있습니다.");
        }

        transaction.changeStatus(TX_APPROVED);
        listing.changeStatus(LISTING_RESERVED);

        for (UsedTransaction sibling : usedTransactionRepository.findAllByListing_ListingIdAndStatus(listing.getListingId(), TX_REQUEST)) {
            sibling.changeStatus(TX_CANCELED);
        }

        notificationService.notifyMember(
                transaction.getBuyer().getId(),
                null,
                NOTIFICATION_TYPE_TX_APPROVED,
                "구매 요청이 승인됐어요",
                listing.getTitle() + " 매물 구매 요청이 승인됐어요."
        );

        return toTransactionResponse(transaction);
    }

    @Transactional
    public UsedTransactionResponse confirmPayment(Long memberId, Long transactionId, String paymentKey, String tossOrderId, BigDecimal amount) {
        UsedTransaction transaction = getTransactionOrThrow(transactionId);
        if (!transaction.getBuyer().getId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 구매 요청만 결제할 수 있습니다.");
        }
        if (!TX_APPROVED.equals(transaction.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "승인된 구매 요청만 결제할 수 있습니다.");
        }
        if (transaction.getPrice().compareTo(amount) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 금액이 거래 금액과 일치하지 않습니다.");
        }

        TossConfirmResponse confirmed = tossPaymentClient.confirm(paymentKey, tossOrderId, amount);
        usedTransactionPaymentRepository.save(
                new UsedTransactionPayment(transaction, tossOrderId, paymentKey, confirmed.method(), amount, "SUCCESS", LocalDateTime.now())
        );

        transaction.changeStatus(TX_PAID);

        UsedListing listing = transaction.getListing();
        notificationService.notifyMember(
                listing.getSeller().getId(),
                null,
                NOTIFICATION_TYPE_TX_PAID,
                "구매자가 결제를 완료했어요",
                listing.getTitle() + " 매물 결제가 완료됐어요. 거래를 진행해주세요."
        );

        return toTransactionResponse(transaction);
    }

    @Transactional
    public UsedTransactionResponse completeTransaction(Long memberId, Long transactionId) {
        UsedTransaction transaction = getTransactionOrThrow(transactionId);
        UsedListing listing = transaction.getListing();
        requireSeller(memberId, listing);

        if (!TX_PAID.equals(transaction.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제가 완료된 구매 요청만 거래완료 처리할 수 있습니다.");
        }

        transaction.changeStatus(TX_COMPLETED);
        transaction.markCompleted(LocalDateTime.now());
        listing.changeStatus(LISTING_SOLD);

        notificationService.notifyMember(
                transaction.getBuyer().getId(),
                null,
                NOTIFICATION_TYPE_TX_COMPLETED,
                "거래가 완료됐어요",
                listing.getTitle() + " 매물 거래가 완료됐어요."
        );

        return toTransactionResponse(transaction);
    }

    @Transactional
    public UsedTransactionResponse cancelTransaction(Long memberId, Long transactionId) {
        UsedTransaction transaction = getTransactionOrThrow(transactionId);
        UsedListing listing = transaction.getListing();
        boolean isBuyer = transaction.getBuyer().getId().equals(memberId);
        boolean isSeller = listing.getSeller().getId().equals(memberId);
        if (!isBuyer && !isSeller) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 거래만 취소할 수 있습니다.");
        }
        if (TX_COMPLETED.equals(transaction.getStatus()) || TX_CANCELED.equals(transaction.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 완료되었거나 취소된 거래입니다.");
        }

        boolean wasPaid = TX_PAID.equals(transaction.getStatus());
        boolean wasReserving = TX_APPROVED.equals(transaction.getStatus()) || wasPaid;

        if (wasPaid) {
            UsedTransactionPayment payment = usedTransactionPaymentRepository
                    .findByTransaction_TransactionIdAndStatus(transactionId, "SUCCESS")
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 내역을 찾을 수 없습니다."));
            tossPaymentClient.cancel(payment.getPaymentKey(), "중고거래 취소");
            payment.markCanceled();
        }

        transaction.changeStatus(TX_CANCELED);

        if (wasReserving && LISTING_RESERVED.equals(listing.getStatus())) {
            listing.changeStatus(LISTING_ON_SALE);
        }

        Long notifyMemberId = isBuyer ? listing.getSeller().getId() : transaction.getBuyer().getId();
        notificationService.notifyMember(
                notifyMemberId,
                null,
                NOTIFICATION_TYPE_TX_CANCELED,
                "거래가 취소됐어요",
                listing.getTitle() + " 매물 거래가 취소됐어요."
        );

        return toTransactionResponse(transaction);
    }

    private void requireSeller(Long memberId, UsedListing listing) {
        if (!listing.getSeller().getId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 매물에 대해서만 처리할 수 있습니다.");
        }
    }

    private String normalizeTag(String tag) {
        if (tag == null || tag.isBlank()) {
            return null;
        }
        String trimmed = tag.trim();
        return trimmed.startsWith("#") ? trimmed : "#" + trimmed;
    }

    private Member getMemberOrThrow(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }

    private UsedListing getListingOrThrow(Long listingId) {
        return usedListingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매물을 찾을 수 없습니다."));
    }

    private UsedTransaction getTransactionOrThrow(Long transactionId) {
        return usedTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "거래 내역을 찾을 수 없습니다."));
    }

    private UsedListingSummaryResponse toSummary(UsedListing listing) {
        List<String> images = splitImages(listing.getImageUrl());
        return new UsedListingSummaryResponse(
                listing.getListingId(),
                listing.getTitle(),
                listing.getCategory(),
                listing.getTags(),
                listing.getPrice(),
                images.isEmpty() ? null : images.get(0),
                listing.getStatus(),
                listing.getRegion(),
                listing.getSeller().getNickname(),
                usedLikeRepository.countByListing_ListingId(listing.getListingId()),
                listing.getCreatedAt()
        );
    }

    private UsedListingDetailResponse toDetail(UsedListing listing) {
        return new UsedListingDetailResponse(
                listing.getListingId(),
                listing.getTitle(),
                listing.getCategory(),
                listing.getTags(),
                listing.getDescription(),
                listing.getPrice(),
                listing.getCondition(),
                listing.getTradeMethod(),
                listing.getRegion(),
                splitImages(listing.getImageUrl()),
                listing.getStatus(),
                listing.getSeller().getId(),
                listing.getSeller().getNickname(),
                usedLikeRepository.countByListing_ListingId(listing.getListingId()),
                listing.getCreatedAt()
        );
    }

    private String joinImages(List<String> imageUrls) {
        return String.join(IMAGE_DELIMITER, imageUrls);
    }

    private List<String> splitImages(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return List.of();
        }
        return Arrays.stream(imageUrl.split(IMAGE_DELIMITER)).filter(s -> !s.isBlank()).toList();
    }

    private UsedTransactionResponse toTransactionResponse(UsedTransaction transaction) {
        UsedListing listing = transaction.getListing();
        return new UsedTransactionResponse(
                transaction.getTransactionId(),
                listing.getListingId(),
                listing.getTitle(),
                listing.getImageUrl(),
                transaction.getBuyer().getId(),
                transaction.getBuyer().getNickname(),
                listing.getSeller().getId(),
                listing.getSeller().getNickname(),
                transaction.getPrice(),
                transaction.getStatus(),
                transaction.getCreatedAt(),
                transaction.getCompletedAt()
        );
    }
}
