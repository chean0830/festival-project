package com.example.festival.mdshop.repository;

import com.example.festival.mdshop.entity.MdOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MdOrderRepository extends JpaRepository<MdOrder, Long> {

    @Query("SELECT o FROM MdOrder o JOIN FETCH o.product p JOIN FETCH p.event "
            + "WHERE o.member.id = :memberId ORDER BY o.createdAt DESC")
    List<MdOrder> findAllByMemberIdWithProduct(@Param("memberId") Long memberId);

    /**
     * 이 회원이 해당 상품에 대해 이미 예약한 총 수량 (취소된 주문은 제외).
     * "1인당 최대 N개" 제한을 한 번의 주문이 아니라 상품당 누적 기준으로 검증할 때 쓴다.
     */
    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM MdOrder o "
            + "WHERE o.member.id = :memberId AND o.product.productId = :productId AND o.status <> 'CANCELED'")
    int sumQuantityByMemberAndProductExcludingCanceled(@Param("memberId") Long memberId, @Param("productId") Long productId);

    // 결제 대기 리마인더 발송용
    @Query("SELECT o FROM MdOrder o JOIN FETCH o.member JOIN FETCH o.product p JOIN FETCH p.event WHERE o.status = :status")
    List<MdOrder> findAllByStatusWithMemberAndProduct(@Param("status") String status);
}
