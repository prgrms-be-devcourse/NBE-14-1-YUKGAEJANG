"use client";

import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  origin: string;
  price: number;
};

type CartItem = Product & {
  quantity: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Columbia Nariño",
    origin: "Columbia Nariño",
    price: 5000,
  },
  {
    id: 2,
    name: "Brazil Serra Do Caparaó",
    origin: "Brazil Serra Do Caparaó",
    price: 5000,
  },
  {
    id: 3,
    name: "Columbia Nariño",
    origin: "Columbia Nariño",
    price: 5000,
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ko-KR").format(price) + "원";

function CoffeeVisual({ product }: { product: Product }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#eee2d0]">
      {/* background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,#fff9ef_0%,#eee1ce_72%)]" />

      {/* coffee bag */}
      <div className="absolute bottom-[11%] left-[19%] h-[53%] w-[32%] rotate-[1deg] rounded-[4px] bg-[#f7f0e5] shadow-[0_5px_10px_rgba(75,48,25,.12)]">
        <div className="absolute left-[12%] right-[12%] top-[12%] h-[24%] rounded-sm bg-[#40553c]">
          <div className="pt-2 text-center text-[5px] font-medium tracking-[1px] text-white/80">
            SINGLE
          </div>
          <div className="text-center text-[5px] tracking-[1px] text-white/80">
            ORIGIN
          </div>
        </div>

        <div className="absolute left-0 right-0 top-[45%] text-center font-serif text-[10px] leading-3 tracking-[2px] text-[#776550]">
          COL
          <br />
          OMBI
          <br />
          A
        </div>

        <div className="absolute bottom-[9%] left-0 right-0 text-center text-[5px] tracking-[1px] text-[#a49178]">
          {product.origin.split(" ")[0].toUpperCase()}
        </div>
      </div>

      {/* ceramic vase */}
      <div className="absolute bottom-[7%] right-[16%] h-[70%] w-[20%]">
        <div className="absolute left-[30%] top-0 h-[25%] w-[40%] rounded-t-[50%] bg-[#e9dfce]" />
        <div className="absolute bottom-0 left-0 right-0 h-[78%] rounded-[42%_42%_18%_18%] bg-[#e8dece] shadow-[3px_5px_8px_rgba(80,50,25,.12)]" />
        <div className="absolute bottom-[8%] left-[15%] right-[15%] h-[58%] opacity-30">
          <div className="absolute left-[18%] h-full w-[3px] bg-[#b9aa91]" />
          <div className="absolute left-[38%] h-full w-[3px] bg-[#b9aa91]" />
          <div className="absolute left-[58%] h-full w-[3px] bg-[#b9aa91]" />
          <div className="absolute left-[78%] h-full w-[3px] bg-[#b9aa91]" />
        </div>
      </div>

      {/* coffee beans */}
      <div className="absolute bottom-[7%] left-[39%] flex -rotate-[7deg] gap-[-2px]">
        {[...Array(12)].map((_, index) => (
          <span
            key={index}
            className="relative -ml-1 h-[8px] w-[13px] rounded-[50%] bg-[#4c2e18] shadow-sm"
            style={{
              transform: `translateY(${
                Math.sin(index * 1.7) * 5
              }px) rotate(${index * 8 - 20}deg)`,
            }}
          />
        ))}
      </div>

      {/* subtle label */}
      <div className="absolute bottom-3 right-3 rounded-full bg-white/40 px-2 py-1 text-[7px] text-[#765f48] backdrop-blur">
        SINGLE ORIGIN
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  return (
    <div className="group rounded-[22px] bg-white p-3.5 shadow-[0_8px_25px_rgba(87,57,31,.06)]">
      <div className="aspect-[1.05/1]">
        <CoffeeVisual product={product} />
      </div>

      <div className="px-2 pt-5">
        <p className="mb-2 text-[13px] font-medium text-[#b39a7c]">
          커피콩
        </p>

        <h3 className="text-[20px] font-medium tracking-[-0.04em] text-[#302820]">
          {product.name}
        </h3>

        <p className="mt-4 text-[23px] font-bold tracking-[-0.04em] text-[#3b2b1c]">
          {formatPrice(product.price)}
        </p>

        <button
          type="button"
          onClick={() => onAdd(product)}
          className="mt-5 flex h-[46px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#c7a983] text-[15px] font-medium text-white transition hover:bg-[#b89469] active:scale-[0.98]"
        >
          <span className="text-[20px] font-light">＋</span>
          추가하기
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([
    {
      ...products[0],
      quantity: 2,
    },
    {
      ...products[1],
      quantity: 2,
    },
    {
      ...products[2],
      quantity: 2,
    },
  ]);

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const addToCart = (product: Product) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);

      if (exists) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handlePayment = () => {
    if (!email || !address || !zipCode) {
      alert("이메일, 주소, 우편번호를 모두 입력해주세요.");
      return;
    }

    if (cart.length === 0) {
      alert("상품을 선택해주세요.");
      return;
    }

    alert(`총 ${formatPrice(total)} 결제를 진행합니다.`);
  };

  return (
    <main className="min-h-screen bg-[#f5f0e8] px-4 py-8 text-[#35291e] sm:px-8 lg:px-10">
      {/* page */}
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <header className="mb-7 flex items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="relative h-9 w-6 -rotate-[35deg] overflow-hidden rounded-[50%] border-[2px] border-[#5a4634] bg-[#765d47]">
              <div className="absolute -left-1 top-[17px] h-[2px] w-8 rotate-[-42deg] bg-[#e5d6c2]" />
            </div>

            <h1 className="font-serif text-[42px] font-semibold tracking-[-0.055em] text-[#39291d] sm:text-[50px]">
              Grids &amp; Circle
            </h1>
          </div>
        </header>

        {/* Main container */}
        <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/70 shadow-[0_15px_35px_rgba(91,64,38,.13)] backdrop-blur">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_430px]">
            {/* Products */}
            <div className="p-8 sm:p-10 lg:p-11">
              <h2 className="mb-9 text-[24px] font-bold tracking-[-0.04em]">
                상품 목록
              </h2>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
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
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="min-w-0 truncate text-[16px] font-medium">
                        {item.name}
                      </span>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
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
                          onClick={() => updateQuantity(item.id, 1)}
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
                  <span className="text-[20px]">♙</span>
                  결제하기
                </button>
              </form>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}