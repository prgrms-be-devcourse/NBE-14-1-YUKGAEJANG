"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
};

type OrderResponse = {
  id: number;
  email: string;
  zipCode: string;
  address: string;
  orderDate: string;
  orderItems: OrderItem[];
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ko-KR").format(price) + "원";

function CoffeeThumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[8px] bg-[#eee3d3]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,#fff9ef_0%,#eee1ce_75%)]" />

      {/* coffee bag */}
      <div className="absolute bottom-[11%] left-[20%] h-[55%] w-[31%] rounded-[2px] bg-[#f5ede0] shadow-sm">
        <div className="absolute left-[13%] right-[13%] top-[13%] h-[25%] bg-[#40543d]">
          <div className="pt-1 text-center text-[4px] tracking-[1px] text-white/80">
            SINGLE
          </div>
          <div className="text-center text-[4px] tracking-[1px] text-white/80">
            ORIGIN
          </div>
        </div>

        <div className="absolute left-0 right-0 top-[47%] text-center font-serif text-[7px] leading-[8px] tracking-[1px] text-[#786651]">
          COL
          <br />
          OMBI
          <br />
          A
        </div>
      </div>

      {/* vase */}
      <div className="absolute bottom-[8%] right-[18%] h-[70%] w-[20%]">
        <div className="absolute left-[30%] top-0 h-[23%] w-[40%] rounded-t-full bg-[#e8dece]" />
        <div className="absolute bottom-0 left-0 right-0 h-[80%] rounded-[45%_45%_15%_15%] bg-[#e6dccb] shadow-sm" />

        <div className="absolute bottom-[8%] left-[20%] right-[20%] h-[60%] opacity-30">
          <div className="absolute left-[20%] h-full w-[2px] bg-[#b6a58d]" />
          <div className="absolute left-[45%] h-full w-[2px] bg-[#b6a58d]" />
          <div className="absolute left-[70%] h-full w-[2px] bg-[#b6a58d]" />
        </div>
      </div>

      {/* beans */}
      <div className="absolute bottom-[8%] left-[40%] flex -rotate-[8deg]">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            className="-ml-1 h-[6px] w-[10px] rounded-full bg-[#52321c]"
            style={{
              transform: `translateY(${Math.sin(i * 1.8) * 3}px) rotate(${
                i * 10
              }deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-8 w-5 -rotate-[35deg] overflow-hidden rounded-[50%] border-2 border-[#5a4634] bg-[#765d47]">
        <div className="absolute -left-1 top-[15px] h-[2px] w-7 rotate-[-42deg] bg-[#eadccc]" />
      </div>

      <span className="font-serif text-[30px] tracking-[-0.055em] text-[#3d2d20]">
        Grids &amp; Circle
      </span>
    </div>
  );
}

function UserIcon() {
  return (
    <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#eadfd2] bg-white/50">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="text-[#56483b]"
      >
        <circle cx="12" cy="7.5" r="3.5" />
        <path d="M5 20c.8-4 3.2-6 7-6s6.2 2 7 6" />
      </svg>
    </div>
  );
}

function OrderCard({
  order,
  onDelete,
}: {
  order: Order;
  onDelete: (id: number) => void;
}) {
  const date = new Date(order.orderDate);

  const formattedDate = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formattedTime = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-[14px] bg-white/80 px-6 py-5 shadow-[0_4px_18px_rgba(80,55,30,.055)]">
      <div className="grid items-center gap-5 xl:grid-cols-[160px_minmax(330px,1fr)_minmax(390px,1fr)_130px]">

        {/* 주문 정보 */}
        <div className="self-start">
          <div className="flex items-center gap-3 text-[15px]">
            <span className="text-[#65574b]">주문번호</span>

            <strong className="font-semibold text-[#3b3027]">
              #{order.id}
            </strong>
          </div>

          <div className="mt-2 text-[15px] text-[#665a50]">
            {formattedDate}
            <span className="ml-3">{formattedTime}</span>
          </div>
        </div>

        {/* 상품 */}
        <div className="flex min-w-0 items-center gap-8">
          <div className="h-[108px] w-[138px] shrink-0">
            <CoffeeThumbnail />
          </div>

          <div className="min-w-0 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.productId}
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

        {/* 배송 정보 */}
        <div className="border-l border-[#eee7df] pl-8">
          <div className="grid grid-cols-[72px_1fr] gap-y-5 text-[14px]">
            <span className="text-[#81756a]">이메일</span>
            <span className="truncate text-[#5d5147]">
              {order.email}
            </span>

            <span className="text-[#81756a]">배송지</span>
            <span className="truncate text-[#5d5147]">
              {order.address}
            </span>

            <span className="text-[#81756a]">우편번호</span>
            <span className="text-[#5d5147]">
              {order.zipCode}
            </span>
          </div>
        </div>

        {/* 주문 삭제 */}
        <div className="flex flex-col items-end">
          <button
            type="button"
            onClick={() => onDelete(order.id)}
            className="rounded-[8px] border border-[#d9877c] px-5 py-2 text-[14px] font-medium text-[#bd5c50] transition hover:bg-[#fff4f2] active:scale-[0.98]"
          >
            주문 삭제
          </button>
        </div>

      </div>
    </article>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:8080/api/v1/orders?page=${page - 1}`
        );

        if (!response.ok) {
          throw new Error("주문 내역 조회 실패");
        }

        const data: Order[] = await response.json();

        setOrders(data);
      } catch (error) {
        console.error(error);
        setError("주문 내역을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

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
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-[14px] bg-white/80 text-[15px] text-[#9a8f84]">
              주문 내역을 불러오는 중입니다...
            </div>
          ) : error ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-[14px] bg-white/80 text-[15px] text-[#9a8f84]">
              {error}
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
              />
            ))
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-[14px] bg-white/80 text-[15px] text-[#9a8f84]">
              주문 내역이 없습니다.
            </div>
          )}
        </div>

        {/* Pagination */}
        <nav className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="flex h-9 w-9 items-center justify-center text-[25px] text-[#74675b] disabled:cursor-default disabled:opacity-40"
            aria-label="이전 페이지"
          >
            ‹
          </button>

          {[1, 2, 3].map((number) => (
            <button
              type="button"
              key={number}
              onClick={() => setPage(number)}
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
            onClick={() => setPage((prev) => prev + 1)}
            className="flex h-9 w-9 items-center justify-center text-[25px] text-[#74675b]"
            aria-label="다음 페이지"
          >
            ›
          </button>
        </nav>

      </div>
    </main>
  );
}