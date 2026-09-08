package com.example.festival.notification.controller;

import com.example.festival.notification.dto.NotificationResponse;
import com.example.festival.notification.dto.UnreadCountResponse;
import com.example.festival.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/members/{memberId}/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> getNotifications(@PathVariable Long memberId) {
        return notificationService.getNotifications(memberId);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse getUnreadCount(@PathVariable Long memberId) {
        return new UnreadCountResponse(notificationService.getUnreadCount(memberId));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long memberId, @PathVariable Long notificationId) {
        notificationService.markAsRead(memberId, notificationId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long memberId) {
        notificationService.markAllAsRead(memberId);
        return ResponseEntity.noContent().build();
    }
}
