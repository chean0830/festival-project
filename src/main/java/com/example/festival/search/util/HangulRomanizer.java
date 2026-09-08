package com.example.festival.search.util;

import java.util.Locale;

/**
 * 한글 음절을 국어의 로마자 표기법(Revised Romanization) 규칙으로 변환한다.
 * 검색어를 영문으로 입력해도(예: "Yuuri") 한글 이름("유우리")을 찾을 수 있도록
 * SearchService에서 아티스트 이름과 함께 비교하는 용도로만 쓴다.
 *
 * 연음/격음화 같은 발음 동화 규칙은 반영하지 않은 음절 단위 변환이라
 * 팬덤에서 관용적으로 쓰는 비표준 영문 표기까지는 못 잡을 수 있다.
 */
public final class HangulRomanizer {

    private static final int HANGUL_BASE = 0xAC00;
    private static final int HANGUL_LAST = 0xD7A3;

    private static final String[] INITIALS = {
            "g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s",
            "ss", "", "j", "jj", "ch", "k", "t", "p", "h"
    };

    private static final String[] MEDIALS = {
            "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa",
            "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"
    };

    private static final String[] FINALS = {
            "", "k", "k", "k", "n", "n", "n", "t", "l", "k",
            "m", "l", "l", "l", "p", "l", "m", "p", "p", "t",
            "t", "ng", "t", "t", "k", "t", "p", "t"
    };

    private HangulRomanizer() {
    }

    public static String romanize(String text) {
        if (text == null) {
            return "";
        }

        StringBuilder result = new StringBuilder(text.length() * 2);
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch >= HANGUL_BASE && ch <= HANGUL_LAST) {
                int syllableIndex = ch - HANGUL_BASE;
                int finalIndex = syllableIndex % 28;
                int medialIndex = (syllableIndex / 28) % 21;
                int initialIndex = syllableIndex / 28 / 21;
                result.append(INITIALS[initialIndex])
                        .append(MEDIALS[medialIndex])
                        .append(FINALS[finalIndex]);
            } else {
                result.append(ch);
            }
        }
        return result.toString().toLowerCase(Locale.ROOT);
    }
}
