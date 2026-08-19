package com.example.demo.auth;

import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetMailService {

    private static final Logger LOGGER = Logger.getLogger(PasswordResetMailService.class.getName());

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String frontendUrl;
    private final String fromAddress;
    private final String fromName;
    private final boolean logLink;

    public PasswordResetMailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${app.mail.from:no-reply@festival.local}") String fromAddress,
            @Value("${app.mail.from-name:Festlog}") String fromName,
            @Value("${app.password-reset.log-link:true}") boolean logLink
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.frontendUrl = frontendUrl;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
        this.logLink = logLink;
    }

    public void send(String email, String rawToken) {
        String resetUrl = frontendUrl + "/password/reset/confirm?token=" + rawToken;
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();

        if (mailSender == null) {
            if (logLink) {
                LOGGER.warning(() -> "메일 설정이 없어 개발용 재설정 링크를 출력합니다: " + resetUrl);
            }
            return;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress, fromName);
            helper.setTo(email);
            helper.setSubject("[Festlog] 비밀번호 재설정 안내");
            helper.setText("""
                    아래 링크를 눌러 비밀번호를 재설정해 주세요.
                    링크는 30분 동안 한 번만 사용할 수 있습니다.

                    %s

                    본인이 요청하지 않았다면 이 메일을 무시해 주세요.
                    """.formatted(resetUrl));
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException exception) {
            throw new IllegalStateException("비밀번호 재설정 메일을 만들 수 없습니다.", exception);
        }
    }
}
