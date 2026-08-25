package com.example.festival.mdshop.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventScheduleRepository;
import com.example.festival.interest.entity.MemberArtist;
import com.example.festival.interest.repository.MemberArtistRepository;
import com.example.festival.mdshop.dto.MdOrderRequest;
import com.example.festival.mdshop.dto.MdOrderResponse;
import com.example.festival.mdshop.dto.MdProductResponse;
import com.example.festival.mdshop.entity.MdOrder;
import com.example.festival.mdshop.entity.MdProduct;
import com.example.festival.mdshop.entity.Payment;
import com.example.festival.mdshop.repository.MdOrderRepository;
import com.example.festival.mdshop.repository.MdProductRepository;
import com.example.festival.mdshop.repository.PaymentRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.notification.service.NotificationService;
import com.example.festival.payment.TossPaymentClient;
import com.example.festival.payment.dto.TossConfirmResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * MD 사전예약 상품 조회 + 주문(예약) 생성 + Toss Payments 결제 승인/취소.
 * 주문 생성 시점에는 결제가 이루어지지 않고 status=PAYMENT_WAIT으로 기록되며,
 * 프론트가 Toss 결제창을 거쳐 돌아온 뒤 confirmPayment로 결제를 승인해야 PAID로 전환된다.
 */
@Service
@Transactional(readOnly = true)
public class MdShopService {

    private static final String PREORDER_STATUS = "PREORDER";
    private static final String SOLD_OUT_STATUS = "SOLD_OUT";
    private static final String ORDER_INITIAL_STATUS = "PAYMENT_WAIT";
    private static final String ORDER_PAID_STATUS = "PAID";
    private static final String ORDER_CANCELED_STATUS = "CANCELED";
    private static final int MAX_QUANTITY_PER_PERSON = 4;
    private static final DateTimeFormatter ORDER_NUMBER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private static final String NOTIFICATION_TYPE_ORDER = "MD_ORDER";
    private static final String NOTIFICATION_TYPE_PAID = "MD_PAID";
    private static final String NOTIFICATION_TYPE_CANCELED = "MD_CANCELED";
    private static final String NOTIFICATION_TYPE_NEW_PRODUCT = "MD_NEW_PRODUCT";
    private static final String NOTIFICATION_TYPE_PAYMENT_REMINDER = "MD_PAYMENT_REMINDER";
    private static final int PAYMENT_REMINDER_AFTER_HOURS = 24;

    private final MdProductRepository mdProductRepository;
    private final MdOrderRepository mdOrderRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;
    private final EventScheduleRepository eventScheduleRepository;
    private final MemberArtistRepository memberArtistRepository;
    private final PaymentRepository paymentRepository;
    private final TossPaymentClient tossPaymentClient;

    public MdShopService(
            MdProductRepository mdProductRepository,
            MdOrderRepository mdOrderRepository,
            MemberRepository memberRepository,
            NotificationService notificationService,
            EventScheduleRepository eventScheduleRepository,
            MemberArtistRepository memberArtistRepository,
            PaymentRepository paymentRepository,
            TossPaymentClient tossPaymentClient
    ) {
        this.mdProductRepository = mdProductRepository;
        this.mdOrderRepository = mdOrderRepository;
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
        this.eventScheduleRepository = eventScheduleRepository;
        this.memberArtistRepository = memberArtistRepository;
        this.paymentRepository = paymentRepository;
        this.tossPaymentClient = tossPaymentClient;
    }

    public List<MdProductResponse> getPreorderProducts(Long eventId) {
        List<String> visibleStatuses = List.of(PREORDER_STATUS, SOLD_OUT_STATUS);
        List<MdProduct> products = eventId == null
                ? mdProductRepository.findAllByStatusInWithEvent(visibleStatuses)
                : mdProductRepository.findAllByEventIdAndStatusInWithEvent(eventId, visibleStatuses);

        return products.stream()
                .map(this::toProductResponse)
                .toList();
    }

    public MdProductResponse getProduct(Long productId) {
        return toProductResponse(getProductOrThrow(productId));
    }

