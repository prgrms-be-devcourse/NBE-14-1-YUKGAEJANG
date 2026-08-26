package com.yukgaejang.cafemenu.domain.post.order.dto;

public class StatisticsResponse {
    public record DailyRevenue(String date, long revenue) {}
    public record MonthlyRevenue(String month, long revenue) {}
    public record TopProduct(Long productId, String productName, long totalSold) {}
}