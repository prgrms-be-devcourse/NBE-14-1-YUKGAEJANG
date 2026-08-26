/**
 * [관리자 통계 대시보드 응답 DTO]
 * - 매출/판매량 집계 결과를 화면에 필요한 형태로만 전달하기 위한 응답 객체이다.
 * - 세 가지 지표를 각각 별도 record로 정의하여, 지표별로 필요한 필드만 노출한다.
 * - 지표: 일별 매출, 월별 매출, 인기 상품
 */
package com.yukgaejang.cafemenu.domain.post.order.dto;

import com.yukgaejang.cafemenu.domain.post.order.entity.Order;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String email,
        String zipCode,
        String address,
        LocalDateTime orderDate,
        List<OrderItemResponse> items
) {
    public record OrderItemResponse(Long productId, String productName, Integer quantity, Integer price) {}

    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getEmail(),
                order.getZipCode(),
                order.getAddress(),
                order.getOrderDate(),
                order.getOrderItems().stream()
                        .map(i -> new OrderItemResponse(
                                i.getProduct().getId(), i.getProduct().getName(), i.getQuantity(),i.getProduct().getPrice()))
                        .toList()
        );
    }
}