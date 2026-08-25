package com.yukgaejang.cafemenu.global.exceptionHandler;

import com.yukgaejang.cafemenu.global.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        return ResponseEntity.status(ex.getErrorCode().getStatus())
                .body(new ErrorResponse(
                        ex.getErrorCode().name(),
                        ex.getMessage(),
                        Instant.now()
                ));
    }

    // @Valid 검증 실패(DTO의 @NotBlank, @Email 등) 시 동일한 응답 형태로 통일했습니다.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getField() + " " + fieldError.getDefaultMessage())
                .orElse(ErrorCode.INVALID_INPUT.getDefaultMessage());

        return ResponseEntity.status(ErrorCode.INVALID_INPUT.getStatus())
                .body(new ErrorResponse(
                        ErrorCode.INVALID_INPUT.name(),
                        message,
                        Instant.now()
                ));
    }
}