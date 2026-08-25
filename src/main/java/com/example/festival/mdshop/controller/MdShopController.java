package com.example.festival.mdshop.controller;

import com.example.festival.mdshop.dto.MdOrderRequest;
import com.example.festival.mdshop.dto.MdOrderResponse;
import com.example.festival.mdshop.dto.MdProductResponse;
import com.example.festival.mdshop.service.MdShopService;
import com.example.festival.payment.dto.PaymentConfirmRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * MD 사전예약 상품 조회 + 주문(예약) API.
 * 로그인/인증이 아직 SecurityContext 기반이 아니라, memberId를 경로로 직접 받는
 * 프로젝트 전반의 다른 컨트롤러들과 같은 방식으로 설계했다.
 */
@RestController
public class MdShopController {

    private final MdShopService mdShopService;

    public MdShopController(MdShopService mdShopService) {
        this.mdShopService = mdShopService;
    }

    @GetMapping("/api/md/products")
    public List<MdProductResponse> getPreorderProducts() {
        return mdShopService.getPreorderProducts();
    }

    @GetMapping("/api/md/products/{productId}")
    public MdProductResponse getProduct(@PathVariable Long productId) {
        return mdShopService.getProduct(productId);
    }

    @PostMapping("/api/members/{memberId}/md/orders")
    public ResponseEntity<MdOrderResponse> createOrder(
            @PathVariable Long memberId,
            @Valid @RequestBody MdOrderRequest request
    ) {
        MdOrderResponse response = mdShopService.createOrder(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/members/{memberId}/md/orders")
    public List<MdOrderResponse> getMyOrders(@PathVariable Long memberId) {
        return mdShopService.getMyOrders(memberId);
    }

    @GetMapping("/api/members/{memberId}/md/orders/{orderId}")
    public MdOrderResponse getOrder(@PathVariable Long memberId, @PathVariable Long orderId) {
        return mdShopService.getOrder(memberId, orderId);
    }

    @PostMapping("/api/members/{memberId}/md/orders/{orderId}/payments/confirm")
    public MdOrderResponse confirmPayment(
            @PathVariable Long memberId,
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentConfirmRequest request
    ) {
        return mdShopService.confirmPayment(memberId, orderId, request.paymentKey(), request.orderId(), request.amount());
    }

    @PostMapping("/api/members/{memberId}/md/orders/{orderId}/cancel")
    public MdOrderResponse cancelOrder(@PathVariable Long memberId, @PathVariable Long orderId) {
        return mdShopService.cancelOrder(memberId, orderId);
    }
}
