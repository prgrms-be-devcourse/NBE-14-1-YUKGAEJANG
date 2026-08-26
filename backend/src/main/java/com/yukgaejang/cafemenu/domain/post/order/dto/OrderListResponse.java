package com.yukgaejang.cafemenu.domain.post.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor

public class OrderListResponse {
    private int totalPages; // 전체 아이템 수
    private List<OrderResponse> orders;
}

