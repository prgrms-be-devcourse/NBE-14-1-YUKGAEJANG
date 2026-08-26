package com.yukgaejang.cafemenu.global.util;

import java.time.LocalDateTime;

public class BatchTimeWindowUtil {

    public record BatchTimeWindow(
            LocalDateTime windowStart,
            LocalDateTime windowEnd
    ) {}

    public static BatchTimeWindow getBatchTimeWindow(LocalDateTime now) {
        LocalDateTime todayCutoff = now.toLocalDate().atTime(14, 0);

        if (now.isBefore(todayCutoff)) {
            // 아직 오늘 마감 전 -> window[어제 14:00, 금일 14:00]
            return new BatchTimeWindow(todayCutoff.minusDays(1), todayCutoff);
        } else {
            // 오늘 마감을 이미 지남 -> window[오늘 14:00, 내일 14:00]
            return new BatchTimeWindow(todayCutoff, todayCutoff.plusDays(1));
        }
    }

    public static BatchTimeWindow getBatchTimeWindow() {
        return getBatchTimeWindow(LocalDateTime.now());
    }

}
