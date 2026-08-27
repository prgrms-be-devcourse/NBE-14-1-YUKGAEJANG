package com.yukgaejang.cafemenu.domain.post.order.repository;

import com.yukgaejang.cafemenu.domain.post.order.entity.Order;
import com.yukgaejang.cafemenu.domain.post.order.entity.OrderItem;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@Testcontainers(disabledWithoutDocker = true)
@DisplayName("MySQL 통계 집계 쿼리 통합 테스트")
class OrderItemRepositoryMySqlIntegrationTest {

    @Container
    static final MySQLContainer<?> MYSQL =
            new MySQLContainer<>("mysql:8.4")
                    .withDatabaseName("cafemenu_test")
                    .withUsername("test")
                    .withPassword("test");

    @DynamicPropertySource
    static void configureDataSource(
            DynamicPropertyRegistry registry
    ) {
        registry.add(
                "spring.datasource.url",
                MYSQL::getJdbcUrl
        );

        registry.add(
                "spring.datasource.username",
                MYSQL::getUsername
        );

        registry.add(
                "spring.datasource.password",
                MYSQL::getPassword
        );

        registry.add(
                "spring.datasource.driver-class-name",
                MYSQL::getDriverClassName
        );

        registry.add(
                "spring.jpa.hibernate.ddl-auto",
                () -> "create-drop"
        );
    }

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("일별·월별·인기 상품 쿼리가 MySQL에서 실행된다")
    void executeStatisticsQueriesOnMySql() {
        Product product = productRepository.save(
                new Product(
                        "에티오피아",
                        15_000,
                        "ethiopia.png"
                )
        );

        Order order = Order.builder()
                .email("mysql@example.com")
                .zipCode("12345")
                .address("서울시 강남구")
                .orderDate(
                        LocalDateTime.of(
                                2026,
                                8,
                                27,
                                10,
                                30
                        )
                )
                .build();

        order.addItem(
                OrderItem.builder()
                        .product(product)
                        .quantity(3)
                        .build()
        );

        orderRepository.saveAndFlush(order);

        var dailyRevenue =
                orderItemRepository.findDailyRevenue();

        var monthlyRevenue =
                orderItemRepository.findMonthlyRevenue();

        var topProducts =
                orderItemRepository.findTopSellingProducts(
                        PageRequest.of(0, 3)
                );

        assertThat(dailyRevenue).hasSize(1);
        assertThat(dailyRevenue.getFirst().getDate())
                .isEqualTo(LocalDate.of(2026, 8, 27));
        assertThat(dailyRevenue.getFirst().getRevenue())
                .isEqualTo(45_000L);

        assertThat(monthlyRevenue).hasSize(1);
        assertThat(monthlyRevenue.getFirst().getYear())
                .isEqualTo(2026);
        assertThat(monthlyRevenue.getFirst().getMonth())
                .isEqualTo(8);
        assertThat(monthlyRevenue.getFirst().getRevenue())
                .isEqualTo(45_000L);

        assertThat(topProducts).hasSize(1);
        assertThat(topProducts.getFirst().getProductId())
                .isEqualTo(product.getId());
        assertThat(topProducts.getFirst().getProductName())
                .isEqualTo("에티오피아");
        assertThat(topProducts.getFirst().getTotalSold())
                .isEqualTo(3L);
    }
}