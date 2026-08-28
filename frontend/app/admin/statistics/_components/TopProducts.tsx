import type { TopProduct } from '@/app/_shared/apis/statisticsApi.type';

export default function TopProducts({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="grid min-h-[260px] place-items-center text-center text-sm text-[var(--text-tertiary)]">
        아직 판매 데이터가 없습니다.
      </div>
    );
  }

  const maxSold = Math.max(...products.map(({ totalSold }) => totalSold), 1);

  return (
    <ol className="space-y-7 pt-2">
      {products.map((product, index) => (
        <li key={product.productId}>
          <div className="mb-3 flex items-center gap-3">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${index === 0 ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'}`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {product.productName}
              </p>
            </div>
            <p className="shrink-0 text-right tabular-nums">
              <strong className={index === 0 ? 'text-lg text-[var(--accent-primary)]' : 'text-lg text-[var(--text-primary)]'}>
                {product.totalSold.toLocaleString('ko-KR')}
              </strong>
              <span className="ml-1 text-xs text-[var(--text-secondary)]">개</span>
            </p>
          </div>
          <div className="ml-11 h-1.5 overflow-hidden rounded-full bg-[#EEEAE5]">
            <div
              className="h-full rounded-full bg-[var(--accent-primary)]"
              style={{ width: `${(product.totalSold / maxSold) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
