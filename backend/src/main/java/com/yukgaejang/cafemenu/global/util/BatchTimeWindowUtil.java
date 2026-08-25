package com.yukgaejang.cafemenu.global.util;

import java.time.LocalDateTime;

public class BatchTimeWindowUtil {

    public record BatchTimeWindow(
            LocalDateTime windowStart,
            LocalDateTime windowEnd
    ) {}

    public static BatchTimeWindow getBatchTimeWindow(
            LocalDateTime now
    ) {
        LocalDateTime windowStart = now.toLocalDate().atTime(14, 0).minusDays(1);
        LocalDateTime windowEnd = now.toLocalDate().atTime(14, 0);

        return new BatchTimeWindow(windowStart, windowEnd);
    }

    public static BatchTimeWindow getBatchTimeWindow() {
        return getBatchTimeWindow(LocalDateTime.now());
    }

}
