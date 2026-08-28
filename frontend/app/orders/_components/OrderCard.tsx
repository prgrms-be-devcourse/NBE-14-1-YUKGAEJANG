import CoffeeImageRenderer from '@/app/(home)/_components/CoffeeImageRenderer';
import { OrderResponse } from '@/app/_shared/apis/orderApi.type';
import formatPrice from '@/app/_shared/utils/numberUtils/formatPrice';
import formatOrderDateTime from '@/app/_shared/utils/dateUtils/formatOrderDateTime';
import { useMemo, useState } from 'react';

export default function OrderCard({
  order,
  onCancel,
  onUpdateAddress,
}: {
  order: OrderResponse;
  onCancel: (id: number) => void;
  onUpdateAddress: (
    id: number,
    address: string,
    zipCode: string
  ) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState(order.address);
  const [zipCode, setZipCode] = useState(order.zipCode);
  const [isSaving, setIsSaving] = useState(false);

  const total = useMemo(() => {
    return order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );  //가격 합산 되서 나오게
  }, [order]);

  const handleEdit = () => {
    setAddress(order.address);
    setZipCode(order.zipCode);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setAddress(order.address);
    setZipCode(order.zipCode);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!address.trim() || !zipCode.trim()) {
      return;
    }

    try {
      setIsSaving(true);

      await onUpdateAddress(
        order.id,
        address.trim(),
        zipCode.trim()
      );

      setIsEditing(false);
    } catch (error) {
      console.error(error);
      window.alert('배송지 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="rounded-[14px] bg-white/80 px-6 py-5 shadow-[0_4px_18px_rgba(80,55,30,.055)]">
      <div className="grid items-center gap-5 xl:grid-cols-[minmax(330px,1fr)_minmax(390px,1fr)_130px]">
        {/* 왼쪽: 주문 정보 + 상품 */}
        <div>
          <div>
            <div className="flex items-center gap-3 text-[15px]">
              <span className="text-[#65574b]">주문번호</span>

              <strong className="font-semibold text-[#3b3027]">
                #{order.id}
              </strong>
            </div>

            <time
              dateTime={order.orderDate}
              className="mt-2 block whitespace-nowrap text-[15px] text-[#665a50]"
            >
              {formatOrderDateTime(order.orderDate)}
            </time>
          </div>

          {/* 상품 */}
          <div className="mt-5 flex min-w-0 items-center gap-8">
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
        </div>

        {/* 배송 정보 */}
        <div className="border-l border-[#eee7df] pl-8">
          {isEditing ? (
            <div className="space-y-4">
              {/* 이메일 */}
              <div className="grid grid-cols-[72px_1fr] items-center text-[14px]">
                <span className="text-[#81756a]">
                  이메일
                </span>

                <span className="truncate text-[#5d5147]">
                  {order.email}
                </span>
              </div>

              {/* 배송지 */}
              <div className="grid grid-cols-[72px_1fr] items-center text-[14px]">
                <label
                  htmlFor={`address-${order.id}`}
                  className="text-[#81756a]"
                >
                  배송지
                </label>

                <input
                  id={`address-${order.id}`}
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  disabled={isSaving}
                  className="h-9 rounded-[7px] border border-[#ded4c9] bg-white px-3 text-[#5d5147] outline-none transition placeholder:text-[#b1a79e] focus:border-[#9d8771] disabled:bg-[#f6f2ed]"
                />
              </div>

              {/* 우편번호 */}
              <div className="grid grid-cols-[72px_1fr] items-center text-[14px]">
                <label
                  htmlFor={`zipCode-${order.id}`}
                  className="text-[#81756a]"
                >
                  우편번호
                </label>

                <input
                  id={`zipCode-${order.id}`}
                  type="text"
                  value={zipCode}
                  onChange={(event) =>
                    setZipCode(event.target.value)
                  }
                  disabled={isSaving}
                  className="h-9 rounded-[7px] border border-[#ded4c9] bg-white px-3 text-[#5d5147] outline-none transition placeholder:text-[#b1a79e] focus:border-[#9d8771] disabled:bg-[#f6f2ed]"
                />
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="rounded-[7px] border border-[#ded4c9] px-4 py-1.5 text-[13px] font-medium text-[#74675b] transition hover:bg-[#f8f4ee] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    !address.trim() ||
                    !zipCode.trim()
                  }
                  className="rounded-[7px] bg-[#59483a] px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#493a2f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[72px_1fr] gap-y-5 text-[14px]">
              <span className="text-[#81756a]">
                이메일
              </span>

              <span className="truncate text-[#5d5147]">
                {order.email}
              </span>

              <span className="text-[#81756a]">
                배송지
              </span>

              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate text-[#5d5147]">
                  {order.address}
                </span>

                <button
                  type="button"
                  onClick={handleEdit}
                  className="shrink-0 text-[12px] font-medium text-[#9a7357] underline underline-offset-2 transition hover:text-[#6f5040]"
                >
                  수정
                </button>
              </div>

              <span className="text-[#81756a]">
                우편번호
              </span>

              <span className="text-[#5d5147]">
                {order.zipCode}
              </span>
            </div>
          )}
        </div>

        {/* 가격 / 주문 취소 */}
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
