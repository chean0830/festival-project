package com.example.demo.member;

import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, Long> {

    @EntityGraph(attributePaths = "member")
    Optional<SocialAccount> findByProviderAndProviderId(SocialProvider provider, String providerId);
}
