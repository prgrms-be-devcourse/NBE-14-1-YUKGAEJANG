"use client";

import { useMemo, useState } from "react";

type OrderItem = {
  name: string;
  quantity: number;
};

type Order = {
  id: string;
  date: string;
  time: string;
  items: OrderItem[];
  email: string;
  address: string;
  zipCode: string;
  total: number;
  cancelled: boolean;
};

const initialOrders: Order[] = [
  {
    id: "#2024-05-18-001",
    date: "2024.05.18",
    time: "13:42",
    items: [
      { name: "Columbia Nariño", quantity: 2 },
      { name: "Brazil Serra Do Caparaó", quantity: 2 },
      { name: "Columbia Nariño", quantity: 2 },
    ],
    email: "test@email.com",
    address: "서울특별시 강남구 테헤란로 123",
    zipCode: "06142",
    total: 15000,
    cancelled: false,
  },
  {
    id: "#2024-05-17-002",
    date: "2024.05.17",
    time: "10:15",
    items: [
      { name: "Columbia Nariño", quantity: 1 },
      { name: "Brazil Serra Do Caparaó", quantity: 1 },
    ],
    email: "hello@example.com",
    address: "서울특별시 마포구 양화로 45",
    zipCode: "04031",
    total: 10000,
    cancelled: false,
  },
  {
    id: "#2024-05-16-003",
    date: "2024.05.16",
    time: "17:09",
    items: [{ name: "Columbia Nariño", quantity: 2 }],
    email: "coffee@naver.com",
    address: "경기도 성남시 분당구 판교로 255",
    zipCode: "13487",
    total: 10000,
    cancelled: false,
  },
];

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
  onCancel,
}: {
  order: Order;
  onCancel: (id: string) => void;
}) {
  return (
    <article className="rounded-[14px] bg-white/80 px-6 py-5 shadow-[0_4px_18px_rgba(80,55,30,.055)]">
      <div className="grid items-center gap-5 xl:grid-cols-[160px_minmax(330px,1fr)_minmax(390px,1fr)_130px]">
        {/* Order information */}
        <div className="self-start">
          <div className="flex items-center gap-3 text-[15px]">
            <span className="text-[#65574b]">주문번호</span>

            <strong className="font-semibold text-[#3b3027]">
              {order.id}
            </strong>
          </div>

          <div className="mt-2 text-[15px] text-[#665a50]">
            {order.date}
            <span className="ml-3">{order.time}</span>
          </div>
        </div>

        {/* Products */}
        <div className="flex min-w-0 items-center gap-8">
          <div className="h-[108px] w-[138px] shrink-0">
            <CoffeeThumbnail />
          </div>

          <div className="min-w-0 space-y-3">
            {order.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center gap-4"
              >
                <span className="whitespace-nowrap text-[16px] text-[#45382d]">
                  {item.name}
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
            {formatPrice(order.total)}
          </strong>

          {order.cancelled ? (
            <span className="rounded-[8px] border border-[#ddd2c6] px-5 py-2 text-[14px] text-[#a29487]">
              주문 취소됨
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onCancel(order.id)}
              className="rounded-[8px] border border-[#d9877c] px-5 py-2 text-[14px] font-medium text-[#bd5c50] transition hover:bg-[#fff4f2] active:scale-[0.98]"
            >
              주문 취소
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"all" | "cancelled">("all");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    if (activeTab === "cancelled") {
      return orders.filter((order) => order.cancelled);
    }

    return orders;
  }, [activeTab, orders]);

  const handleCancel = (id: string) => {
    const target = orders.find((order) => order.id === id);

    if (!target || target.cancelled) return;

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
            주문 내역
          </h1>

          <p className="mt-2 text-[15px] text-[#7b7066]">
            주문하신 내역을 확인하실 수 있습니다.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex h-[70px] items-center rounded-[13px] border border-[#eee7df] bg-white/80 px-4 shadow-[0_3px_15px_rgba(80,55,30,.04)]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
            className={`flex h-[42px] min-w-[88px] items-center justify-center rounded-[11px] text-[15px] font-medium transition ${
              activeTab === "all"
                ? "bg-[#f5efe7] text-[#4b3d31]"
                : "text-[#6d6259] hover:bg-[#faf7f3]"
            }`}
          >
            전체
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("cancelled");
              setPage(1);
            }}
            className={`flex h-[42px] min-w-[100px] items-center justify-center rounded-[11px] text-[15px] font-medium transition ${
              activeTab === "cancelled"
                ? "bg-[#f5efe7] text-[#4b3d31]"
                : "text-[#6d6259] hover:bg-[#faf7f3]"
            }`}
          >
            취소된 주문
          </button>
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancel}
              />
            ))
          ) : (
            <div className="flex min-h-[300px] items-center justify-center rounded-[14px] bg-white/80 text-[15px] text-[#9a8f84]">
              취소된 주문 내역이 없습니다.
            </div>
          )}
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