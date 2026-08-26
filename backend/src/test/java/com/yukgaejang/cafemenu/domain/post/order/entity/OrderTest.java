package com.yukgaejang.cafemenu.domain.post.order.entity;

import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Order 엔티티")
class OrderTest {

    private Order newOrder() {
        return Order.builder()
                .email("test@example.com")
                .zipCode("12345")
                .address("서울시 강남구")
                .orderDate(LocalDateTime.now())
                .build();
    }

    // 1.  필드값이 제대로 들어가는지
    @Test
    @DisplayName("builder로 생성하면 입력한 필드값이 그대로 저장된다")
    void createOrderWithBuilder() {

        // given
        LocalDateTime now = LocalDateTime.now();

        // when
        Order order = Order.builder()
                .email("test@example.com")
                .zipCode("12345")
                .address("서울시 강남구")
                .orderDate(now)
                .build();

        // then
        assertThat(order.getEmail()).isEqualTo("test@example.com");
        assertThat(order.getZipCode()).isEqualTo("12345");
        assertThat(order.getAddress()).isEqualTo("서울시 강남구");
        assertThat(order.getOrderDate()).isEqualTo(now);
    }

    // 2. 생성 직후 초기 상태 확인
    @Test
    @DisplayName("생성 직후에는 주문 상품 목록이 비어있다")
    void hasEmptyItemsWhenJustCreated() {

        // given & when
        Order order = newOrder();

        // then
        assertThat(order.getOrderItems()).isEmpty();
    }

    // 3. 상품 1개 추가 - addItem 동작
    @Test
    @DisplayName("상품 1개를 담으면 주문 상품 목록에 1건이 추가된다")
    void addOneItem() {

        // given
        Order order = newOrder();
        Product product = new Product("예가체프", 15000, "a.jpg");

        // when
        order.addItem(OrderItem.builder().product(product).quantity(2).build());

        // then
        assertThat(order.getOrderItems()).hasSize(1);
        assertThat(order.getOrderItems().get(0).getQuantity()).isEqualTo(2);
    }

    // 4. 다른 상품 추가 - 항목이 분리 여부
    @Test
    @DisplayName("다른 상품을 담으면 별도 항목으로 추가된다")
    void addSeparateItemWhenDifferentProductAdded() {

        // give
        Order order = newOrder();
        Product productA = new Product("예가체프", 15000, "a.jpg");
        Product productB = new Product("케냐 AA", 17000, "b.jpg");
        ReflectionTestUtils.setField(productA, "id", 1L);
        ReflectionTestUtils.setField(productB, "id", 2L);

        // when
        order.addItem(OrderItem.builder().product(productA).quantity(1).build());
        order.addItem(OrderItem.builder().product(productB).quantity(1).build());

        // then
        assertThat(order.getOrderItems()).hasSize(2);
    }

    // 5. 같은 상품 두 번 - 핵심 병합 로직
    @Test
    @DisplayName("같은 상품을 두 번 담으면 수량이 합산된다")
    void mergeQuantityWhenSameProductAddedTwice() {

        // give
        Order order = newOrder();
        Product product = new Product("예가체프", 15000, "a.jpg");
        ReflectionTestUtils.setField(product, "id", 1L);

        // when
        order.addItem(OrderItem.builder().product(product).quantity(2).build());
        order.addItem(OrderItem.builder().product(product).quantity(3).build());

        // then
        assertThat(order.getOrderItems()).hasSize(1);
        assertThat(order.getOrderItems().get(0).getQuantity()).isEqualTo(5);
    }

    // 6. 같은 상품 세 번 이상 - 반복 호출에도 정확하게 동작하는지?
    @Test
    @DisplayName("같은 상품을 세 번 담아도 수량이 누적 합산된다")
    void accumulateQuantityWhenSameProductAddedMultipleTimes() {

        // given
        Order order = newOrder();
        Product product = new Product("예가체프", 15000, "a.jpg");
        ReflectionTestUtils.setField(product, "id", 1L);

        // when
        order.addItem(OrderItem.builder().product(product).quantity(1).build());
        order.addItem(OrderItem.builder().product(product).quantity(2).build());
        order.addItem(OrderItem.builder().product(product).quantity(4).build());

        // then
        assertThat(order.getOrderItems()).hasSize(1);
        assertThat(order.getOrderItems().get(0).getQuantity()).isEqualTo(7);
    }

    // 7. 여러 상품을 섞어서 여러 번 담을 경우
    @Test
    @DisplayName("여러 상품을 섞어서 여러 번 담아도 상품별로 올바르게 합산된다")
    void handleMixedProductsWithRepeatedAdds() {

        // give
        Order order = newOrder();
        Product productA = new Product("예가체프", 15000, "a.jpg");
        Product productB = new Product("케냐 AA", 17000, "b.jpg");
        ReflectionTestUtils.setField(productA, "id", 1L);
        ReflectionTestUtils.setField(productB, "id", 2L);

        // when
        order.addItem(OrderItem.builder().product(productA).quantity(1).build());
        order.addItem(OrderItem.builder().product(productB).quantity(2).build());
        order.addItem(OrderItem.builder().product(productA).quantity(3).build());

        // then
        assertThat(order.getOrderItems()).hasSize(2);
        OrderItem itemA = order.getOrderItems().stream()
                .filter(i -> i.getProduct() == productA)
                .findFirst().orElseThrow();
        OrderItem itemB = order.getOrderItems().stream()
                .filter(i -> i.getProduct() == productB)
                .findFirst().orElseThrow();
        assertThat(itemA.getQuantity()).isEqualTo(4);
        assertThat(itemB.getQuantity()).isEqualTo(2);
    }
}