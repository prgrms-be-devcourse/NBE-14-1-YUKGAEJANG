/**
 * [관리자 통계 대시보드 API]
 * GET /admin/statistics/revenue/daily   - 일별 매출
 * GET /admin/statistics/revenue/monthly - 월별 매출
 * GET /admin/statistics/top-products    - 판매량 기준 상위 상품 (기본 3개)
 *
 * WebConfig에 의해 /api/v1 접두어가 자동으로 붙으므로, 상대 경로(/admin/statistics)만 명시했습니다.
 */
package com.yukgaejang.cafemenu.domain.post.order.controller;

import com.yukgaejang.cafemenu.domain.post.order.dto.StatisticsResponse.*;
import com.yukgaejang.cafemenu.domain.post.order.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/revenue/daily")
    public List<DailyRevenue> dailyRevenue() {
        return statisticsService.getDailyRevenue();
    }

    @GetMapping("/revenue/monthly")
    public List<MonthlyRevenue> monthlyRevenue() {
        return statisticsService.getMonthlyRevenue();
    }

    @GetMapping("/top-products")
    public List<TopProduct> topProducts(@RequestParam(defaultValue = "3") int limit) {
        return statisticsService.getTopProducts(limit);
    }
}