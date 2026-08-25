package com.yukgaejang.cafemenu.domain.post.order.service;

import com.yukgaejang.cafemenu.domain.post.order.dto.OrderCreateRequest;
import com.yukgaejang.cafemenu.domain.post.order.dto.OrderResponse;
import com.yukgaejang.cafemenu.domain.post.order.entity.Order;
import com.yukgaejang.cafemenu.domain.post.order.entity.OrderItem;
import com.yukgaejang.cafemenu.domain.post.order.repository.OrderRepository;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.repository.ProductRepository;
import com.yukgaejang.cafemenu.global.exceptionHandler.ApiException;
import com.yukgaejang.cafemenu.global.exceptionHandler.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        LocalDateTime now = LocalDateTime.now();

        // TODO: 김영우님 마감시각 유틸 나오면 아래 두 줄 교체
        LocalDateTime windowStart = now.toLocalDate().atTime(14, 0).minusDays(1);
        LocalDateTime windowEnd = now.toLocalDate().atTime(14, 0);

        Order order = orderRepository
                .findByEmailAndOrderDateBetween(request.email(), windowStart, windowEnd)
                .orElseGet(() -> orderRepository.save(
                        Order.builder()
                                .email(request.email())
                                .zipCode(request.zipCode())
                                .address(request.address())
                                .orderDate(now)
                                .build()
                ));

        for (var itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ApiException(
                            ErrorCode.PRODUCT_NOT_FOUND,
                            "존재하지 않는 상품입니다: " + itemReq.productId()));
            order.addItem(OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.quantity())
                    .build());
        }

        return OrderResponse.from(order);
    }

    public ResponseEntity<Void> cancelOrder(Long orderId) {
        boolean isExistedOrder = this.orderRepository.existsById(orderId);

        if (!isExistedOrder) {
            throw new ApiException(ErrorCode.ORDER_NOT_FOUND, "order not found");
        }

        this.orderRepository.deleteById(orderId);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<Order> getList(int page) {
        Pageable pageable = PageRequest.of(page, 10);
        return this.orderRepository.findAll(pageable);
    }
}