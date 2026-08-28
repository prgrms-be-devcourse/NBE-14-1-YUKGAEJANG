package com.yukgaejang.cafemenu.domain.post.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record OrderCreateRequest(
        @Email(message = "이메일을 다시 확인해주세요.")
        @NotBlank(message = "이메일은 필수입니다.")
        @Size(max = 255, message = "이메일을 다시 확인해주세요.")
        String email,

        @NotBlank(message = "우편번호는 필수입니다.")
        @Pattern(regexp = "\\d{5}", message = "우편번호는 5자리입니다.")
        String zipCode,

        @NotBlank(message = "주소는 필수입니다.")
        @Size(max = 255, message = "주소를 다시 확인해주세요.")
        String address,

        LocalDateTime orderDate, // 과거 주문 내역 생성용

        @NotEmpty(message = "주문 상품은 최소 1개 이상이어야 합니다.")
        @Valid
        List<OrderItemRequest> items

) {
        public record OrderItemRequest(
                @NotNull(message = "상품 ID는 필수입니다.")
                Long productId,

                @NotNull(message = "수량은 필수입니다.")
                @Min(value = 1, message = "수량은 1개 이상이어야 합니다.")
                Integer quantity
        ) {}
}