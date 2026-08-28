'use client';

import { useEffect, useMemo, useState } from 'react';

import { getStatisticsDashboard } from '@/app/_shared/apis/statisticsApi';
import type { StatisticsDashboardData } from '@/app/_shared/apis/statisticsApi.type';
import RevenueChart from './_components/RevenueChart';
import TopProducts from './_components/TopProducts';

const INITIAL_DATA: StatisticsDashboardData = {
  dailyRevenue: [],
  monthlyRevenue: [],
  topProducts: [],
};

type ChartPeriod = 'daily' | 'monthly';

const formatPrice = (value: number) => `${value.toLocaleString('ko-KR')}원`;
const formatShortDate = (value: string) => value.slice(5).replace('-', '.');

const getPreviousDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return `${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(2, '0')}`;
};

const formatAggregationPeriod = (date?: string) =>
  date
    ? `${getPreviousDate(date)} 14:00 – ${formatShortDate(date)} 14:00`
    : '집계 기간 데이터 없음';

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsDashboardData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('daily');

  useEffect(() => {
    const controller = new AbortController();

    getStatisticsDashboard(controller.signal)
      .then((result) => setData(result))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError(
          reason instanceof Error
            ? reason.message
            : '통계 데이터를 불러오는 중 문제가 발생했습니다.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const reload = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const daily = useMemo(
    () => [...data.dailyRevenue].sort((a, b) => a.date.localeCompare(b.date)),
    [data.dailyRevenue],
  );
  const monthly = useMemo(
    () => [...data.monthlyRevenue].sort((a, b) => a.month.localeCompare(b.month)),
    [data.monthlyRevenue],
  );
  const latestDay = daily.at(-1);
  const previousDay = daily.at(-2);
  const latestMonth = monthly.at(-1);
  const totalRevenue = monthly.reduce((sum, item) => sum + item.revenue, 0);
  const dailyChange =
    latestDay && previousDay && previousDay.revenue > 0
      ? ((latestDay.revenue - previousDay.revenue) / previousDay.revenue) * 100
      : null;
  const recentDaily = daily.slice(-7).map((item) => ({
    label: formatShortDate(item.date),
    revenue: item.revenue,
  }));
  const recentMonthly = monthly.slice(-6).map((item) => ({
    label: item.month.slice(2).replace('-', '.'),
    revenue: item.revenue,
  }));
  const chartData = chartPeriod === 'daily' ? recentDaily : recentMonthly;

  return (
    <main className="min-w-0 flex-1 bg-[var(--bg-primary)] px-5 py-8 text-[var(--text-primary)] sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1240px]">
        <header className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.03em]">통계</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {formatAggregationPeriod(latestDay?.date)} 기준
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] border border-[var(--border-subtle)] bg-white px-4 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] disabled:cursor-wait disabled:opacity-60"
          >
            <span className={isLoading ? 'animate-spin' : ''} aria-hidden="true">↻</span>
            {isLoading ? '새로고침 중' : '새로고침'}
          </button>
        </header>

        {error && (
          <section role="alert" className="mb-8 flex flex-col gap-3 rounded-xl border border-[#efd3d3] bg-[var(--negative-bg)] p-5 text-sm text-[var(--negative)] sm:flex-row sm:items-center sm:justify-between">
            <p>{error} 백엔드 서버 실행 상태를 확인해 주세요.</p>
            <button type="button" onClick={reload} className="shrink-0 font-semibold underline underline-offset-4">다시 시도</button>
          </section>
        )}

        <section aria-label="핵심 매출 지표">
          <p className="text-[15px] font-medium text-[var(--text-secondary)]">최근 집계 매출</p>
          {isLoading ? (
            <div className="mt-4 h-12 w-60 animate-pulse rounded-lg bg-[var(--bg-subtle)]" />
          ) : (
            <p className="mt-3 text-[38px] font-bold tracking-[-0.04em] tabular-nums sm:text-[46px]">
              {latestDay ? formatPrice(latestDay.revenue) : '집계 데이터 없음'}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
            <span className="text-[var(--text-tertiary)]">{formatAggregationPeriod(latestDay?.date)}</span>
            <ChangeIndicator change={dailyChange} />
          </div>

          <div className="mt-9 grid max-w-[620px] grid-cols-1 gap-6 border-t border-[var(--border-subtle)] pt-7 min-[430px]:grid-cols-2 sm:gap-12">
            <SecondaryMetric label="누적 매출" value={formatPrice(totalRevenue)} loading={isLoading} />
            <SecondaryMetric label="이번 달 매출" value={latestMonth ? formatPrice(latestMonth.revenue) : '데이터 없음'} loading={isLoading} />
          </div>
        </section>

        <div className="mt-12 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[0_1px_2px_rgba(29,27,25,0.04)] sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-[-0.02em]">매출 추이</h2>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{chartPeriod === 'daily' ? '최근 7개 집계일' : '최근 6개월'} 기준</p>
              </div>
              <div className="flex rounded-lg bg-[var(--bg-subtle)] p-1" role="group" aria-label="매출 추이 기간">
                {(['daily', 'monthly'] as const).map((period) => (
                  <button
                    type="button"
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    aria-pressed={chartPeriod === period}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${chartPeriod === period ? 'bg-white text-[var(--text-primary)] shadow-[0_1px_2px_rgba(29,27,25,0.06)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                  >
                    {period === 'daily' ? '일별' : '월별'}
                  </button>
                ))}
              </div>
            </div>
            {isLoading ? <ChartSkeleton /> : <RevenueChart data={chartData} emptyMessage="매출 추이를 표시하기 위한 데이터가 아직 충분하지 않습니다." />}
          </section>

          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[0_1px_2px_rgba(29,27,25,0.04)] sm:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-[-0.02em]">판매량 순위</h2>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">누적 판매 수량 기준</p>
            </div>
            {isLoading ? <ListSkeleton /> : <TopProducts products={data.topProducts} />}
          </section>
        </div>

        <p className="mt-4 text-right text-[11px] text-[var(--text-tertiary)]">매출은 주문 생성일과 주문 상품의 현재 단가를 기준으로 집계합니다.</p>
      </div>
    </main>
  );
}

function ChangeIndicator({ change }: { change: number | null }) {
  if (change === null) return <span className="text-[var(--text-secondary)]">전 집계 대비 데이터 없음</span>;

  const isPositive = change >= 0;
  return (
    <span className={`rounded-full px-2.5 py-1 font-semibold ${isPositive ? 'bg-[var(--positive-bg)] text-[var(--positive)]' : 'bg-[var(--negative-bg)] text-[var(--negative)]'}`}>
      {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% 전 집계 대비
    </span>
  );
}

function SecondaryMetric({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</p>
      {loading ? <div className="mt-3 h-7 w-36 animate-pulse rounded bg-[var(--bg-subtle)]" /> : <p className="mt-2 text-2xl font-bold tracking-[-0.03em] tabular-nums">{value}</p>}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-[300px] animate-pulse rounded-xl bg-[var(--bg-subtle)]" aria-label="차트 불러오는 중" />;
}

function ListSkeleton() {
  return <div className="h-[260px] animate-pulse rounded-xl bg-[var(--bg-subtle)]" aria-label="상품 순위 불러오는 중" />;
}
