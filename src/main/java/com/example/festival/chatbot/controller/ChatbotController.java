package com.example.festival.chatbot.controller;

import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.chatbot.dto.ChatMessageRequest;
import com.example.festival.chatbot.dto.ChatMessageResponse;
import com.example.festival.chatbot.service.ChatbotService;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI 챗봇 API. memberId는 경로변수가 아니라 로그인 세션(MemberPrincipal)에서 얻는다
 * — 다른 회원의 취향/방문 이력을 memberId만 바꿔서 조회하지 못하도록.
 */
@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @GetMapping("/greeting")
    public ChatMessageResponse greeting(@AuthenticationPrincipal MemberPrincipal principal) {
        return chatbotService.greeting(principal.getMemberId());
    }

    @PostMapping("/messages")
    public ChatMessageResponse sendMessage(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Valid @RequestBody ChatMessageRequest request
    ) {
        return chatbotService.handleMessage(principal.getMemberId(), request.message());
    }
}