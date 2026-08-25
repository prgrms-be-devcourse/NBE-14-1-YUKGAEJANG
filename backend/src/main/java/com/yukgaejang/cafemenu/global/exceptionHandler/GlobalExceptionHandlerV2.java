package com.yukgaejang.cafemenu.global.exceptionHandler;

import com.yukgaejang.cafemenu.global.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandlerV2 {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiExceptionV2 ex) {
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
                .orElse(ErrorCodeV2.INVALID_INPUT.getDefaultMessage());

        return ResponseEntity.status(ErrorCodeV2.INVALID_INPUT.getStatus())
                .body(new ErrorResponse(
                        ErrorCodeV2.INVALID_INPUT.name(),
                        message,
                        Instant.now()
                ));
    }
} // vs 실패하는 valid 종류마다 따로 exception 날릴 수 있는데 오후에 검토