package com.yukgaejang.cafemenu.domain.post.product.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ProductCreateRequestTest {

    private final Validator validator = Validation
            .buildDefaultValidatorFactory()
            .getValidator();

    @Test
    @DisplayName("정상적인 상품 등록 요청은 검증에 성공한다")
    void productRequestShouldAcceptValidValues() {
        ProductCreateRequest request = new ProductCreateRequest(
                "아메리카노",
                3000,
                "americano.jpg"
        );

        Set<ConstraintViolation<ProductCreateRequest>> violations =
                validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("상품 가격은 0원까지 허용한다")
    void productPriceShouldAllowZero() {
        ProductCreateRequest request = new ProductCreateRequest(
                "무료 상품",
                0,
                "free-product.jpg"
        );

        Set<ConstraintViolation<ProductCreateRequest>> violations =
                validator.validate(request);

        assertTrue(violations.isEmpty());
    }


    @Test
    @DisplayName("상품 가격이 null이면 검증에 실패한다")
    void productPriceShouldRejectNullValue() {
        ProductCreateRequest request = new ProductCreateRequest(
                "아메리카노",
                null,
                "americano.jpg"
        );

        Set<ConstraintViolation<ProductCreateRequest>> violations =
                validator.validate(request);

        assertTrue(hasViolationFor(violations, "price"));
    }

    @Test
    @DisplayName("상품명이 빈 문자열이면 검증에 실패한다")
    void productNameShouldRejectBlankValue() {
        ProductCreateRequest request = new ProductCreateRequest(
                "",
                3000,
                "americano.jpg"
        );

        Set<ConstraintViolation<ProductCreateRequest>> violations =
                validator.validate(request);

        assertTrue(hasViolationFor(violations, "name"));
    }

    @Test
    @DisplayName("상품명이 공백으로만 구성되면 검증에 실패한다")
    void productNameShouldRejectWhitespaceValue() {
        ProductCreateRequest request = new ProductCreateRequest(
                "   ",
                3000,
                "americano.jpg"
        );

        Set<ConstraintViolation<ProductCreateRequest>> violations =
                validator.validate(request);

        assertTrue(hasViolationFor(violations, "name"));
    }


    @Test
    @DisplayName("상품명이 255자를 초과하면 검증에 실패한다")
    void productNameShouldRejectOver255Characters() {
         String name = "가".repeat(256);

        ProductCreateRequest request = new ProductCreateRequest(
                name,
                3000,
                "americano.jpg"
        );

        Set<ConstraintViolation<ProductCreateRequest>> violations =
                validator.validate(request);

        assertTrue(hasViolationFor(violations, "name"));
    }

    @Test
    @DisplayName("상품 이미지 URL은 255자까지 허용한다")
    void productImageUrlShouldAllow255Characters() {
        String imageUrl = "a".repeat(255);

        ProductCreateRequest request = new ProductCreateRequest(
                "아메리카노",
                3000,
                imageUrl
        );

        Set<ConstraintViolation<ProductCreateRequest>> violations =
                validator.validate(request);

        // then
        assertFalse(hasViolationFor(violations, "imageUrl"));
    }

    @Test
    @DisplayName("상품 이미지 URL이 255자를 초과하면 검증에 실패한다")
    void productImageUrlShouldRejectOver255Characters() {
        String imageUrl = "a".repeat(256);

        ProductCreateRequest request = new ProductCreateRequest(
                "아메리카노",
                3000,
                imageUrl
        );

        Set<ConstraintViolation<ProductCreateRequest>> violations =
                validator.validate(request);

        assertTrue(hasViolationFor(violations, "imageUrl"));
    }

    private boolean hasViolationFor(
            Set<ConstraintViolation<ProductCreateRequest>> violations,
            String fieldName
    ) {
        return violations.stream()
                .anyMatch(violation ->
                        violation.getPropertyPath()
                                .toString()
                                .equals(fieldName)
                );
    }
}
