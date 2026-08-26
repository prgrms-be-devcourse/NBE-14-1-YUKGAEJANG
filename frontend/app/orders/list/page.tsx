"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Logo from "../_components/Logo";
import UserIcon from "../_components/UserIcon";
import OrderCard from "../_components/OrderCard";
import {
  OrderResponse,
  OrderListResponse,
} from "../../_shared/apis/orderApi.type";

export default function OrdersPage() {
  const searchParams = useSearchParams();

  // URL에서 이메일 가져오기
  const email = searchParams.get("email");

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:8080/api/v1/orders?email=${encodeURIComponent(
            email
          )}&page=${page - 1}`
        );

        if (!response.ok) {
          throw new Error("주문 내역을 불러오지 못했습니다.");
        }

        const data: OrderListResponse = await response.json();

        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error(error);
        setError("주문 내역을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [email, page]);

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

  // 현재 페이지를 기준으로 최대 5개의 페이지 버튼 계산
  const startPage = Math.floor((page - 1) / 5) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

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
            주문 내역
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
        {totalPages > 0 && (
          <nav className="mt-5 flex items-center justify-center gap-2">
            {/* 이전 페이지 */}
            <button
              type="button"
              disabled={page === 1}
              onClick={() => changePage(Math.max(1, page - 1))}
              className="flex h-9 w-9 items-center justify-center text-[25px] text-[#74675b] disabled:cursor-default disabled:opacity-40"
              aria-label="이전 페이지"
            >
              ‹
            </button>

            {/* 페이지 번호 */}
            {pageNumbers.map((number) => (
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

            {/* 다음 페이지 */}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                changePage(Math.min(totalPages, page + 1))
              }
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