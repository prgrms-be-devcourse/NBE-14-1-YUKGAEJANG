package com.yukgaejang.cafemenu.global.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("BatchTimeWindowUtil")
class BatchTimeWindowUtilTest {

    @Test
    @DisplayName("오후 1시 59분 59초는 당일 배송 그룹에 속한다")
    void includeInSameDayGroupWhenBeforeCutoff() {
        // given
        LocalDateTime now = LocalDateTime.of(2026, 8, 26, 13, 59, 59);

        // when
        var window = BatchTimeWindowUtil.getBatchTimeWindow(now);

        // then
        assertThat(now).isAfterOrEqualTo(window.windowStart());
        assertThat(now).isBefore(window.windowEnd());
    }
    @Test
    @DisplayName("오후 2시 정각은 다음 배송 그룹으로 넘어간다")
    void moveToNextGroupWhenExactlyAtCutoff() {
        // given
        LocalDateTime now = LocalDateTime.of(2026, 8, 26, 14, 0, 0);

        // when
        var window = BatchTimeWindowUtil.getBatchTimeWindow(now);

        // then
        // 정책: 당일 14:00:00부터 다음날 13:59:59까지가 같은 묶음이므로,
        // 14:00:00 정각은 windowStart(포함)가 되어야 한다.
        assertThat(window.windowStart()).isEqualTo(LocalDateTime.of(2026, 8, 26, 14, 0, 0));
        assertThat(window.windowEnd()).isEqualTo(LocalDateTime.of(2026, 8, 27, 14, 0, 0));
    }

    @Test
    @DisplayName("오후 2시 00분 01초는 당일 마감 창에 포함되지 않는다")
    void excludeFromCurrentWindowJustAfterCutoff() {
        // given
        LocalDateTime now = LocalDateTime.of(2026, 8, 26, 14, 0, 1);

        // when
        var window = BatchTimeWindowUtil.getBatchTimeWindow(now);

        // then
        // 이 시각을 기준으로 새로 시작되는 마감 창은 "오늘 14:00 ~ 내일 14:00"이어야 한다
        assertThat(window.windowStart()).isEqualTo(LocalDateTime.of(2026, 8, 26, 14, 0, 0));
        assertThat(window.windowEnd()).isEqualTo(LocalDateTime.of(2026, 8, 27, 14, 0, 0));
    }

    @Test
    @DisplayName("자정 직후(00:00:01)에도 전날 14시부터 당일 14시까지가 마감 창이 된다")
    void calculateWindowCorrectlyRightAfterMidnight() {
        // given
        LocalDateTime now = LocalDateTime.of(2026, 8, 26, 0, 0, 1);

        // when
        var window = BatchTimeWindowUtil.getBatchTimeWindow(now);

        // then
        assertThat(window.windowStart()).isEqualTo(LocalDateTime.of(2026, 8, 25, 14, 0, 0));
        assertThat(window.windowEnd()).isEqualTo(LocalDateTime.of(2026, 8, 26, 14, 0, 0));
    }

    @Test
    @DisplayName("now를 넘기지 않으면 현재 시각 기준으로 마감 창을 계산한다")
    void useCurrentTimeWhenNoArgumentGiven() {
        // when
        var window = BatchTimeWindowUtil.getBatchTimeWindow();

        // then
        LocalDateTime now = LocalDateTime.now();
        assertThat(now).isAfterOrEqualTo(window.windowStart());
        assertThat(now).isBefore(window.windowEnd().plusSeconds(1)); // 실행 시차 여유
    }
}