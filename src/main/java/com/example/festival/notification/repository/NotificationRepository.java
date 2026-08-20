package com.example.festival.notification.repository;

import com.example.festival.notification.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.member.id = :memberId OR n.member IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findAllForMember(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.member.id = :memberId AND n.read = false")
    long countUnreadForMember(@Param("memberId") Long memberId);
}