    /**
     * 사전예약 중인 상품의 공연에 출연하는 아티스트를 관심 등록한 회원들에게 "신상 MD" 알림을 보낸다.
     * (memberId, eventId, type) 기준으로 이미 보낸 적 있으면 다시 보내지 않는다.
     * NewMdProductNotifyScheduler가 주기적으로 호출한다.
     */
    @Transactional
    public void notifyInterestedArtistFans() {
        for (MdProduct product : mdProductRepository.findAllByStatusInWithEvent(List.of(PREORDER_STATUS))) {
            Long eventId = product.getEvent().getEventId();

            Set<Long> artistIds = eventScheduleRepository.findByEvent_EventIdOrderByLineupOrderAsc(eventId).stream()
                    .map(schedule -> schedule.getArtist().getArtistId())
                    .collect(Collectors.toSet());

            for (Long artistId : artistIds) {
                for (MemberArtist memberArtist : memberArtistRepository.findAllByArtist_ArtistId(artistId)) {
                    Long memberId = memberArtist.getMember().getId();
                    if (notificationService.hasNotified(memberId, eventId, NOTIFICATION_TYPE_NEW_PRODUCT)) {
                        continue;
                    }
                    notificationService.notifyMember(
                            memberId,
                            eventId,
                            NOTIFICATION_TYPE_NEW_PRODUCT,
                            "관심 아티스트의 새 MD가 떴어요!",
                            product.getName() + " 사전예약이 시작됐어요. (" + product.getEvent().getName() + ")"
                    );
                }
            }
        }
    }

    /**
     * 결제 대기(PAYMENT_WAIT) 상태로 일정 시간 이상 방치된 예약에 결제 리마인더를 보낸다.
     * MdPaymentReminderScheduler가 주기적으로 호출한다.
     */
    @Transactional
    public void notifyPendingPayments() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(PAYMENT_REMINDER_AFTER_HOURS);

