export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalSold: number;
}

export interface StatisticsDashboardData {
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  topProducts: TopProduct[];
}
