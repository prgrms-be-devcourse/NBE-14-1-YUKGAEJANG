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

const formatPrice = (value: number) => `${value.toLocaleString('ko-KR')}원`;

const formatDate = (value?: string) => {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return day ? `${year}.${month}.${day}` : `${year}.${month}`;
};

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsDashboardData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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
    label: item.date.slice(5).replace('-', '.'),
    revenue: item.revenue,
  }));
  const recentMonthly = monthly.slice(-6).map((item) => ({
    label: item.month.slice(2).replace('-', '.'),
    revenue: item.revenue,
  }));

  return (
    <main className="min-w-0 flex-1 px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-[1168px]">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-[28px] font-bold tracking-[-0.04em] text-[#392c23]">
              통계 대시보드
            </h1>
            <p className="text-sm text-[#96877b]">
              매출 흐름과 판매 성과를 한눈에 확인할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#ded4ca] bg-white px-4 text-sm font-semibold text-[#67574a] transition hover:bg-[#faf6f1] disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? '불러오는 중...' : '새로고침'}
          </button>
        </div>

        {error && (
          <section
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-[#e6c9bf] bg-[#fff8f5] p-5 text-sm text-[#8b4939] sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error} 백엔드 서버 실행 상태를 확인해 주세요.</p>
            <button
              type="button"
              onClick={reload}
              className="shrink-0 font-bold underline underline-offset-4"
            >
              다시 시도
            </button>
          </section>
        )}

        <section aria-label="핵심 매출 지표" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="누적 매출" value={formatPrice(totalRevenue)} helper="전체 월별 매출 합계" loading={isLoading} />
          <SummaryCard label="최근 집계일 매출" value={latestDay ? formatPrice(latestDay.revenue) : '-'} helper={formatDate(latestDay?.date)} loading={isLoading} />
          <SummaryCard
            label="이전 집계일 대비"
            value={dailyChange === null ? '-' : `${dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(1)}%`}
            helper={dailyChange === null ? '비교할 데이터가 없습니다' : dailyChange >= 0 ? '매출이 증가했습니다' : '매출이 감소했습니다'}
            valueClassName={dailyChange === null ? '' : dailyChange >= 0 ? 'text-[#4d7656]' : 'text-[#a85e50]'}
            loading={isLoading}
          />
          <SummaryCard label="최근 월 매출" value={latestMonth ? formatPrice(latestMonth.revenue) : '-'} helper={formatDate(latestMonth?.month)} loading={isLoading} />
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)]">
          <DashboardCard title="일별 매출 추이" description="최근 7개 집계일 기준">
            {isLoading ? <ChartSkeleton /> : <RevenueChart data={recentDaily} emptyMessage="아직 일별 매출 데이터가 없습니다." />}
          </DashboardCard>
          <DashboardCard title="판매량 Top 3" description="누적 판매 수량 기준">
            {isLoading ? <ListSkeleton /> : <TopProducts products={data.topProducts} />}
          </DashboardCard>
        </div>

        <div className="mt-5">
          <DashboardCard title="월별 매출 추이" description="최근 6개월 기준">
            {isLoading ? <ChartSkeleton /> : <RevenueChart data={recentMonthly} emptyMessage="아직 월별 매출 데이터가 없습니다." />}
          </DashboardCard>
        </div>

        <p className="mt-4 text-right text-[11px] text-[#9b8f85]">
          매출은 주문 생성일과 주문 상품의 현재 단가를 기준으로 집계합니다.
        </p>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, helper, loading, valueClassName = '' }: { label: string; value: string; helper: string; loading: boolean; valueClassName?: string }) {
  return (
    <article className="rounded-2xl border border-[#eee7df] bg-white p-5 shadow-[0_7px_25px_rgba(76,54,38,0.035)]">
      <p className="text-xs font-semibold text-[#8e8176]">{label}</p>
      {loading ? <div className="mt-4 h-7 w-3/4 animate-pulse rounded bg-[#eee8e2]" /> : <p className={`mt-3 truncate text-2xl font-bold tracking-[-0.035em] text-[#45352a] ${valueClassName}`}>{value}</p>}
      <p className="mt-2 truncate text-xs text-[#a3978d]">{helper}</p>
    </article>
  );
}

function DashboardCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#eee7df] bg-white p-5 shadow-[0_7px_25px_rgba(76,54,38,0.035)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-[#493a30]">{title}</h2>
        <p className="mt-1 text-xs text-[#a09388]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ChartSkeleton() {
  return <div className="h-[260px] animate-pulse rounded-xl bg-[#f3eee9]" aria-label="차트 불러오는 중" />;
}

function ListSkeleton() {
  return <div className="h-[290px] animate-pulse rounded-xl bg-[#f3eee9]" aria-label="상품 순위 불러오는 중" />;
}
