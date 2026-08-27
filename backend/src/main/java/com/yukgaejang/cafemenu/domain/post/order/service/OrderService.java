package com.yukgaejang.cafemenu.domain.post.order.service;

import com.yukgaejang.cafemenu.domain.post.order.dto.OrderCreateRequest;
import com.yukgaejang.cafemenu.domain.post.order.dto.OrderResponse;
import com.yukgaejang.cafemenu.domain.post.order.dto.OrderUpdateRequest;
import com.yukgaejang.cafemenu.domain.post.order.entity.Order;
import com.yukgaejang.cafemenu.domain.post.order.entity.OrderItem;
import com.yukgaejang.cafemenu.domain.post.order.repository.OrderRepository;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.repository.ProductRepository;
import com.yukgaejang.cafemenu.global.exceptionHandler.ApiException;
import com.yukgaejang.cafemenu.global.exceptionHandler.ErrorCode;
import com.yukgaejang.cafemenu.global.util.BatchTimeWindowUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        LocalDateTime now = LocalDateTime.now();
        BatchTimeWindowUtil.BatchTimeWindow batchTimeWindow = BatchTimeWindowUtil
                .getBatchTimeWindow(now);

        LocalDateTime windowStart = batchTimeWindow.windowStart();
        LocalDateTime windowEnd = batchTimeWindow.windowEnd();

        Order order = orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        request.email(),
                        windowStart,
                        windowEnd,
                        request.address(),
                        request.zipCode()
                )
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

    @Transactional
    public OrderResponse updateOrder(
            Long orderId,
            OrderUpdateRequest request
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ErrorCode.ORDER_NOT_FOUND));

        order.updateZipCodeAndAddress(request.zipCode(), request.address());
        orderRepository.save(order);

        return OrderResponse.from(order);
    }

    public ResponseEntity<Void> cancelOrder(Long orderId) {
        boolean isExistedOrder = this.orderRepository.existsById(orderId);

        if (!isExistedOrder) {
            throw new ApiException(ErrorCode.ORDER_NOT_FOUND, "존재하지 않는 주문입니다: " + orderId);        }

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

    @Transactional(readOnly = true)
    public Page<Order> getListByEmail(String email, int page) {
        boolean isExistedEmail = this.orderRepository.existsByEmail(email);

        if(!isExistedEmail){
            throw new ApiException(ErrorCode.EMAIL_NOT_FOUND, "존재하지 않는 이메일입니다.");
        }

        Pageable pageable = PageRequest.of(page, 5);
        return this.orderRepository.findAllByEmail(email, pageable);
    }

    @Transactional(readOnly = true)
    public Boolean getEmail(String email) {
        return this.orderRepository.existsByEmail(email);
    }

    //상품명 검색
    @Transactional(readOnly = true)
    public Page<Order> searchByProductName(
            String productName,
            int page
    ) {
        Pageable pageable = PageRequest.of(page, 10);

        return orderRepository
                .findDistinctByOrderItemsProductName(
                        productName,
                        pageable
                );
    }
    //주문일 검색
    @Transactional(readOnly = true)
    public Page<Order> searchByOrderDate(
            LocalDate orderDate,
            int page
    ) {
        LocalDateTime startDateTime =
                orderDate.atStartOfDay();

        LocalDateTime endDateTime =
                orderDate.plusDays(1).atStartOfDay();

        Pageable pageable = PageRequest.of(page, 10);

        return orderRepository
                .findAllByOrderDateGreaterThanEqualAndOrderDateLessThan(
                        startDateTime,
                        endDateTime,
                        pageable
                );
    }

}