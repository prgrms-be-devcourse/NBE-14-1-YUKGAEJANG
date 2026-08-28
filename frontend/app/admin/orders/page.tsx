'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/_shared/apis/apiConfig';
import OrderCard from './_components/OrderCard';
import {
  OrderListResponse,
  OrderResponse,
} from '@/app/_shared/apis/orderApi.type';

type SearchType = 'product' | 'date';
type ActiveSearchType = 'all' | SearchType;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // 검색창에서 선택하고 입력한 값
  const [searchType, setSearchType] =
      useState<SearchType>('product');

  const [searchValue, setSearchValue] =
      useState('');

// 실제 API 요청에 적용된 검색 조건
  const [activeSearchType, setActiveSearchType] =
      useState<ActiveSearchType>('all');

  const [activeSearchValue, setActiveSearchValue] =
      useState('');

  const [errorMessage, setErrorMessage] =
      useState('');
  const [isLoading, setIsLoading] =
      useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const params = new URLSearchParams({
        page: String(page - 1),
      });

      let path = '/orders';

      // 상품명 검색 API
      if (activeSearchType === 'product') {
        path = '/orders/search/product';

        params.set(
            'productName',
            activeSearchValue,
        );
      }

      // 주문일 검색 API
      if (activeSearchType === 'date') {
        path = '/orders/search/date';

        params.set(
            'orderDate',
            activeSearchValue,
        );
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(
            `${API_BASE_URL}${path}?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
              '주문 내역 조회에 실패했습니다.',
          );
        }

        const responseData: OrderListResponse =
            await response.json();

        setOrders(responseData.orders);
        setTotalPages(responseData.totalPages);
      } catch (error) {
        setOrders([]);
        setTotalPages(0);

        setErrorMessage(
            error instanceof Error
                ? error.message
                : '주문 조회 중 오류가 발생했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchOrders();
  }, [
    page,
    activeSearchType,
    activeSearchValue,
  ]);

  const handleSearch = () => {
    const value = searchValue.trim();

    if (!value) {
      setErrorMessage(
          searchType === 'product'
              ? '상품명을 입력해주세요.'
              : '주문일을 선택해주세요.',
      );

      return;
    }

    // 검색하면 첫 페이지부터 조회
    setPage(1);
    setActiveSearchType(searchType);
    setActiveSearchValue(value);
    setErrorMessage('');
  };

  const handleResetSearch = () => {
    setSearchValue('');
    setPage(1);
    setActiveSearchType('all');
    setActiveSearchValue('');
    setErrorMessage('');
  };

  // 관리자가 주문 취소 기능
  const handleCancel = async (id: number) => {
    const target = orders.find((order) => order.id === id);

    if (!target) return;

    const confirmed = window.confirm(`${target.id} 주문을 취소하시겠습니까?`);

    if (!confirmed) return;

    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      alert('주문 취소에 실패했습니다.');
      return;
    }

    alert('주문이 취소되었습니다.');

    setOrders((current) => current.filter((order) => order.id !== id));
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ee] text-[#3b3027]">
      {/* Content */}
      <div className="mx-auto max-w-[1380px] px-7 pb-8 pt-7">
        {/* Title */}
        <div className="mb-7">
          <h1 className="text-[31px] font-bold tracking-[-0.055em] text-[#3b2e24]">
            주문 내역 (관리자용)
          </h1>

          <p className="mt-2 text-[15px] text-[#7b7066]">
            주문하신 내역을 확인하실 수 있습니다.
          </p>
        </div>

        {/* Order Search */}
        <section className="mb-7 flex flex-wrap items-end gap-3 rounded-[14px] bg-white/80 p-5">
          <label className="flex flex-col gap-2">
    <span className="text-[14px] text-[#665a50]">
      검색 조건
    </span>

            <select
                value={searchType}
                onChange={(event) => {
                  setSearchType(
                      event.target.value as SearchType,
                  );

                  setSearchValue('');
                }}
                className="h-11 rounded-[8px] border border-[#ddd3c9] bg-white px-4"
            >
              <option value="product">
                상품명
              </option>

              <option value="date">
                주문일
              </option>
            </select>
          </label>

          <label className="flex flex-1 flex-col gap-2">
    <span className="text-[14px] text-[#665a50]">
      {searchType === 'product'
          ? '상품명'
          : '주문일'}
    </span>

            <input
                type={
                  searchType === 'product'
                      ? 'text'
                      : 'date'
                }
                value={searchValue}
                onChange={(event) =>
                    setSearchValue(event.target.value)
                }
                placeholder={
                  searchType === 'product'
                      ? '상품명 일부를 입력해주세요.'
                      : undefined
                }
                className="h-11 rounded-[8px] border border-[#ddd3c9] bg-white px-4"
            />
          </label>

          <button
              type="button"
              onClick={handleSearch}
              className="h-11 rounded-[8px] bg-[#5b4636] px-7 font-semibold text-white"
          >
            검색
          </button>

          <button
              type="button"
              onClick={handleResetSearch}
              className="h-11 rounded-[8px] border border-[#cfc3b7] bg-white px-6"
          >
            전체 보기
          </button>
        </section>

        {!isLoading && errorMessage && (
            <p className="mb-5 text-[14px] text-red-600">
              {errorMessage}
            </p>
        )}

        {/* Orders */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-[14px] bg-white/80 px-6 py-14 text-center text-sm text-[#7b7066]">
              주문 내역을 불러오는 중입니다.
            </div>
          ) : !errorMessage && orders.length === 0 ? (
            <div className="rounded-[14px] bg-white/80 px-6 py-14 text-center text-sm text-[#7b7066]">
              조회된 주문 내역이 없습니다.
            </div>
          ) : !errorMessage ? orders.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={handleCancel} />
          )) : null}
        </div>

        {/* Pagination */}
        {!isLoading && !errorMessage && totalPages > 0 && (
        <nav className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => changePage(Math.max(1, page - 1))}
            className="flex h-9 w-9 items-center justify-center text-[25px] text-[#74675b] disabled:cursor-default disabled:opacity-40"
            aria-label="이전 페이지"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (number) => (
              <button
                type="button"
                key={number}
                onClick={() => changePage(number)}
                className={`flex h-9 w-9 items-center justify-center rounded-[7px] text-[14px] transition ${
                  page === number
                    ? 'bg-[#eadfce] font-semibold text-[#57483a]'
                    : 'border border-[#eee7df] bg-white/70 text-[#6d6157] hover:bg-[#f5eee5]'
                }`}
              >
                {number}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => changePage(Math.min(totalPages, page + 1))}
            className="flex h-9 w-9 items-center justify-center text-[25px] text-[#74675b] disabled:cursor-default disabled:opacity-40"
            aria-label="다음 페이지"
          >
            ›
          </button>
        </nav>
        )}
      </div>
    </main>
  );
}
