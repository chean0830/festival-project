package com.example.festival.auth.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void signupAndLogin() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "member@example.com",
                                  "phoneNumber": "01012345678",
                                  "postalCode": "06236",
                                  "roadAddress": "서울특별시 강남구 테헤란로 123",
                                  "detailAddress": "4층",
                                  "nickname": "festivalUser",
                                  "password": "password1234"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("member@example.com"))
                .andExpect(jsonPath("$.nickname").value("festivalUser"))
                .andExpect(jsonPath("$.role").value("USER"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "member@example.com",
                                  "password": "password1234"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("member@example.com"));

        mockMvc.perform(post("/api/auth/find-email")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nickname": "festivalUser",
                                  "phoneNumber": "010-1234-5678"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.found").value(true))
                .andExpect(jsonPath("$.maskedEmail").value("mem***@example.com"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void normalMemberCannotCreateLiveStream() throws Exception {
        mockMvc.perform(post("/api/live-streams")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventId": 1,
                                  "title": "일반 회원 방송"
                                }
                                """))
                .andExpect(status().isForbidden());
    }
}
