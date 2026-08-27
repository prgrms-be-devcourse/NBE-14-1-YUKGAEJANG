/**
 * [관리자 통계 대시보드 서비스]
 * OrderItemRepository의 집계 쿼리 결과(projection)를 응답 DTO로 변환한다.
 * 지표 선정 기준: 전날 14:00:00 ~ 당일 13:59:59 를 하나의 배송 단위로 묶는 구조라 일별 매출이 운영자에게 가장 직관적인 지표라고 생각했습니다.
 * 월별 매출은 추세 파악용입니다.
 * Top 상품은 재고 발주 우선순위 결정에 바로 쓸 수 있어 선정했습니다.
 */

package com.yukgaejang.cafemenu.domain.post.order.service;

import com.yukgaejang.cafemenu.domain.post.order.dto.StatisticsResponse.*;
import com.yukgaejang.cafemenu.domain.post.order.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderItemRepository orderItemRepository;

    public List<DailyRevenue> getDailyRevenue() {
        return orderItemRepository.findDailyRevenue().stream()
                .map(p -> new DailyRevenue(p.getDate().toString(), p.getRevenue()))
                .toList();
    }

    public List<MonthlyRevenue> getMonthlyRevenue() {
        return orderItemRepository.findMonthlyRevenue().stream()
                .map(p -> new MonthlyRevenue(
                        String.format(Locale.ROOT, "%04d-%02d", p.getYear(), p.getMonth()),
                        p.getRevenue())).toList();
    }

    public List<TopProduct> getTopProducts(int limit) {
        return orderItemRepository.findTopSellingProducts(PageRequest.of(0, limit)).stream()
                .map(p -> new TopProduct(p.getProductId(), p.getProductName(), p.getTotalSold()))
                .toList();
    }
}
