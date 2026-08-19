package com.example.demo.auth;

import com.example.demo.auth.dto.MessageResponse;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<MessageResponse> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> Objects.requireNonNullElse(error.getDefaultMessage(), "입력값을 확인해 주세요."))
                .orElse("입력값을 확인해 주세요.");
        return ResponseEntity.badRequest().body(new MessageResponse(message));
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<MessageResponse> handleBadCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("이메일 또는 비밀번호가 올바르지 않습니다."));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<MessageResponse> handleResponseStatus(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(new MessageResponse(exception.getReason()));
    }
}
