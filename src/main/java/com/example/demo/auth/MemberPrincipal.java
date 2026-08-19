package com.example.demo.auth;

import com.example.demo.member.Member;
import com.example.demo.member.MemberStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class MemberPrincipal implements UserDetails {

    private final Long memberId;
    private final String email;
    private final String password;
    private final String nickname;
    private final String profileImage;
    private final MemberStatus status;
    private final List<GrantedAuthority> authorities;

    private MemberPrincipal(Member member) {
        this.memberId = member.getId();
        this.email = member.getEmail();
        this.password = member.getPassword() == null ? "" : member.getPassword();
        this.nickname = member.getNickname();
        this.profileImage = member.getProfileImage();
        this.status = member.getStatus();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + member.getRole().name()));
    }

    public static MemberPrincipal from(Member member) {
        return new MemberPrincipal(member);
    }

    public Long getMemberId() {
        return memberId;
    }

    public String getEmail() {
        return email;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImage() {
        return profileImage;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return status == MemberStatus.ACTIVE;
    }
}
