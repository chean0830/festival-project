package com.example.festival.youtube.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

class YouTubeTokenCipherTests {

    private final YouTubeTokenCipher cipher = new YouTubeTokenCipher();

    @Test
    void encryptsRefreshTokenWithRandomIvAndDecryptsIt() {
        String secret = "test-only-encryption-key-with-at-least-32-characters";
        String refreshToken = "youtube-refresh-token";

        String first = cipher.encrypt(refreshToken, secret);
        String second = cipher.encrypt(refreshToken, secret);

        assertNotEquals(refreshToken, first);
        assertNotEquals(first, second);
        assertEquals(refreshToken, cipher.decrypt(first, secret));
        assertEquals(refreshToken, cipher.decrypt(second, secret));
    }
}
