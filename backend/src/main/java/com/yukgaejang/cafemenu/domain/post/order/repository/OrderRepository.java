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

    Page<Order> findAllByEmail(String email, Pageable pageable);

    Boolean existsByEmail(String email);
}
