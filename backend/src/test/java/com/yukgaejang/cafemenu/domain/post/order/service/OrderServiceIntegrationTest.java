/**
 * OrderService 통합 테스트
 * !! -> 실제로 트랜잭션과 롤백이 DB까지 반영되는가?
 *
 * [배경 — OrderServiceTest 7번 테스트에서 발견한 한계]
 * OrderServiceTest#abortWhenAnyItemProductNotFoundAmongMultipleItems()에서, 여러 상품 중
 * 하나가 존재하지 않을 때 예외가 발생하는 것까지는 검증했지만, "그 전에 이미 처리된
 * 정상 상품(productA)까지 롤백되어 취소되는지"는 확인할 수 없었습니다.
 *
 * 이유: 그 테스트는 Mockito로 OrderRepository를 가짜 처리하기 때문에, existingOrder는
 * 순수 자바 객체(POJO)일 뿐입니다. order.addItem()이 호출되는 순간 이미 메모리에 그대로
 * 반영되고, 실제 DB 트랜잭션이 없으니 "롤백"이라는 개념 자체가 적용되지 않습니다.
 * 즉 예외가 던져진 뒤에도 productA 항목은 existingOrder 안에 계속 남아있는 상태로
 * 관찰되어, 실제 서비스에서 기대하는 동작(트랜잭션 전체 취소)과 다르게 보일 수 있었습니다.
 *
 * [기술 선택 이유 — 왜 @SpringBootTest인가]
 * 이 한계는 단위 테스트의 설계상 당연한 것이라 OrderServiceTest를 고치는 게 아니라,
 * "실제 DB에 반영되는지"를 확인할 수 있는 별도의 테스트 계층이 필요하다고 판단했습니다.
 * @SpringBootTest는 실제 Spring 컨텍스트와 진짜 DB(H2)를 띄워 동작하므로,
 * OrderService.createOrder()의 @Transactional이 실제로 롤백을 수행하는지
 * (예외 발생 시 DB에 Order가 전혀 남지 않는지) 직접 조회로 검증할 수 있습니다.
 * 단위 테스트(빠르지만 트랜잭션 검증 불가)와 통합 테스트(느리지만 실제 동작 검증 가능)를
 * 역할에 따라 나눠서 쓰는 것으로, 모든 케이스를 통합 테스트로 짜지 않고 이 롤백
 * 시나리오처럼 "정말 DB까지 확인해야 하는 경우"에만 선택적으로 사용합니다.
 *
 * [테스트 전용 DB 설정]
 * src/test/resources/application.yml에 별도의 H2 인메모리 DB(jdbc:h2:mem:testdb) 설정을
 * 추가해두었습니다. src/main/resources/application.yml은 로컬 개발용 파일 기반 H2(db_dev)를
 * 쓰고 있는데, 테스트가 이 파일을 그대로 쓰면 개발 데이터와 테스트 데이터가 섞이거나
 * 이전 테스트 실행 결과가 다음 테스트에 영향을 줄 수 있습니다. src/test/resources 밑의
 * 설정 파일은 테스트 실행 시 자동으로 우선 적용되므로 별도의 @ActiveProfiles 없이
 * 이 파일만으로 테스트 DB가 격리됩니다.
 */

package com.yukgaejang.cafemenu.domain.post.order.service;

import com.yukgaejang.cafemenu.domain.post.order.dto.OrderCreateRequest;
import com.yukgaejang.cafemenu.domain.post.order.repository.OrderRepository;
import com.yukgaejang.cafemenu.domain.post.product.entity.Product;
import com.yukgaejang.cafemenu.domain.post.product.repository.ProductRepository;
import com.yukgaejang.cafemenu.global.exceptionHandler.ApiException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@DisplayName("OrderService 통합 테스트")
class OrderServiceIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @AfterEach
    void cleanUp() {
        orderRepository.deleteAll();
        productRepository.deleteAll();
    }

    @Test
    @DisplayName("여러 상품 중 하나라도 없으면 트랜잭션이 전부 롤백된다")
    void rollbackEntireTransactionWhenAnyProductNotFound() {
        // 클래스/메서드에 @Transactional 없음 — createOrder()가 최상위 트랜잭션 경계가 되어
        // 예외 발생 시 즉시 실제 ROLLBACK이 일어나는지 검증한다.
        Product savedProduct = productRepository.save(new Product("예가체프", 15000, "a.jpg"));

        OrderCreateRequest request = new OrderCreateRequest(
                "test@example.com", "12345", "서울시 강남구",
                List.of(
                        new OrderCreateRequest.OrderItemRequest(savedProduct.getId(), 1),
                        new OrderCreateRequest.OrderItemRequest(9999L, 1)
                )
        );

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ApiException.class);

        assertThat(orderRepository.findAll()).isEmpty();
    }

    @Test
    @Transactional
    // 이 테스트는 롤백이 아니라 "저장 결과(연관된 orderItems 포함)"를 검증하는 게 목적이라,
    // createOrder()가 테스트 트랜잭션에 합류(REQUIRED)해도 무방하다. 오히려 세션이 어서션까지
    // 유지되어야 orderItems(LAZY) 컬렉션에 접근할 수 있다.
    @DisplayName("정상 주문은 실제 DB에 저장된다")
    void persistOrderToRealDatabase() {
        Product savedProduct = productRepository.save(new Product("예가체프", 15000, "a.jpg"));

        OrderCreateRequest request = new OrderCreateRequest(
                "test@example.com", "12345", "서울시 강남구",
                List.of(new OrderCreateRequest.OrderItemRequest(savedProduct.getId(), 2))
        );

        orderService.createOrder(request);

        assertThat(orderRepository.findAll()).hasSize(1);
        assertThat(orderRepository.findAll().get(0).getOrderItems()).hasSize(1);
    }
}