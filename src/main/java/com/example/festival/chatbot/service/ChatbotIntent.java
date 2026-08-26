package com.example.festival.chatbot.service;

public enum ChatbotIntent {
    /** 특정 공연/페스티벌의 시작일·장소 등 사실 질문 */
    EVENT_INFO,
    /** 특정 아티스트/밴드의 공연 시간 질문 */
    ARTIST_TIME,
    /** 공연 이름 없이 일반적인 주차/입장 가능 시간 질문 */
    VENUE_FACT,
    /** 취향 기반 맞춤 공연/페스티벌 추천 */
    RECOMMEND_PERSONAL,
    /** 임박한(D-day) 공연 목록 */
    RECOMMEND_DDAY,
    /** 특정 요일에 볼만한 공연 추천 */
    RECOMMEND_BY_DAY,
    /** 사용자 취향 분석 */
    TASTE_ANALYSIS,
    /** 공연장 코디/옷차림 추천 */
    OUTFIT_SUGGESTION,
    /** 그 외 잡담/분류 불가 */
    GENERAL
}
