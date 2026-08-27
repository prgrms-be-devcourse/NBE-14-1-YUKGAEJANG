"use client";

import { API_BASE_URL } from '@/app/_shared/apis/apiConfig';
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import Logo from "../_components/Logo";
import UserIcon from "../_components/UserIcon";
import OrderCard from "../_components/OrderCard";
import {
  OrderResponse,
  OrderListResponse,
} from "../../_shared/apis/orderApi.type";
import Link from "next/link";

function OrdersPageContent() {
  const searchParams = useSearchParams();

  // URL에서 이메일 가져오기
  const email = searchParams.get("email");

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 주문 목록 조회
  const requestOrders = useCallback(async () => {
    if (!email) return null;

    const response = await fetch(
      `${API_BASE_URL}/orders?email=${encodeURIComponent(email)}&page=${page - 1}`,
    );

    // 주문이 없는 경우
    if (response.status === 404) {
      return {
        orders: [],
        totalPages: 0,
      };
    }

    if (!response.ok) {
      throw new Error("주문 내역을 불러오지 못했습니다.");
    }

    const data: OrderListResponse = await response.json();
    return data;
  }, [email, page]);

  // 페이지 또는 이메일이 변경되면 주문 목록 조회
  useEffect(() => {
    let isActive = true;

    void Promise.resolve()
      .then(() => {
        if (!isActive) return null;
        setIsLoading(true);
        setErrorMessage('');
        return requestOrders();
      })
      .then((data) => {
        if (!isActive) return;

        if (!data) {
          setOrders([]);
          setTotalPages(0);
          setErrorMessage('주문 조회에 필요한 이메일 정보가 없습니다.');
          return;
        }

        setOrders(data.orders);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        if (!isActive) return;

        console.error(error);
        setOrders([]);
        setTotalPages(0);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : '주문 조회 중 오류가 발생했습니다.',
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [requestOrders]);

  const handleUpdateOrder = async (
    id: number,
    address: string,
    zipCode: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        zipCode,
      }),
    });

    if (!response.ok) {
      throw new Error("배송지 수정에 실패했습니다.");
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              address,
              zipCode,
            }
          : order
      )
    );

    window.alert("주문을 수정하였습니다.");
  };

  // 주문 취소
  const handleCancel = async (id: number) => {
  const target = orders.find((order) => order.id === id);

  if (!target) return;

  const confirmed = window.confirm(
    `${target.id} 주문을 취소하시겠습니까?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("주문 취소에 실패했습니다.");
    }

    // 삭제 후 주문 목록 다시 조회
    const data = await requestOrders();

    if (data) {
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    }

    // 전체 페이지 수가 0이면 주문 페이지로 이동
    if (data && data.totalPages === 0) {
      window.alert(
        "현재 주문내역이 없습니다. 주문 페이지로 이동합니다."
      );

      window.location.href = "/";
      return;
    }

    // 현재 페이지에 주문이 없으면 이전 페이지로 이동
    if (data && data.orders.length === 0 && page > 1) {
      setPage((current) => current - 1);
    }

    window.alert("주문이 취소되었습니다.");
  } catch (error) {
    console.error(error);
    window.alert("주문 취소에 실패했습니다.");
  }
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
          <Link href="/">
            <Logo />
          </Link>
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
          {isLoading ? (
            <div className="rounded-[14px] bg-white/80 px-6 py-14 text-center text-sm text-[#7b7066]">
              주문 내역을 불러오는 중입니다.
            </div>
          ) : errorMessage ? (
            <div className="rounded-[14px] bg-white/80 px-6 py-14 text-center text-sm text-red-600">
              {errorMessage}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-[14px] bg-white/80 px-6 py-14 text-center text-sm text-[#7b7066]">
              조회된 주문 내역이 없습니다.
            </div>
          ) : orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancel}
              onUpdateAddress={handleUpdateOrder}
            />
          ))}
        </div>

        {/* Pagination */}
        {!isLoading && !errorMessage && totalPages > 0 && (
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

export default function OrdersPage() {
  return (
      <Suspense
          fallback={
            <main className="flex min-h-screen items-center justify-center bg-[#f8f4ee] text-[#3b3027]">
              <p className="text-sm text-[#7b7066]">
                주문 내역을 불러오는 중입니다.
              </p>
            </main>
          }
      >
        <OrdersPageContent />
      </Suspense>
  );
}