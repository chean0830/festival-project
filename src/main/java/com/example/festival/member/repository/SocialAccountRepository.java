package com.example.festival.member.repository;

import com.example.festival.member.entity.SocialAccount;
import com.example.festival.member.entity.SocialProvider;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    Optional<SocialAccount> findByProviderAndProviderId(SocialProvider provider, String providerId);
}
