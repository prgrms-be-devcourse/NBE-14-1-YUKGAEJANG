package com.yukgaejang.cafemenu.domain.post.order.repository;

import com.yukgaejang.cafemenu.domain.post.order.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // 일별 매출
    @Query("""
        SELECT function('DATE', oi.order.orderDate) as date,
               SUM(oi.quantity * oi.product.price) as revenue
        FROM OrderItem oi
        GROUP BY function('DATE', oi.order.orderDate)
        ORDER BY date DESC
    """)
    List<DailyRevenueProjection> findDailyRevenue();

    interface DailyRevenueProjection {
        String getDate();
        Long getRevenue();
    }

    // 월별 매출
    @Query("""
        SELECT function('DATE_FORMAT', oi.order.orderDate, '%Y-%m') as month,
               SUM(oi.quantity * oi.product.price) as revenue
        FROM OrderItem oi
        GROUP BY function('DATE_FORMAT', oi.order.orderDate, '%Y-%m')
        ORDER BY month DESC
    """)
    List<MonthlyRevenueProjection> findMonthlyRevenue();

    interface MonthlyRevenueProjection {
        String getMonth();
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