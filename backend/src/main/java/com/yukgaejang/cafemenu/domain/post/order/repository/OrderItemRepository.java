/**
 * [관리자 통계 대시보등요 집계 쿼리]
 * - OrderItem을 기준으로 주문일(Order)와 가격(Product)를 조인하여 일/월별 매출 합계와 상품별 판매 수량 합계를 DB 레벨에서 계산한다.
 * - 애플리케이션 메모리로 전체 데이터를 끌어와 계산하지 않기 위해 JPQL의 GROUP BY/SUM을 사용한다.
 * - 반환 타입은 엔티티 대신 인터페이스 기반 projection을 사용해 필요한 컬럼만 조회한다.
 */
package com.yukgaejang.cafemenu.domain.post.order.repository;

import com.yukgaejang.cafemenu.domain.post.order.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // 일별 매출
    @Query("""
    SELECT cast(oi.order.orderDate as LocalDate) as date,
           SUM(oi.quantity * oi.product.price) as revenue
    FROM OrderItem oi
    GROUP BY cast(oi.order.orderDate as LocalDate)
    ORDER BY date DESC
""")
    List<DailyRevenueProjection> findDailyRevenue();

    interface DailyRevenueProjection {
        LocalDate getDate();
        Long getRevenue();
    }

    // 월별 매출
    @Query("""
        SELECT year(oi.order.orderDate) as year,
               month(oi.order.orderDate) as month,
               SUM(oi.quantity * oi.product.price) as revenue
        FROM OrderItem oi
        GROUP BY year(oi.order.orderDate), month(oi.order.orderDate)
        ORDER BY year(oi.order.orderDate) DESC, month(oi.order.orderDate) DESC
    """)
    List<MonthlyRevenueProjection> findMonthlyRevenue();

    interface MonthlyRevenueProjection {
        Integer getYear();
        Integer getMonth();
        Long getRevenue();
    }


    // 가장 많이 팔린 상품 Top N
    @Query("""
        SELECT oi.product.id as productId,
               oi.product.name as productName,
               SUM(oi.quantity) as totalSold
        FROM OrderItem oi
        GROUP BY oi.product.id, oi.product.name
        ORDER BY totalSold DESC
    """)
    List<TopProductProjection> findTopSellingProducts(Pageable pageable);

    interface TopProductProjection {
        Long getProductId();
        String getProductName();
        Long getTotalSold();
    }
}
