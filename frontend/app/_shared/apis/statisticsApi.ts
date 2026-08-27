import type {
  DailyRevenue,
  MonthlyRevenue,
  StatisticsDashboardData,
  TopProduct,
} from './statisticsApi.type';
import { API_BASE_URL } from './apiConfig';

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`통계 데이터를 불러오지 못했습니다. (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function getStatisticsDashboard(
  signal?: AbortSignal,
): Promise<StatisticsDashboardData> {
  const [dailyRevenue, monthlyRevenue, topProducts] = await Promise.all([
    getJson<DailyRevenue[]>('/admin/statistics/revenue/daily', signal),
    getJson<MonthlyRevenue[]>('/admin/statistics/revenue/monthly', signal),
    getJson<TopProduct[]>('/admin/statistics/top-products?limit=3', signal),
  ]);

  return { dailyRevenue, monthlyRevenue, topProducts };
}
