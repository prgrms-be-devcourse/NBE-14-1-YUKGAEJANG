package com.yukgaejang.cafemenu.domain.post.order.service;

import com.yukgaejang.cafemenu.domain.post.order.dto.OrderCreateRequest;
import com.yukgaejang.cafemenu.domain.post.order.dto.OrderResponse;
import com.yukgaejang.cafemenu.domain.post.order.entity.Order;
import com.yukgaejang.cafemenu.domain.post.order.entity.OrderItem;
import com.yukgaejang.cafemenu.domain.post.order.repository.OrderRepository;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.repository.ProductRepository;
import com.yukgaejang.cafemenu.global.exceptionHandler.ApiException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private OrderCreateRequest requestWith(Long productId, int quantity) {
        return new OrderCreateRequest(
                "test@example.com", "12345", "서울시 강남구",
                null,
                List.of(new OrderCreateRequest.OrderItemRequest(productId, quantity))
        );
    }

    // 1. 신규 주문이면 새 Order가 저장되는지
    @Test
    @DisplayName("기존 주문이 없으면 새 Order를 생성한다")
    void createNewOrderWhenNoExistingOrder() {

        // given
        Product product = new Product("예가체프", 15000, "a.jpg");
        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        anyString(),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        anyString(),
                        anyString()
                ))
                .thenReturn(Optional.empty());
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // when
        orderService.createOrder(requestWith(1L, 1));

        // then
        verify(orderRepository, times(1)).save(any());
    }

    // 2. 응답 DTO에 요청값이 그대로 반영되는지?
    @Test
    @DisplayName("주문 생성 응답에 요청한 이메일과 주소가 그대로 담긴다")
    void returnResponseWithRequestedFields() {

        // given
        Product product = new Product("예가체프", 15000, "a.jpg");
        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        anyString(),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        anyString(),
                        anyString()
                ))
                .thenReturn(Optional.empty());
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // when
        OrderResponse response = orderService.createOrder(requestWith(1L, 1));

        // then
        assertThat(response.email()).isEqualTo("test@example.com");
        assertThat(response.address()).isEqualTo("서울시 강남구");
    }

    // 3. 존재하지 않는 상품(예외 처리 검증)
    @Test
    @DisplayName("존재하지 않는 상품으로 주문하면 예외가 발생한다")
    void throwExceptionWhenProductNotFound() {

        // given
        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        anyString(),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        anyString(),
                        anyString()
                ))
                .thenReturn(Optional.empty());
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(requestWith(999L, 1)))
                .isInstanceOf(ApiException.class);
    }

    // 4. 이메일, 주소, 우편번호가 모두 같으면 기존 주문에 병합되는지
    @Test
    @DisplayName("이메일·주소·우편번호가 모두 같으면 기존 주문에 병합한다")
    void mergeOrderWhenDeliveryInformationMatches() {
        // given
        Product product = new Product(
                "예가체프",
                15_000,
                "a.jpg"
        );

        Order existingOrder = Order.builder()
                .email("test@example.com")
                .zipCode("12345")
                .address("서울시 강남구")
                .orderDate(LocalDateTime.now())
                .build();

        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        eq("test@example.com"),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        eq("서울시 강남구"),
                        eq("12345")
                ))
                .thenReturn(Optional.of(existingOrder));

        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        // when
        orderService.createOrder(requestWith(1L, 2));

        // then
        verify(orderRepository)
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        eq("test@example.com"),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        eq("서울시 강남구"),
                        eq("12345")
                );

        verify(orderRepository, never()).save(any(Order.class));

        assertThat(existingOrder.getOrderItems()).hasSize(1);
        assertThat(existingOrder.getOrderItems().getFirst().getQuantity())
                .isEqualTo(2);
    }

    @Test
    @DisplayName("기존 주문에 이미 담긴 상품을 또 주문하면 수량이 합산된다")
    void mergeQuantityWhenReorderingExistingItem() {
        Product product = new Product("예가체프", 15000, "a.jpg");
        ReflectionTestUtils.setField(product, "id", 1L);

        Order existingOrder = Order.builder()
                .email("test@example.com").zipCode("12345")
                .address("서울시 강남구").orderDate(LocalDateTime.now())
                .build();
        existingOrder.addItem(OrderItem.builder().product(product).quantity(2).build()); // 이미 담긴 상태

        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        anyString(),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        anyString(),
                        anyString()
                ))
                .thenReturn(Optional.of(existingOrder));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        orderService.createOrder(requestWith(1L, 3)); // 같은 상품 재주문

        assertThat(existingOrder.getOrderItems()).hasSize(1); // 항목은 여전히 1개
        assertThat(existingOrder.getOrderItems().get(0).getQuantity()).isEqualTo(5); // 2+3 합산
    }

    // 6. 여러 상품을 한 번에 주문 — 각 productId가 개별적으로 조회/처리되는지
    @Test
    @DisplayName("여러 상품을 한 번에 주문하면 각 상품이 모두 조회되어 담긴다")
    void handleMultipleItemsInOneRequest() {

        // given
        Product productA = new Product("예가체프", 15000, "a.jpg");
        Product productB = new Product("케냐 AA", 17000, "b.jpg");
        ReflectionTestUtils.setField(productA, "id", 1L);
        ReflectionTestUtils.setField(productB, "id", 2L);

        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        anyString(),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        anyString(),
                        anyString()
                ))
                .thenReturn(Optional.empty());
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.findById(1L)).thenReturn(Optional.of(productA));
        when(productRepository.findById(2L)).thenReturn(Optional.of(productB));

        OrderCreateRequest request = new OrderCreateRequest(
                "test@example.com", "12345", "서울시 강남구",
                null,
                List.of(
                        new OrderCreateRequest.OrderItemRequest(1L, 1),
                        new OrderCreateRequest.OrderItemRequest(2L, 2)
                )
        );

        // when
        OrderResponse response = orderService.createOrder(request);

        // then
        verify(productRepository).findById(1L);
        verify(productRepository).findById(2L);
        assertThat(response.items()).hasSize(2);
    }

    // 7. 여러 상품 중 하나가 없을 때, 있던 상품도 롤백되어야 하는지 확인
    @Test
    @DisplayName("여러 상품 중 하나라도 존재하지 않으면 전체 주문 처리가 중단된다")
    void abortWhenAnyItemProductNotFoundAmongMultipleItems() {
        // given
        Product productA = new Product("예가체프", 15000, "a.jpg");
        Order existingOrder = Order.builder()
                .email("test@example.com").zipCode("12345")
                .address("서울시 강남구").orderDate(LocalDateTime.now())
                .build();

        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        anyString(),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        anyString(),
                        anyString()
                ))
                .thenReturn(Optional.of(existingOrder));
        when(productRepository.findById(1L)).thenReturn(Optional.of(productA));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        OrderCreateRequest request = new OrderCreateRequest(
                "test@example.com", "12345", "서울시 강남구",
                null,
                List.of(
                        new OrderCreateRequest.OrderItemRequest(1L, 1),      // 존재하는 상품 — 먼저 처리됨
                        new OrderCreateRequest.OrderItemRequest(999L, 1)     // 존재하지 않는 상품 — 여기서 예외
                )
        );

        // when & then
        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ApiException.class);

    }

    // 8. 같은 이메일에 대한 다른 주소
    @Test
    @DisplayName("같은 이메일이라도 주소가 다르면 신규 주문을 생성한다")
    void createNewOrderWhenAddressDiffers() {
        // given
        Product product = new Product(
                "예가체프",
                15_000,
                "a.jpg"
        );

        OrderCreateRequest request = new OrderCreateRequest(
                "test@example.com",
                "12345",
                "서울시 서초구",
                null,
                List.of(
                        new OrderCreateRequest.OrderItemRequest(
                                1L,
                                1
                        )
                )
        );

        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        eq("test@example.com"),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        eq("서울시 서초구"),
                        eq("12345")
                ))
                .thenReturn(Optional.empty());

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        // when
        OrderResponse response =
                orderService.createOrder(request);

        // then
        verify(orderRepository)
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        eq("test@example.com"),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        eq("서울시 서초구"),
                        eq("12345")
                );

        verify(orderRepository).save(
                argThat(order ->
                        order.getEmail().equals("test@example.com") &&
                                order.getAddress().equals("서울시 서초구") &&
                                order.getZipCode().equals("12345")
                )
        );

        assertThat(response.address())
                .isEqualTo("서울시 서초구");
        assertThat(response.zipCode())
                .isEqualTo("12345");
    }

    // 9. 같은 이메일에 대한 다른 우편번호로 주분
    @Test
    @DisplayName("이메일과 주소가 같아도 우편번호가 다르면 신규 주문을 생성한다")
    void createNewOrderWhenZipCodeDiffers() {
        // given
        Product product = new Product(
                "예가체프",
                15_000,
                "a.jpg"
        );

        OrderCreateRequest request = new OrderCreateRequest(
                "test@example.com",
                "54321",
                "서울시 강남구",
                null,
                List.of(
                        new OrderCreateRequest.OrderItemRequest(
                                1L,
                                1
                        )
                )
        );

        when(orderRepository
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        eq("test@example.com"),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        eq("서울시 강남구"),
                        eq("54321")
                ))
                .thenReturn(Optional.empty());

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        // when
        OrderResponse response =
                orderService.createOrder(request);

        // then
        verify(orderRepository)
                .findByEmailAndOrderDateBetweenAndAddressAndZipCode(
                        eq("test@example.com"),
                        any(LocalDateTime.class),
                        any(LocalDateTime.class),
                        eq("서울시 강남구"),
                        eq("54321")
                );

        verify(orderRepository).save(
                argThat(order ->
                        order.getEmail().equals("test@example.com") &&
                                order.getAddress().equals("서울시 강남구") &&
                                order.getZipCode().equals("54321")
                )
        );

        assertThat(response.address())
                .isEqualTo("서울시 강남구");
        assertThat(response.zipCode())
                .isEqualTo("54321");
    }
}
