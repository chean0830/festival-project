package com.example.festival.member.controller;

import com.example.festival.auth.dto.MessageResponse;
import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.member.dto.AccountResponse;
import com.example.festival.member.dto.AccountUpdateRequest;
import com.example.festival.member.dto.PasswordChangeRequest;
import com.example.festival.member.dto.WithdrawRequest;
import com.example.festival.member.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public AccountResponse account(@AuthenticationPrincipal MemberPrincipal principal) {
        return accountService.getAccount(principal.getMemberId());
    }

    @PatchMapping
    public AccountResponse update(@AuthenticationPrincipal MemberPrincipal principal,
                                  @Valid @RequestBody AccountUpdateRequest request) {
        return accountService.updateAccount(principal.getMemberId(), request);
    }

    @PatchMapping("/password")
    public MessageResponse changePassword(@AuthenticationPrincipal MemberPrincipal principal,
                                          @Valid @RequestBody PasswordChangeRequest request) {
        accountService.changePassword(principal.getMemberId(), request.currentPassword(), request.newPassword());
        return new MessageResponse("비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용해 주세요.");
    }

    @DeleteMapping
    public MessageResponse withdraw(@AuthenticationPrincipal MemberPrincipal principal,
                                    @RequestBody WithdrawRequest request,
                                    HttpServletRequest httpRequest) {
        accountService.withdraw(principal.getMemberId(), request.currentPassword());
        if (httpRequest.getSession(false) != null) httpRequest.getSession(false).invalidate();
        SecurityContextHolder.clearContext();
        return new MessageResponse("회원탈퇴가 완료되었습니다.");
    }
}
