package com.yukgaejang.cafemenu.domain.post.order.dto;

import jakarta.validation.constraints.*;

public record OrderUpdateRequest(
        @NotBlank(message = "우편번호는 필수입니다.")
        @Pattern(regexp = "\\d{5}", message = "우편번호는 5자리입니다.")
        String zipCode,

        @NotBlank(message = "주소는 필수입니다.")
        @Size(max = 255, message = "주소를 다시 확인해주세요.")
        String address
) {
}