import CoffeeImageRenderer from '@/app/(home)/_components/CoffeeImageRenderer';
import { OrderResponse } from '@/app/_shared/apis/orderApi.type';
import formatPrice from '@/app/_shared/utils/numberUtils/formatPrice';
import formatOrderDateTime from '@/app/_shared/utils/dateUtils/formatOrderDateTime';
import { useMemo } from 'react';

export default function OrderCard({
  order,
  onCancel,
}: {
  order: OrderResponse;
  onCancel: (id: number) => void;
}) {
  const total = useMemo(() => {
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }, [order]); // 총 가격 합산 표시

  return (
    <article className="rounded-[14px] bg-white/80 px-6 py-5 shadow-[0_4px_18px_rgba(80,55,30,.055)]">
      <div className="grid items-center gap-5 xl:grid-cols-[160px_minmax(330px,1fr)_minmax(390px,1fr)_130px]">
        {/* Order information */}
        <div className="self-start">
          <div className="flex items-center gap-3 text-[15px]">
            <span className="text-[#65574b]">주문번호</span>

            <strong className="font-semibold text-[#3b3027]">{order.id}</strong>
          </div>

          <time
            dateTime={order.orderDate}
            className="mt-2 block whitespace-nowrap text-[15px] text-[#665a50]"
          >
            {formatOrderDateTime(order.orderDate)}
          </time>
        </div>

        {/* Products */}
        <div className="flex min-w-0 items-center gap-8">
          <div className="h-[108px] w-[138px] shrink-0">
            <CoffeeImageRenderer />
          </div>

          <div className="min-w-0 space-y-3">
            {order.items.map((item, index) => (
              <div
                key={`${item.productName}-${index}`}
                className="flex items-center gap-4"
              >
                <span className="whitespace-nowrap text-[16px] text-[#45382d]">
                  {item.productName}
                </span>

                <span className="rounded-[7px] bg-[#f1ebe3] px-3 py-1 text-[13px] font-medium text-[#756454]">
                  {item.quantity}개
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping information */}
        <div className="border-l border-[#eee7df] pl-8">
          <div className="grid grid-cols-[72px_1fr] gap-y-5 text-[14px]">
            <span className="text-[#81756a]">이메일</span>
            <span className="truncate text-[#5d5147]">{order.email}</span>

            <span className="text-[#81756a]">배송지</span>
            <span className="truncate text-[#5d5147]">{order.address}</span>

            <span className="text-[#81756a]">우편번호</span>
            <span className="text-[#5d5147]">{order.zipCode}</span>
          </div>
        </div>

        {/* Price / Cancel */}
        <div className="flex flex-col items-end gap-5">
          <strong className="text-[24px] font-bold tracking-[-0.04em] text-[#3d3025]">
            {formatPrice(total)}
          </strong>

          <button
            type="button"
            onClick={() => onCancel(order.id)}
            className="rounded-[8px] border border-[#d9877c] px-5 py-2 text-[14px] font-medium text-[#bd5c50] transition hover:bg-[#fff4f2] active:scale-[0.98]"
          >
            주문 취소
          </button>
        </div>
      </div>
    </article>
  );
}
