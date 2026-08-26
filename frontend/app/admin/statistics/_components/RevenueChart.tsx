type RevenuePoint = {
  label: string;
  revenue: number;
};

type RevenueChartProps = {
  data: RevenuePoint[];
  emptyMessage: string;
};

const WIDTH = 720;
const HEIGHT = 260;
const PADDING = { top: 20, right: 18, bottom: 42, left: 76 };

const formatCompactPrice = (value: number) => {
  if (value >= 100_000_000) return `${Math.round(value / 100_000_000)}억`;
  if (value >= 10_000) return `${Math.round(value / 10_000)}만`;
  return value.toLocaleString('ko-KR');
};

export default function RevenueChart({ data, emptyMessage }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="grid h-[260px] place-items-center rounded-xl bg-[#fcfaf8] text-sm text-[#9a8c80]">
        {emptyMessage}
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(({ revenue }) => revenue), 1);
  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const gap = chartWidth / data.length;
  const barWidth = Math.min(46, Math.max(10, gap * 0.58));
  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-[260px] min-w-[600px] w-full"
        role="img"
        aria-label="매출 막대그래프"
      >
        {gridValues.map((ratio) => {
          const y = PADDING.top + chartHeight * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                stroke="#eee8e1"
                strokeDasharray="4 5"
              />
              <text
                x={PADDING.left - 12}
                y={y + 4}
                textAnchor="end"
                className="fill-[#9b8f84] text-[11px]"
              >
                {formatCompactPrice(maxRevenue * ratio)}
              </text>
            </g>
          );
        })}

        {data.map(({ label, revenue }, index) => {
          const height = (revenue / maxRevenue) * chartHeight;
          const x = PADDING.left + index * gap + (gap - barWidth) / 2;
          const y = PADDING.top + chartHeight - height;

          return (
            <g key={`${label}-${index}`}>
              <title>{`${label}: ${revenue.toLocaleString('ko-KR')}원`}</title>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(height, 2)}
                rx="6"
                fill="#a97945"
              />
              <text
                x={x + barWidth / 2}
                y={HEIGHT - 16}
                textAnchor="middle"
                className="fill-[#786b60] text-[11px]"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
