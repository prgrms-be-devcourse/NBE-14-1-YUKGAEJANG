import type { TopProduct } from '@/app/_shared/apis/statisticsApi.type';

const MEDAL_STYLES = [
  'bg-[#b88449] text-white',
  'bg-[#a9a19a] text-white',
  'bg-[#b78061] text-white',
] as const;

export default function TopProducts({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="grid min-h-[290px] place-items-center rounded-xl bg-[#fcfaf8] text-sm text-[#9a8c80]">
        아직 판매 데이터가 없습니다.
      </div>
    );
  }

  const maxSold = Math.max(...products.map(({ totalSold }) => totalSold), 1);

  return (
    <ol className="space-y-5 pt-2">
      {products.map((product, index) => (
        <li key={product.productId}>
          <div className="mb-2.5 flex items-center gap-3">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${MEDAL_STYLES[index] ?? 'bg-[#ddd4cb] text-[#594b40]'}`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#45372d]">
                {product.productName}
              </p>
              <p className="mt-0.5 text-xs text-[#a09388]">
                상품 ID {product.productId}
              </p>
            </div>
            <p className="shrink-0 text-right">
              <strong className="text-lg text-[#6f4f32]">
                {product.totalSold.toLocaleString('ko-KR')}
              </strong>
              <span className="ml-1 text-xs text-[#8e8176]">개</span>
            </p>
          </div>
          <div className="ml-11 h-2 overflow-hidden rounded-full bg-[#eee8e2]">
            <div
              className="h-full rounded-full bg-[#bd8b55]"
              style={{ width: `${(product.totalSold / maxSold) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
