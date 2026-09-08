package com.example.festival.chat.service;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * 채팅 금칙어 필터.
 * 1) 기호/공백 없이 그대로 쓴 금칙어는 같은 길이의 '*'로 부분 치환한다.
 * 2) "개@시발~", "시.발", "병 신"처럼 특수문자/공백을 끼워 우회하려는 경우를 잡기 위해,
 *    한글/영문만 남기고 나머지를 다 지운 정규화 버전에서도 한 번 더 검사한다.
 *    정규화 검사에서 걸리면(=기호로 우회 시도한 경우) 위치를 정확히 특정할 수 없으므로
 *    메시지 전체를 마스킹한다.
 * 단어 목록은 우선 코드에 하드코딩 — 운영 정책이 확정되면 테이블로 분리 고려.
 */
@Component
public class ProfanityFilter {

    private static final Pattern NON_HANGUL_LATIN = Pattern.compile("[^가-힣a-zA-Z]");

    private static final Set<String> BANNED_WORDS = Set.of(
            // 시발류
            "시발", "씨발", "씨팔", "시팔", "씨바", "시바", "씨불", "시불", "쓰발", "씨빨", "시빨", "ㅅㅂ", "ㅆㅂ",
            // 개새끼류
            "개새끼", "개새키", "개색기", "개세끼", "걔새끼", "개쉐끼", "개쌔끼", "개쎄끼",
            // 새끼류
            "새끼", "새키", "세끼", "쉐끼", "쌔끼", "쎄끼", "새끼야",
            // 병신류
            "병신", "병쉰", "병신아", "븡신", "벙신", "붕신", "빙신", "빙싄", "빙시", "ㅂㅅ",
            // 지랄류
            "지랄", "지럴", "지롤", "지룰", "지알",
            // 좆류
            "좆", "좃", "좇", "조까", "줫까",
            // 패드립(가족 비하)류
            "니애미", "니 애미", "니엄마", "니 엄마", "느그아빠", "느그 아빠", "니아빠", "니 아빠",
            "년아", "너임마청년"
    );

    private static final Set<String> NORMALIZED_BANNED_WORDS = BANNED_WORDS.stream()
            .map(ProfanityFilter::normalize)
            .filter(w -> !w.isEmpty())
            .collect(java.util.stream.Collectors.toSet());

    public String filter(String message) {
        String result = message;
        for (String word : BANNED_WORDS) {
            if (result.contains(word)) {
                result = result.replace(word, "*".repeat(word.length()));
            }
        }

        String normalized = normalize(result);
        for (String normalizedWord : NORMALIZED_BANNED_WORDS) {
            if (normalized.contains(normalizedWord)) {
                return "*".repeat(message.length());
            }
        }

        return result;
    }

    private static String normalize(String text) {
        return NON_HANGUL_LATIN.matcher(text).replaceAll("").toLowerCase();
    }
}
