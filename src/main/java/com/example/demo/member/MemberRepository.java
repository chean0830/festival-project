package com.example.demo.member;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmailIgnoreCase(String email);

    Optional<Member> findByNicknameAndPhoneNumber(String nickname, String phoneNumber);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByNickname(String nickname);

    boolean existsByPhoneNumber(String phoneNumber);
}
