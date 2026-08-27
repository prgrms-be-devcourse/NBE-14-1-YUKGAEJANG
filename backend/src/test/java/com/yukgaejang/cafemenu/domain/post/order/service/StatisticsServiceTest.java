package com.yukgaejang.cafemenu.domain.post.order.service;

import com.yukgaejang.cafemenu.domain.post.order.dto.StatisticsResponse;
import com.yukgaejang.cafemenu.domain.post.order.repository.OrderItemRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("StatisticsService")
class StatisticsServiceTest {

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private StatisticsService statisticsService;

    @Test
    @DisplayName("일별 매출 Projection을 응답 DTO로 변환한다")
    void getDailyRevenue() {
        OrderItemRepository.DailyRevenueProjection projection =
                mock(OrderItemRepository.DailyRevenueProjection.class);

        when(projection.getDate()).thenReturn(LocalDate.of(2026, 8, 27));
        when(projection.getRevenue()).thenReturn(150_000L);
        when(orderItemRepository.findDailyRevenue())
                .thenReturn(List.of(projection));

        List<StatisticsResponse.DailyRevenue> result =
                statisticsService.getDailyRevenue();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().date())
                .isEqualTo("2026-08-27");
        assertThat(result.getFirst().revenue())
                .isEqualTo(150_000L);
    }

    @Test
    @DisplayName("연도와 월을 YYYY-MM 형식으로 변환한다")
    void getMonthlyRevenue() {
        OrderItemRepository.MonthlyRevenueProjection projection =
                mock(OrderItemRepository.MonthlyRevenueProjection.class);

        when(projection.getYear()).thenReturn(2026);
        when(projection.getMonth()).thenReturn(8);
        when(projection.getRevenue()).thenReturn(500_000L);
        when(orderItemRepository.findMonthlyRevenue())
                .thenReturn(List.of(projection));

        List<StatisticsResponse.MonthlyRevenue> result =
                statisticsService.getMonthlyRevenue();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().month())
                .isEqualTo("2026-08");
        assertThat(result.getFirst().revenue())
                .isEqualTo(500_000L);
    }

    @Test
    @DisplayName("요청한 개수만큼 인기 상품을 조회한다")
    void getTopProducts() {
        OrderItemRepository.TopProductProjection projection =
                mock(OrderItemRepository.TopProductProjection.class);

        when(projection.getProductId()).thenReturn(1L);
        when(projection.getProductName()).thenReturn("에티오피아");
        when(projection.getTotalSold()).thenReturn(10L);

        when(orderItemRepository.findTopSellingProducts(
                org.mockito.ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of(projection));

        List<StatisticsResponse.TopProduct> result =
                statisticsService.getTopProducts(3);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().productId()).isEqualTo(1L);
        assertThat(result.getFirst().productName())
                .isEqualTo("에티오피아");
        assertThat(result.getFirst().totalSold()).isEqualTo(10L);

        ArgumentCaptor<Pageable> pageableCaptor =
                ArgumentCaptor.forClass(Pageable.class);

        verify(orderItemRepository)
                .findTopSellingProducts(pageableCaptor.capture());

        assertThat(pageableCaptor.getValue().getPageNumber())
                .isZero();
        assertThat(pageableCaptor.getValue().getPageSize())
                .isEqualTo(3);
    }

    @Test
    @DisplayName("집계 데이터가 없으면 빈 목록을 반환한다")
    void returnEmptyLists() {
        when(orderItemRepository.findDailyRevenue())
                .thenReturn(List.of());
        when(orderItemRepository.findMonthlyRevenue())
                .thenReturn(List.of());
        when(orderItemRepository.findTopSellingProducts(
                org.mockito.ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of());

        assertThat(statisticsService.getDailyRevenue()).isEmpty();
        assertThat(statisticsService.getMonthlyRevenue()).isEmpty();
        assertThat(statisticsService.getTopProducts(3)).isEmpty();
    }
}