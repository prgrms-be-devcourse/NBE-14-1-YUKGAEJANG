package com.yukgaejang.cafemenu.domain.post.order.controller;

import com.yukgaejang.cafemenu.domain.post.order.dto.OrderCreateRequest;
import com.yukgaejang.cafemenu.domain.post.order.dto.OrderListResponse;
import com.yukgaejang.cafemenu.domain.post.order.dto.OrderResponse;
import com.yukgaejang.cafemenu.domain.post.order.entity.Order;
import com.yukgaejang.cafemenu.domain.post.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody @Valid OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long orderId
    ) {
        return this.orderService.cancelOrder(orderId);
    }

    @GetMapping()
    public ResponseEntity<OrderListResponse> list(@RequestParam(value = "page", defaultValue = "0") int page) {
        Page<Order> paging = orderService.getList(page);

        List<OrderResponse> responses = paging.getContent()
                .stream()
                .map(OrderResponse::from)
                .toList();

        OrderListResponse response = new OrderListResponse(
                paging.getTotalPages(),
                responses
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping(params = "email")
    public ResponseEntity<List<OrderResponse>> listByEmail(@RequestParam @Valid String email, @RequestParam(value = "page", defaultValue = "0") int page) {
        Page<Order> paging = orderService.getListByEmail(email, page);

        List<OrderResponse> responses = paging.getContent()
                .stream()
                .map(OrderResponse::from)
                .toList();

        return ResponseEntity.ok(responses);
    }

}