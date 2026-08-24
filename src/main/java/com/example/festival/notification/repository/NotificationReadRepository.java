package com.example.festival.notification.repository;

import com.example.festival.notification.entity.NotificationRead;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationReadRepository extends JpaRepository<NotificationRead, Long> {

    boolean existsByNotification_NotificationIdAndMember_Id(Long notificationId, Long memberId);

    @Query("SELECT nr.notification.notificationId FROM NotificationRead nr WHERE nr.member.id = :memberId")
    List<Long> findReadNotificationIdsByMemberId(@Param("memberId") Long memberId);
}
