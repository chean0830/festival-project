package com.example.festival.tradechat.controller;

import com.example.festival.tradechat.dto.TradeChatImageUploadResponse;
import com.example.festival.tradechat.dto.TradeChatMessageDto;
import com.example.festival.tradechat.dto.TradeChatRoomDto;
import com.example.festival.tradechat.service.TradeChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 중고거래 1:1 채팅 REST API. 실시간 메시지 전송은 STOMP(/ws-chat)로 처리한다(TradeChatWebSocketController).
 * usedtrade 도메인의 기존 컨트롤러들과 동일하게 memberId를 경로로 받는다(아직 인증 연동 전 컨벤션).
 */
@RestController
@RequestMapping("/api/members/{memberId}/trade-chat")
@RequiredArgsConstructor
public class TradeChatController {

    private final TradeChatService tradeChatService;

    @PostMapping("/transactions/{transactionId}/room")
    public TradeChatRoomDto getOrCreateRoom(@PathVariable Long memberId, @PathVariable Long transactionId) {
        return tradeChatService.getOrCreateRoom(transactionId, memberId);
    }

    @GetMapping("/rooms/{roomId}")
    public TradeChatRoomDto getRoom(@PathVariable Long memberId, @PathVariable Long roomId) {
        return tradeChatService.getRoom(roomId, memberId);
    }

    @GetMapping("/rooms/{roomId}/messages")
    public List<TradeChatMessageDto> getHistory(@PathVariable Long memberId, @PathVariable Long roomId) {
        return tradeChatService.getHistory(roomId, memberId);
    }

    @PostMapping("/rooms/{roomId}/enter")
    public void enter(@PathVariable Long memberId, @PathVariable Long roomId) {
        tradeChatService.enterRoom(roomId, memberId);
    }

    @PostMapping("/rooms/{roomId}/exit")
    public void exit(@PathVariable Long memberId, @PathVariable Long roomId) {
        tradeChatService.exitRoom(roomId, memberId);
    }

    @PostMapping("/rooms/{roomId}/block")
    public void block(@PathVariable Long memberId, @PathVariable Long roomId) {
        tradeChatService.block(roomId, memberId);
    }

    @PostMapping("/rooms/{roomId}/unblock")
    public void unblock(@PathVariable Long memberId, @PathVariable Long roomId) {
        tradeChatService.unblock(roomId, memberId);
    }

    @PostMapping("/image")
    @ResponseStatus(HttpStatus.CREATED)
    public TradeChatImageUploadResponse uploadImage(@PathVariable Long memberId, @RequestParam("file") MultipartFile file) {
        return tradeChatService.uploadChatImage(memberId, file);
    }

    @GetMapping("/unread-counts")
    public Map<Long, Long> getUnreadCounts(@PathVariable Long memberId) {
        return tradeChatService.getUnreadCounts(memberId);
    }
}
