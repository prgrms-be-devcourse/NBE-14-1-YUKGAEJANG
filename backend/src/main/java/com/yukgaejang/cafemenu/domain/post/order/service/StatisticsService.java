package com.yukgaejang.cafemenu.domain.post.order.service;

import com.yukgaejang.cafemenu.domain.post.order.dto.StatisticsResponse.*;
import com.yukgaejang.cafemenu.domain.post.order.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderItemRepository orderItemRepository;

    public List<DailyRevenue> getDailyRevenue() {
        return orderItemRepository.findDailyRevenue().stream()
                .map(p -> new DailyRevenue(p.getDate(), p.getRevenue()))
                .toList();
    }

    public List<MonthlyRevenue> getMonthlyRevenue() {
        return orderItemRepository.findMonthlyRevenue().stream()
                .map(p -> new MonthlyRevenue(p.getMonth(), p.getRevenue()))
                .toList();
    }

    public List<TopProduct> getTopProducts(int limit) {
        return orderItemRepository.findTopSellingProducts(PageRequest.of(0, limit)).stream()
                .map(p -> new TopProduct(p.getProductId(), p.getProductName(), p.getTotalSold()))
                .toList();
    }
}