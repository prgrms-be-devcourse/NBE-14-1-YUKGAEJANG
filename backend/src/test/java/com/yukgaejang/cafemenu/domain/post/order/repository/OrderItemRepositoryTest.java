package com.yukgaejang.cafemenu.domain.post.order.repository;

import com.yukgaejang.cafemenu.domain.post.order.entity.Order;
import com.yukgaejang.cafemenu.domain.post.order.entity.OrderItem;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:statistics;MODE=MySQL;DB_CLOSE_DELAY=-1"
})
@DisplayName("OrderItemRepository 통계 집계 쿼리")
class OrderItemRepositoryTest {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    private Product ethiopia;
    private Product kenya;

    @BeforeEach
    void setUp() {
        ethiopia = productRepository.save(
                new Product("에티오피아", 10_000, "ethiopia.png")
        );

        kenya = productRepository.save(
                new Product("케냐 AA", 20_000, "kenya.png")
        );

        saveOrder(
                LocalDateTime.of(2026, 1, 15, 10, 0),
                new ItemData(ethiopia, 2),
                new ItemData(kenya, 1)
        );

        saveOrder(
                LocalDateTime.of(2026, 1, 16, 10, 0),
                new ItemData(ethiopia, 3)
        );

        saveOrder(
                LocalDateTime.of(2026, 2, 1, 10, 0),
                new ItemData(kenya, 3)
        );
    }

    @Test
    @DisplayName("주문 날짜별 매출을 합산한다")
    void findDailyRevenue() {
        List<OrderItemRepository.DailyRevenueProjection> result =
                orderItemRepository.findDailyRevenue();

        assertThat(result).hasSize(3);

        OrderItemRepository.DailyRevenueProjection februaryFirst =
                findDailyRevenue(result, LocalDate.of(2026, 2, 1));

        OrderItemRepository.DailyRevenueProjection januarySixteenth =
                findDailyRevenue(result, LocalDate.of(2026, 1, 16));

        OrderItemRepository.DailyRevenueProjection januaryFifteenth =
                findDailyRevenue(result, LocalDate.of(2026, 1, 15));

        assertThat(februaryFirst.getRevenue()).isEqualTo(60_000L);
        assertThat(januarySixteenth.getRevenue()).isEqualTo(30_000L);
        assertThat(januaryFifteenth.getRevenue()).isEqualTo(40_000L);
    }

    @Test
    @DisplayName("연도와 월별로 매출을 합산한다")
    void findMonthlyRevenue() {
        List<OrderItemRepository.MonthlyRevenueProjection> result =
                orderItemRepository.findMonthlyRevenue();

        assertThat(result).hasSize(2);

        OrderItemRepository.MonthlyRevenueProjection february =
                findMonthlyRevenue(result, 2026, 2);

        OrderItemRepository.MonthlyRevenueProjection january =
                findMonthlyRevenue(result, 2026, 1);

        assertThat(february.getRevenue()).isEqualTo(60_000L);
        assertThat(january.getRevenue()).isEqualTo(70_000L);
    }

    @Test
    @DisplayName("판매량이 많은 상품 순서로 조회한다")
    void findTopSellingProducts() {
        List<OrderItemRepository.TopProductProjection> result =
                orderItemRepository.findTopSellingProducts(
                        PageRequest.of(0, 3)
                );

        assertThat(result).hasSize(2);

        assertThat(result.get(0).getProductId())
                .isEqualTo(ethiopia.getId());
        assertThat(result.get(0).getProductName())
                .isEqualTo("에티오피아");
        assertThat(result.get(0).getTotalSold())
                .isEqualTo(5L);

        assertThat(result.get(1).getProductId())
                .isEqualTo(kenya.getId());
        assertThat(result.get(1).getTotalSold())
                .isEqualTo(4L);
    }

    @Test
    @DisplayName("Pageable 크기만큼 인기 상품 조회 결과를 제한한다")
    void limitTopSellingProducts() {
        List<OrderItemRepository.TopProductProjection> result =
                orderItemRepository.findTopSellingProducts(
                        PageRequest.of(0, 1)
                );

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getProductId())
                .isEqualTo(ethiopia.getId());
        assertThat(result.getFirst().getTotalSold())
                .isEqualTo(5L);
    }

    private void saveOrder(
            LocalDateTime orderDate,
            ItemData... items
    ) {
        Order order = Order.builder()
                .email("test@example.com")
                .zipCode("12345")
                .address("서울시 강남구")
                .orderDate(orderDate)
                .build();

        for (ItemData item : items) {
            order.addItem(
                    OrderItem.builder()
                            .product(item.product())
                            .quantity(item.quantity())
                            .build()
            );
        }

        orderRepository.saveAndFlush(order);
    }

    private OrderItemRepository.DailyRevenueProjection findDailyRevenue(
            List<OrderItemRepository.DailyRevenueProjection> result,
            LocalDate date
    ) {
        return result.stream()
                .filter(item -> date.equals(item.getDate()))
                .findFirst()
                .orElseThrow();
    }

    private OrderItemRepository.MonthlyRevenueProjection findMonthlyRevenue(
            List<OrderItemRepository.MonthlyRevenueProjection> result,
            int year,
            int month
    ) {
        return result.stream()
                .filter(item ->
                        item.getYear() == year &&
                                item.getMonth() == month
                )
                .findFirst()
                .orElseThrow();
    }

    private record ItemData(
            Product product,
            int quantity
    ) {
    }
}