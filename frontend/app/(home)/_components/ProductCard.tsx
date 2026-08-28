import { ProductResponse } from '@/app/_shared/apis/productApi.type';
import formatPrice from '@/app/_shared/utils/numberUtils/formatPrice';
import CoffeeImageRenderer from './CoffeeImageRenderer';

function ProductCard({
  product,
  onAdd,
}: {
  product: ProductResponse;
  onAdd: (product: ProductResponse) => void;
}) {
  return (
    <div className="group flex h-full w-full flex-col rounded-[18px] bg-white p-3 shadow-[0_8px_25px_rgba(87,57,31,.06)] sm:rounded-[20px] sm:p-3.5">
      {/* 상품 이미지 */}
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-[14px]">
        <CoffeeImageRenderer />
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-1 flex-col px-1.5 pt-4 sm:px-2 sm:pt-5">
        <p className="mb-1 shrink-0 text-[12px] font-medium text-[#b39a7c] sm:text-[13px]">
          커피콩
        </p>

        {/* 상품명 영역 높이 고정 */}
        <h3 className="line-clamp-2 h-[48px] overflow-hidden text-[17px] font-medium leading-6 tracking-[-0.04em] text-[#302820] sm:h-[56px] sm:text-[19px] sm:leading-7">
          {product.name}
        </h3>

        {/* 가격 */}
        <p className="mt-1 shrink-0 text-[20px] font-bold tracking-[-0.04em] text-[#3b2b1c] sm:mt-1 sm:text-[22px]">
          {formatPrice(product.price)}
        </p>

        {/* 버튼 */}
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="mt-4 flex h-[44px] shrink-0 w-full items-center justify-center gap-2 rounded-[10px] bg-[#c7a983] text-[14px] font-medium text-white transition hover:bg-[#b89469] active:scale-[0.98]"
        >
          <span className="text-[19px] font-light">＋</span>
          추가하기
        </button>
      </div>
    </div>
  );
}

export default ProductCard;