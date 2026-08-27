'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/_shared/apis/apiConfig';
import Logo from './_components/Logo';
import UserIcon from './_components/UserIcon';
import OrderCard from './_components/OrderCard';
import { OrderResponse } from '@/app/_shared/apis/orderApi.type';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchOrders() {
      const response = await fetch(
        `${API_BASE_URL}/orders?page=${page - 1}`,
      );

      const responseData = await response.json();

      setOrders(responseData.orders);
      setTotalPages(responseData.totalPages);
    }

    fetchOrders();
  }, [page]);

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

        {/* Orders */}
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={handleCancel} />
          ))}
        </div>

        {/* Pagination */}
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
            disabled={page === totalPages}
            onClick={() => changePage(Math.min(totalPages, page + 1))}
            className="flex h-9 w-9 items-center justify-center text-[25px] text-[#74675b] disabled:cursor-default disabled:opacity-40"
            aria-label="다음 페이지"
          >
            ›
          </button>
        </nav>
      </div>
    </main>
  );
}
