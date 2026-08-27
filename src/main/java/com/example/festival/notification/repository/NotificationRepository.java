package com.example.festival.notification.repository;

import com.example.festival.notification.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.member.id = :memberId OR n.member IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findAllForMember(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE "
            + "(n.member.id = :memberId AND n.read = false) "
            + "OR (n.member IS NULL AND n.read = false AND NOT EXISTS ("
            + "    SELECT 1 FROM NotificationRead nr WHERE nr.notification = n AND nr.member.id = :memberId))")
    long countUnreadForMember(@Param("memberId") Long memberId);

    boolean existsByMember_IdAndEvent_EventIdAndType(Long memberId, Long eventId, String type);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.member.id = :memberId AND n.read = false")
    void markAllPersonalAsRead(@Param("memberId") Long memberId);

    @Query("SELECT n FROM Notification n WHERE n.member IS NULL AND n.read = false "
            + "AND NOT EXISTS (SELECT 1 FROM NotificationRead nr WHERE nr.notification = n AND nr.member.id = :memberId)")
    List<Notification> findUnreadBroadcastsForMember(@Param("memberId") Long memberId);
}
