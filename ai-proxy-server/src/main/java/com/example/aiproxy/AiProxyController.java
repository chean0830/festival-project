package com.example.aiproxy;

import com.example.aiproxy.dto.GenerateTextRequest;
import com.example.aiproxy.dto.GenerateTextResponse;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/internal/ai")
public class AiProxyController {

    private final GeminiClient geminiClient;

    public AiProxyController(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    @GetMapping("/health")
    public String health() {
        return geminiClient.isConfigured() ? "ok" : "not-configured";
    }

    @PostMapping("/generate")
    public GenerateTextResponse generate(@RequestBody GenerateTextRequest request) {
        if (!geminiClient.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI 프록시에 API 키가 설정되지 않았습니다.");
        }
        return new GenerateTextResponse(geminiClient.generateText(request.prompt()));
    }
}
