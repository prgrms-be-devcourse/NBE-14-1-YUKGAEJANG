'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartItem, ProductListResponse, ProductResponse } from '../_shared/apis/productApi.type';
import formatPrice from '../_shared/utils/numberUtils/formatPrice';
import ProductCard from './_components/ProductCard';
import PageHeader from './_components/PageHeader';
import { useRouter } from 'next/navigation';
import { CreditCardIcon, ReceiptIcon } from '../_shared/components/icons/icons';

export default function Page() {
  const [productData, setProductData] = useState<ProductListResponse | null>(null); //상품 목록 저장 공간
  useEffect(() => {
    async function fetchProducts() {
      const response = await fetch('http://localhost:8080/api/v1/products', {
        method: 'GET',
      });

      const responseData = await response.json();
      setProductData(responseData);
    }

    fetchProducts();
  }, []);

  const [cart, setCart] = useState<CartItem[]>([]); //처음에 선택된 상품 없게
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  const addToCart = (product: ProductResponse) => {
    setCart((current) => {
      const exists = current.find((item) => item.product.id === product.id);

      if (exists) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                product: item.product,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          product,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id: number, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handlePayment = async () => {
    if (!email || !address || !zipCode) {
      alert('이메일, 주소, 우편번호를 모두 입력해주세요.');
      return;
    }

    if (cart.length === 0) {
      alert('상품을 선택해주세요.');
      return;
    }

    //주문 api 연결
    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const requestBody = {
      email,
      zipCode,
      address,
      items,
    };

    const response = await fetch('http://localhost:8080/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();

      console.error('주문 실패:', errorData);
      alert(errorData.message ?? '주문에 실패했습니다.');
      return;
    }

    alert(`총 ${formatPrice(total)} 결제를 진행합니다.`);
  };

  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 py-8 text-[#35291e] sm:px-8 lg:px-10">
      {/* page */}
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <PageHeader />

        {/* Main container */}
        <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-[0_15px_35px_rgba(91,64,38,.13)] backdrop-blur">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_430px]">
            {/* Products */}
            <div className="p-8 sm:p-10 lg:p-11">
              <h2 className="mb-9 text-[24px] font-bold tracking-[-0.04em]">
                상품 목록
              </h2>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {productData?.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <aside className="border-t border-[#eee6dc] bg-[#f8f3eb]/90 p-8 sm:p-10 lg:border-l lg:border-t-0">
              <h2 className="mb-8 text-[24px] font-bold tracking-[-0.04em]">
                주문 요약
              </h2>

              {/* Cart */}
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <p className="py-4 text-sm text-[#9c8e7f]">
                    선택한 상품이 없습니다.
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="min-w-0 truncate text-[16px] font-medium">
                        {item.product.name}
                      </span>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9e0d4] text-[#735c43] transition hover:bg-[#ded1c0]"
                          aria-label="수량 감소"
                        >
                          −
                        </button>

                        <span className="min-w-[28px] text-center text-[13px] font-semibold">
                          {item.quantity}개
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9e0d4] text-[#735c43] transition hover:bg-[#ded1c0]"
                          aria-label="수량 증가"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="my-8 h-px bg-[#e2d8cc]" />

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePayment();
                }}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[15px] font-medium"
                  >
                    이메일
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력해주세요"
                    className="h-[54px] w-full rounded-[10px] border border-[#e4dace] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#c5b9ac] focus:border-[#b7946c] focus:ring-2 focus:ring-[#c9a982]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-[15px] font-medium"
                  >
                    주소
                  </label>

                  <input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="주소를 입력해주세요"
                    className="h-[54px] w-full rounded-[10px] border border-[#e4dace] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#c5b9ac] focus:border-[#b7946c] focus:ring-2 focus:ring-[#c9a982]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="zip"
                    className="mb-2 block text-[15px] font-medium"
                  >
                    우편번호
                  </label>

                  <input
                    id="zip"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="우편번호를 입력해주세요"
                    className="h-[54px] w-full rounded-[10px] border border-[#e4dace] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#c5b9ac] focus:border-[#b7946c] focus:ring-2 focus:ring-[#c9a982]/20"
                  />
                </div>

                {/* Delivery notice */}
                <div className="mt-6 flex gap-3 rounded-[13px] border border-[#eadfce] bg-[#f4ebdf] px-4 py-4 text-[14px] leading-6 text-[#775e43]">
                  <span className="mt-0.5 text-[23px] leading-none">◷</span>

                  <p>
                    당일 오후 2시 이후의 주문은
                    <br />
                    다음날 배송을 시작합니다.
                  </p>
                </div>

                {/* Total */}
                <div className="flex items-end justify-between pt-5">
                  <span className="text-[15px] font-medium">총 금액</span>

                  <strong className="text-[30px] font-bold tracking-[-0.05em]">
                    {formatPrice(total)}
                  </strong>
                </div>

                {/* Payment */}
                <button
                  type="submit"
                  className="flex h-[64px] w-full items-center justify-center gap-3 rounded-[11px] bg-[#95632f] text-[18px] font-semibold text-white shadow-[0_8px_15px_rgba(117,73,32,.15)] transition hover:bg-[#815326] active:scale-[0.99]"
                >
                  <CreditCardIcon />
                  결제하기
                </button>
                {/* Orders page */}
                <button
                  type="button"
                  className="flex h-[64px] w-full items-center justify-center gap-3 rounded-[11px] bg-[#95632f] text-[18px] font-semibold text-white shadow-[0_8px_15px_rgba(117,73,32,.15)] transition hover:bg-[#815326] active:scale-[0.99]"
                  onClick={() => router.push("/orders")}
                >
                  <ReceiptIcon />
                  주문 내역 조회
                </button>
              </form>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
