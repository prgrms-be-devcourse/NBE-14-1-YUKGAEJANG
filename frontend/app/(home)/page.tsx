'use client';

import { API_BASE_URL } from '@/app/_shared/apis/apiConfig';
import { useEffect, useMemo, useState } from 'react';
import {
  CartItem,
  ProductListResponse,
  ProductResponse,
} from '../_shared/apis/productApi.type';
import formatPrice from '../_shared/utils/numberUtils/formatPrice';
import ProductCard from './_components/ProductCard';
import PageHeader from './_components/PageHeader';
import { useRouter } from 'next/navigation';
import {
  CreditCardIcon,
  ReceiptIcon,
  SearchIcon,
} from '../_shared/components/icons/icons';

export default function Page() {
  const router = useRouter();

  const [productData, setProductData] =
    useState<ProductListResponse | null>(null);

  const [page, setPage] = useState(1);

  // 검색어
  const [search, setSearch] = useState('');

  // 실제 API에 적용된 검색어
  const [searchKeyword, setSearchKeyword] = useState('');

  /*
   * 상품 목록 조회
   *
   * Spring Page는 0부터 시작하기 때문에
   * 프론트의 page(1부터 시작)에서 1을 빼서 전달한다.
   *
   * 검색어가 있으면 productName을 함께 전달한다.
   */
  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams();

        params.set('page', String(page - 1));

        if (searchKeyword.trim()) {
          params.set(
            'productName',
            searchKeyword.trim(),
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/products?${params.toString()}`,
          {
            method: 'GET',
          },
        );

        if (!response.ok) {
          throw new Error(
            '상품 목록을 불러오지 못했습니다.',
          );
        }

        const responseData: ProductListResponse =
          await response.json();

        setProductData(responseData);
      } catch (error) {
        console.error(
          '상품 목록 조회 실패:',
          error,
        );
      }
    }

    fetchProducts();
  }, [page, searchKeyword]);

  /*
   * 상품 검색
   *
   * 검색하면 첫 번째 페이지부터 조회한다.
   */
  const handleSearch = () => {
    setPage(1);
    setSearchKeyword(search);
  };

  /*
   * 검색창에서 Enter 입력 시 검색
   */
  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const [cart, setCart] = useState<CartItem[]>([]);

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          item.product.price * item.quantity,
        0,
      ),
    [cart],
  );

  /*
   * 장바구니에 상품 추가
   */
  const addToCart = (
    product: ProductResponse,
  ) => {
    setCart((current) => {
      const exists = current.find(
        (item) =>
          item.product.id === product.id,
      );

      if (exists) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                product: item.product,
                quantity:
                  item.quantity + 1,
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

  /*
   * 장바구니 수량 변경
   */
  const updateQuantity = (
    id: number,
    amount: number,
  ) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === id
            ? {
                ...item,
                quantity:
                  item.quantity + amount,
              }
            : item,
        )
        .filter(
          (item) => item.quantity > 0,
        ),
    );
  };

  /*
   * 주문
   */
  const handlePayment = async () => {
    if (
      !email ||
      !address ||
      !zipCode
    ) {
      alert(
        '이메일, 주소, 우편번호를 모두 입력해주세요.',
      );
      return;
    }

    if (cart.length === 0) {
      alert('상품을 선택해주세요.');
      return;
    }

    const orderEmail = email.trim();

    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const requestBody = {
      email: orderEmail,
      zipCode,
      address,
      items,
    };

    const response = await fetch(
      `${API_BASE_URL}/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      const errorData =
        await response.json();

      console.error(
        '주문 실패:',
        errorData,
      );

      alert(
        errorData.message ??
          '주문에 실패했습니다.',
      );

      return;
    }

    alert('주문이 완료되었습니다.');

    setCart([]);
    setEmail('');
    setAddress('');
    setZipCode('');
  };

  /*
   * 페이지 변경
   */
  const totalPages = Math.max(
    productData?.totalPages ?? 1,
    1,
  );

  const handlePageChange = (
    nextPage: number,
  ) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 py-8 text-[#35291e] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">

        {/* Header */}
        <PageHeader />

        {/* Main container */}
        <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-[0_15px_35px_rgba(91,64,38,.13)] backdrop-blur">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_430px]">

            {/* Products */}
            <div className="p-8 sm:p-10 lg:p-11">

              {/* 상품 목록 제목 */}
              <h2 className="mb-6 text-[24px] font-bold tracking-[-0.04em]">
                상품 목록
              </h2>

              {/* 검색창 */}
              <div className="mb-8 flex w-full max-w-[500px] gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    onKeyDown={
                      handleSearchKeyDown
                    }
                    placeholder="상품명을 검색해주세요"
                    className="
                      h-11 w-full rounded-lg
                      border border-[#e4dace]
                      bg-white
                      px-4 pr-10
                      text-sm text-[#44362c]
                      outline-none
                      placeholder:text-[#b2a59b]
                      focus:border-[#b7946c]
                      focus:ring-2
                      focus:ring-[#c9a982]/20
                    "
                  />

                  <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#8d7d70]" />
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="
                    h-11 rounded-lg
                    bg-[#95632f]
                    px-5
                    text-sm font-semibold
                    text-white
                    transition
                    hover:bg-[#815326]
                  "
                >
                  검색
                </button>
              </div>

              {/* 검색 결과 안내 */}
              {searchKeyword && (
                <p className="mb-5 text-sm text-[#8d7d70]">
                  '{searchKeyword}' 검색 결과
                </p>
              )}

              {/* 상품 목록 */}
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {productData?.products.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToCart}
                    />
                  ),
                )}
              </div>

              {/* 상품이 없는 경우 */}
              {productData &&
                productData.products.length ===
                  0 && (
                  <div className="py-16 text-center text-sm text-[#9c8e7f]">
                    {searchKeyword
                      ? '검색 결과가 없습니다.'
                      : '등록된 상품이 없습니다.'}
                  </div>
                )}

              {/* Pagination */}
              {productData &&
                totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">

                    {/* 이전 페이지 */}
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() =>
                        handlePageChange(
                          page - 1,
                        )
                      }
                      className="
                        h-9 rounded-md
                        bg-[#eee6dc]
                        px-3
                        text-sm
                        text-[#735c43]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      이전
                    </button>

                    {/* 페이지 번호 */}
                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) =>
                        index + 1,
                    ).map(
                      (pageNumber) => (
                        <button
                          key={
                            pageNumber
                          }
                          type="button"
                          onClick={() =>
                            handlePageChange(
                              pageNumber,
                            )
                          }
                          className={`
                            h-9 w-9 rounded-md
                            text-sm
                            ${
                              page ===
                              pageNumber
                                ? 'bg-[#95632f] text-white'
                                : 'bg-[#eee6dc] text-[#735c43]'
                            }
                          `}
                        >
                          {
                            pageNumber
                          }
                        </button>
                      ),
                    )}

                    {/* 다음 페이지 */}
                    <button
                      type="button"
                      disabled={
                        page ===
                        totalPages
                      }
                      onClick={() =>
                        handlePageChange(
                          page + 1,
                        )
                      }
                      className="
                        h-9 rounded-md
                        bg-[#eee6dc]
                        px-3
                        text-sm
                        text-[#735c43]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      다음
                    </button>
                  </div>
                )}
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
                      key={
                        item.product.id
                      }
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="min-w-0 truncate text-[16px] font-medium">
                        {
                          item.product
                            .name
                        }
                      </span>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product
                                .id,
                              -1,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9e0d4] text-[#735c43] transition hover:bg-[#ded1c0]"
                          aria-label="수량 감소"
                        >
                          −
                        </button>

                        <span className="min-w-[28px] text-center text-[13px] font-semibold">
                          {
                            item.quantity
                          }
                          개
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product
                                .id,
                              1,
                            )
                          }
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
                    onChange={(e) =>
                      setEmail(
                        e.target.value,
                      )
                    }
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
                    onChange={(e) =>
                      setAddress(
                        e.target.value,
                      )
                    }
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
                    onChange={(e) =>
                      setZipCode(
                        e.target.value,
                      )
                    }
                    placeholder="우편번호를 입력해주세요"
                    className="h-[54px] w-full rounded-[10px] border border-[#e4dace] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#c5b9ac] focus:border-[#b7946c] focus:ring-2 focus:ring-[#c9a982]/20"
                  />
                </div>

                {/* Delivery notice */}
                <div className="mt-6 flex gap-3 rounded-[13px] border border-[#eadfce] bg-[#f4ebdf] px-4 py-4 text-[14px] leading-6 text-[#775e43]">
                  <span className="mt-0.5 text-[23px] leading-none">
                    ◷
                  </span>

                  <p>
                    당일 오후 2시 이후의 주문은
                    <br />
                    다음날 배송을 시작합니다.
                  </p>
                </div>

                {/* Total */}
                <div className="flex items-end justify-between pt-5">
                  <span className="text-[15px] font-medium">
                    총 금액
                  </span>

                  <strong className="text-[30px] font-bold tracking-[-0.05em]">
                    {formatPrice(
                      total,
                    )}
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
                  onClick={() =>
                    router.push(
                      '/orders',
                    )
                  }
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