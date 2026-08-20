package com.example.festival.youtube.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class YouTubeTokenCipher {

    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;
    private final SecureRandom secureRandom = new SecureRandom();

    public String encrypt(String plainText, String secret) {
        requireSecret(secret);
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key(secret), new GCMParameterSpec(TAG_LENGTH, iv));
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            byte[] result = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, result, 0, iv.length);
            System.arraycopy(encrypted, 0, result, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(result);
        } catch (GeneralSecurityException exception) {
            throw configurationError();
        }
    }

    public String decrypt(String encoded, String secret) {
        requireSecret(secret);
        try {
            byte[] value = Base64.getDecoder().decode(encoded);
            if (value.length <= IV_LENGTH) {
                throw configurationError();
            }
            byte[] iv = new byte[IV_LENGTH];
            byte[] encrypted = new byte[value.length - IV_LENGTH];
            System.arraycopy(value, 0, iv, 0, IV_LENGTH);
            System.arraycopy(value, IV_LENGTH, encrypted, 0, encrypted.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(secret), new GCMParameterSpec(TAG_LENGTH, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            throw configurationError();
        }
    }

    private SecretKeySpec key(String secret) throws GeneralSecurityException {
        byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(secret.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(digest, "AES");
    }

    private void requireSecret(String secret) {
        if (secret == null || secret.length() < 32) {
            throw configurationError();
        }
    }

    private ResponseStatusException configurationError() {
        return new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "YouTube 토큰 암호화 키 설정을 확인해 주세요."
        );
    }
}
