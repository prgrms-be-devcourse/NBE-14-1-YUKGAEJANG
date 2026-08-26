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