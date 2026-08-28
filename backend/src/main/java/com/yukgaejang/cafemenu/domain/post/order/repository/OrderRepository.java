package com.yukgaejang.cafemenu.domain.post.order.repository;

import com.yukgaejang.cafemenu.domain.post.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByEmailAndOrderDateBetween(
            String email, LocalDateTime windowStart, LocalDateTime windowEnd);

    Optional<Order> findByEmailAndOrderDateBetweenAndAddressAndZipCode(
            String email,
            LocalDateTime windowStart,
            LocalDateTime windowEnd,
            String address,
            String zipCode
    );

    Page<Order> findAllByEmail(String email, Pageable pageable);

    Boolean existsByEmail(String email);

    Page<Order> findDistinctByOrderItemsProductNameContaining(
            String productName,
            Pageable pageable
    );

    Page<Order> findAllByOrderDateGreaterThanEqualAndOrderDateLessThan(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            Pageable pageable
    );
}
