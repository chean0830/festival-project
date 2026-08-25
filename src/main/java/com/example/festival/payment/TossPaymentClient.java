package com.example.festival.payment;

import com.example.festival.payment.dto.TossConfirmResponse;
import com.example.festival.payment.dto.TossErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * Toss Payments 서버 API(결제 승인/취소) 호출을 담당한다.
 * 사업자등록 없이 발급되는 테스트 시크릿 키로 동작하며, 실제 결제는 발생하지 않는다.
 */
@Slf4j
@Component
public class TossPaymentClient {

    private static final String BASE_URL = "https://api.tosspayments.com/v1";

    private final RestClient restClient;
    private final String secretKey;

    public TossPaymentClient(@Value("${app.payment.toss.secret-key}") String secretKey) {
        this.secretKey = secretKey;
        this.restClient = RestClient.create(BASE_URL);
    }

    public TossConfirmResponse confirm(String paymentKey, String orderId, BigDecimal amount) {
        try {
            return restClient.post()
                    .uri("/payments/confirm")
                    .header(HttpHeaders.AUTHORIZATION, basicAuthHeader())
                    .body(Map.of(
                            "paymentKey", paymentKey,
                            "orderId", orderId,
                            "amount", amount.longValueExact()
                    ))
                    .retrieve()
                    .body(TossConfirmResponse.class);
        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, extractMessage(e));
        } catch (RestClientException e) {
            log.warn("Toss Payments 결제 승인 요청 실패 (orderId={})", orderId, e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "결제 승인 처리 중 오류가 발생했습니다.");
        }
    }

    public void cancel(String paymentKey, String cancelReason) {
        try {
            restClient.post()
                    .uri("/payments/{paymentKey}/cancel", paymentKey)
                    .header(HttpHeaders.AUTHORIZATION, basicAuthHeader())
                    .body(Map.of("cancelReason", cancelReason))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, extractMessage(e));
        } catch (RestClientException e) {
            log.warn("Toss Payments 결제 취소 요청 실패 (paymentKey={})", paymentKey, e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "결제 취소 처리 중 오류가 발생했습니다.");
        }
    }

    private String basicAuthHeader() {
        String credentials = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        return "Basic " + credentials;
    }

    private String extractMessage(RestClientResponseException e) {
        try {
            TossErrorResponse error = e.getResponseBodyAs(TossErrorResponse.class);
            if (error != null && error.message() != null) {
                return error.message();
            }
        } catch (Exception ignored) {
            // 아래 기본 메시지로 대체
        }
        return "결제 처리에 실패했습니다.";
    }
}
