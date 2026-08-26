"use client";

import { useState } from "react";
import Logo from './_components/Logo';
import UserIcon from './_components/UserIcon';
import OrderCard from './_components/OrderCard';
import { OrderResponse } from '@/app/_shared/apis/orderApi.type';
import mockOrders from '@/app/_shared/mocks/orders.mock';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>(mockOrders);
  const [page, setPage] = useState(1);

  const handleCancel = (id: number) => {
    const target = orders.find((order) => order.id === id);

    if (!target) return;

    const confirmed = window.confirm(
      `${target.id} 주문을 취소하시겠습니까?`
    );

    if (!confirmed) return;

    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, cancelled: true } : order
      )
    );
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ee] text-[#3b3027]">
      {/* Header */}
      <header className="h-[94px] border-b border-[#eee7df] bg-[#f8f3ec]/95">
        <div className="mx-auto flex h-full max-w-[1380px] items-center justify-between px-7">
          <Logo />
          <UserIcon />
        </div>
      </header>

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
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancel}
            />
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

          {[1, 2, 3].map((number) => (
            <button
              type="button"
              key={number}
              onClick={() => changePage(number)}
              className={`flex h-9 w-9 items-center justify-center rounded-[7px] text-[14px] transition ${
                page === number
                  ? "bg-[#eadfce] font-semibold text-[#57483a]"
                  : "border border-[#eee7df] bg-white/70 text-[#6d6157] hover:bg-[#f5eee5]"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            type="button"
            disabled={page === 3}
            onClick={() => changePage(Math.min(3, page + 1))}
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