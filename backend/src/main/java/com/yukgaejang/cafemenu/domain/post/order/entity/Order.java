package com.yukgaejang.cafemenu.domain.post.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String zipCode;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Builder
    public Order(String email, String zipCode, String address, LocalDateTime orderDate) {
        this.email = email;
        this.zipCode = zipCode;
        this.address = address;
        this.orderDate = orderDate;
    }

    public void addItem(OrderItem newItem) {
        for (OrderItem existing : orderItems) {
            if (existing.getProduct().getId().equals(newItem.getProduct().getId())) {
                existing.increaseQuantity(newItem.getQuantity());
                return;
            }
        }
        newItem.assignOrder(this);
        this.orderItems.add(newItem);
    }

    public void updateZipCodeAndAddress(String zipCode, String address) {
        this.zipCode = zipCode;
        this.address = address;
    }
}