        for (MdOrder order : mdOrderRepository.findAllByStatusWithMemberAndProduct(ORDER_INITIAL_STATUS)) {
            if (order.getCreatedAt() == null || order.getCreatedAt().isAfter(cutoff)) {
                continue;
            }

            Long memberId = order.getMember().getId();
            Long eventId = order.getProduct().getEvent().getEventId();
            if (notificationService.hasNotified(memberId, eventId, NOTIFICATION_TYPE_PAYMENT_REMINDER)) {
                continue;
            }

            notificationService.notifyMember(
                    memberId,
                    eventId,
                    NOTIFICATION_TYPE_PAYMENT_REMINDER,
                    "MD 사전예약 결제가 아직이에요",
                    order.getProduct().getName() + " (예약번호 " + order.getOrderNumber() + ") 결제를 아직 완료하지 않으셨어요."
            );
        }
    }

    @Transactional
    public MdOrderResponse createOrder(Long memberId, MdOrderRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
        MdProduct product = getProductOrThrow(request.productId());

        if (!PREORDER_STATUS.equals(product.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "사전예약 가능한 상품이 아닙니다.");
        }
        if (product.getPreorderDeadline() != null
                && product.getPreorderDeadline().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "사전예약이 마감된 상품입니다.");
        }

        int alreadyOrdered = mdOrderRepository.sumQuantityByMemberAndProductExcludingCanceled(memberId, product.getProductId());
        if (alreadyOrdered + request.quantity() > MAX_QUANTITY_PER_PERSON) {
            int remaining = Math.max(0, MAX_QUANTITY_PER_PERSON - alreadyOrdered);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이 상품은 1인당 최대 " + MAX_QUANTITY_PER_PERSON + "개까지만 예약할 수 있어요. (이미 예약한 수량 "
                            + alreadyOrdered + "개, 추가로 예약 가능한 수량 " + remaining + "개)"
            );
        }
        if (product.getStock() < request.quantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "재고가 부족해요. (남은 재고 " + product.getStock() + "개)"
            );
        }

        BigDecimal totalPrice = product.getPrice().multiply(BigDecimal.valueOf(request.quantity()));

        MdOrder order = new MdOrder(
                product,
                member,
                generateOrderNumber(),
                request.quantity(),
                totalPrice,
                request.recipientName(),
                request.address(),
                request.phone(),
                ORDER_INITIAL_STATUS
        );

        product.decreaseStock(request.quantity());
        if (product.getStock() <= 0) {
            product.changeStatus(SOLD_OUT_STATUS);
        }

        mdOrderRepository.save(order);

        notificationService.notifyMember(
                memberId,
                product.getEvent().getEventId(),
                NOTIFICATION_TYPE_ORDER,
                "MD 사전예약이 완료됐어요!",
                product.getName() + " 사전예약이 접수됐어요. 예약번호 " + order.getOrderNumber()
        );

        return toOrderResponse(order);
    }

    public List<MdOrderResponse> getMyOrders(Long memberId) {
        return mdOrderRepository.findAllByMemberIdWithProduct(memberId).stream()
                .map(this::toOrderResponse)
                .toList();
    }

    public MdOrderResponse getOrder(Long memberId, Long orderId) {
        return toOrderResponse(getOrderOrThrow(memberId, orderId));
    }

    /**
     * Toss Payments 결제창에서 돌아온 뒤 결제 승인을 서버에서 확정하고, "결제 대기" 예약을 "결제 완료"로 전환한다.
     */
    @Transactional
    public MdOrderResponse confirmPayment(Long memberId, Long orderId, String paymentKey, String tossOrderId, BigDecimal amount) {
        MdOrder order = getOrderOrThrow(memberId, orderId);
        if (!ORDER_INITIAL_STATUS.equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 대기 상태의 예약만 결제할 수 있습니다.");
        }
        if (order.getTotalPrice().compareTo(amount) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 금액이 예약 금액과 일치하지 않습니다.");
        }

        TossConfirmResponse confirmed = tossPaymentClient.confirm(paymentKey, tossOrderId, amount);
        paymentRepository.save(new Payment(order, tossOrderId, paymentKey, confirmed.method(), amount, "SUCCESS", LocalDateTime.now()));

        order.changeStatus(ORDER_PAID_STATUS);

        notificationService.notifyMember(
                memberId,
                order.getProduct().getEvent().getEventId(),
                NOTIFICATION_TYPE_PAID,
                "MD 사전예약 결제가 완료됐어요",
                order.getProduct().getName() + " (예약번호 " + order.getOrderNumber() + ") 결제가 완료됐어요."
        );

        return toOrderResponse(order);
    }

    @Transactional
    public MdOrderResponse cancelOrder(Long memberId, Long orderId) {
        MdOrder order = getOrderOrThrow(memberId, orderId);
        if (ORDER_CANCELED_STATUS.equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 취소된 예약입니다.");
        }
        if ("SHIPPED".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 배송이 진행된 예약은 취소할 수 없습니다.");
        }

        if (ORDER_PAID_STATUS.equals(order.getStatus())) {
            Payment payment = paymentRepository.findByOrder_OrderIdAndStatus(orderId, "SUCCESS")
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 내역을 찾을 수 없습니다."));
            tossPaymentClient.cancel(payment.getPaymentKey(), "구매자 예약 취소");
            payment.markCanceled();
        }

        order.changeStatus(ORDER_CANCELED_STATUS);

        MdProduct product = order.getProduct();
        product.increaseStock(order.getQuantity());
        if (SOLD_OUT_STATUS.equals(product.getStatus()) && product.getStock() > 0) {
            product.changeStatus(PREORDER_STATUS);
        }

        notificationService.notifyMember(
                memberId,
                product.getEvent().getEventId(),
                NOTIFICATION_TYPE_CANCELED,
                "MD 사전예약이 취소됐어요",
                product.getName() + " (예약번호 " + order.getOrderNumber() + ") 예약이 취소됐어요."
        );

        return toOrderResponse(order);
    }

    private MdOrder getOrderOrThrow(Long memberId, Long orderId) {
        MdOrder order = mdOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "예약 내역을 찾을 수 없습니다."));
        if (!order.getMember().getId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 예약만 확인할 수 있습니다.");
        }
        return order;
    }

    private MdProduct getProductOrThrow(Long productId) {
        return mdProductRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다."));
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(ORDER_NUMBER_DATE_FORMAT);
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "MD" + datePart + randomPart;
    }

    private MdProductResponse toProductResponse(MdProduct product) {
        Event event = product.getEvent();
        return new MdProductResponse(
                product.getProductId(),
                product.getName(),
                product.getCategory(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getStatus(),
                product.getPreorderDeadline(),
                event.getName()
        );
    }

    private MdOrderResponse toOrderResponse(MdOrder order) {
        MdProduct product = order.getProduct();
        return new MdOrderResponse(
                order.getOrderId(),
                order.getOrderNumber(),
                product.getProductId(),
                product.getName(),
                product.getImageUrl(),
                order.getQuantity(),
                order.getTotalPrice(),
                order.getShippingName(),
                order.getShippingAddress(),
                order.getShippingPhone(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}
