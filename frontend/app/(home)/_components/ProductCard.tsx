import { Product } from '@/app/_shared/apis/productApi.type';
import CoffeeVisual from './CoffeeVisual';
import formatPrice from '@/app/_shared/utils/numberUtils/formatPrice';

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  return (
    <div className="group rounded-[22px] bg-white p-3.5 shadow-[0_8px_25px_rgba(87,57,31,.06)]">
      <div className="aspect-[1.05/1]">
        <CoffeeVisual product={product} />
      </div>

      <div className="px-2 pt-5">
        <p className="mb-2 text-[13px] font-medium text-[#b39a7c]">
          커피콩
        </p>

        <h3 className="text-[20px] font-medium tracking-[-0.04em] text-[#302820]">
          {product.name}
        </h3>

        <p className="mt-4 text-[23px] font-bold tracking-[-0.04em] text-[#3b2b1c]">
          {formatPrice(product.price)}
        </p>

        <button
          type="button"
          onClick={() => onAdd(product)}
          className="mt-5 flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#c7a983] text-[15px] font-medium text-white transition hover:bg-[#b89469] active:scale-[0.98]"
        >
          <span className="text-[20px] font-light">＋</span>
          추가하기
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
