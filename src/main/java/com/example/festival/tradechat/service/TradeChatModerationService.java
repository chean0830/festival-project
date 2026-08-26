package com.example.festival.tradechat.service;

import com.example.festival.chatbot.service.AiProxyClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

/**
 * 앱 외부 결제/선입금을 유도하는 메시지를 감지한다.
 * 1) 키워드로 먼저 걸러서(비용 없음, 즉시) 의심되는 경우에만
 * 2) AI(챗봇이 쓰는 것과 같은 ai-proxy-server, {@link AiProxyClient})로 한 번 더 확인해서 오탐을 줄인다.
 * 안전 기능이라 AI가 꺼져있거나 호출에 실패해도 조용히 넘어가지 않고 키워드 판정만으로 경고한다(fail-open).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TradeChatModerationService {

    public static final String WARNING_TEXT =
            "⚠️ 주의하세요\n앱 외부 결제나 선입금을 요구하는 메시지입니다.\n안전한 거래를 위해 신중하게 거래해주세요.";

    private static final Pattern SUSPICIOUS_PATTERN = Pattern.compile(
            "계좌|무통장|선입금|입금해|송금|이체해|계좌이체|카톡|라인\\s*페이|직거래\\s*계좌|번호로\\s*입금|"
                    + "외부\\s*결제|폰뱅킹|계좌번호|링크\\s*결제|링크로\\s*결제|"
                    + "(국민|신한|우리|하나|농협|기업|카카오뱅크|케이뱅크|토스뱅크|새마을금고|우체국)\\s*은행"
    );

    private final AiProxyClient aiProxyClient;

    public boolean isSuspicious(String message) {
        if (message == null || !SUSPICIOUS_PATTERN.matcher(message).find()) {
            return false;
        }
        if (!aiProxyClient.isConfigured()) {
            return true;
        }
        try {
            String prompt = "다음 메시지가 정상적인 앱 내 결제 절차를 우회해서 외부 계좌이체, 선입금, 외부 링크 결제를 "
                    + "요구하는 내용이면 YES, 그렇지 않으면 NO라고만 답해. 다른 설명은 하지 마.\n메시지: \"" + message + "\"";
            String result = aiProxyClient.generateText(prompt).trim().toUpperCase();
            return result.startsWith("YES");
        } catch (Exception e) {
            log.warn("AI 외부결제 감지 실패, 키워드 판정으로 대체합니다: {}", e.getMessage());
            return true;
        }
    }
}
