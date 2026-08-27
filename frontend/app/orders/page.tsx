"use client";

import { API_BASE_URL } from '@/app/_shared/apis/apiConfig';
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./_components/Logo";
import UserIcon from "./_components/UserIcon";
import Link from 'next/link';

export default function OrderEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const trimmedEmail = email.trim();
  
    setError("");
  
    // 이메일 미입력
    if (!trimmedEmail) {
      setError("이메일을 입력해주세요.");
      return;
    }
  
    // 이메일 형식 확인
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }
  
    try {
      setLoading(true);

      const response = await fetch(
          `${API_BASE_URL}/orders/email?email=${encodeURIComponent(trimmedEmail)}`,
      );
  
      if (!response.ok) {
        throw new Error("이메일 확인에 실패했습니다.");
      }
  
      // 백엔드에서 true / false 반환
      const exists: boolean = await response.json();
  
      if (!exists) {
        setError("존재하지 않는 이메일입니다.");
        return;
      }
  
      // 이메일이 존재하면 주문 내역 페이지로 이동
      router.push(
        `/orders/list?email=${encodeURIComponent(trimmedEmail)}`
      );
    } catch (error) {
      console.error(error);
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mx-auto max-w-[1380px] px-7 pb-16 pt-7">
        {/* Title */}
        <div>
          <h1 className="text-[31px] font-bold tracking-[-0.055em] text-[#3b2e24]">
            주문 내역 조회
          </h1>

          <p className="mt-2 text-[15px] text-[#7b7066]">
            주문하신 이메일을 입력하면 주문 내역을 확인할 수 있습니다.
          </p>
        </div>

        {/* Email Card */}
        <section className="mx-auto mt-8 w-full max-w-[900px] rounded-[14px] border border-[#eee7df] bg-white/80 px-10 py-14 shadow-[0_4px_18px_rgba(80,55,30,.055)]">
          <div className="mx-auto max-w-[650px]">

            {/* Email Icon */}
            <div className="flex justify-center">
              <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#f3e8d9]">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#5b4635]"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M4 7L12 13L20 7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <div className="mt-8 text-center">
              <h2 className="text-[30px] font-bold tracking-[-0.055em] text-[#3b2e24]">
                이메일을 입력해주세요
              </h2>

              <p className="mt-4 text-[15px] leading-7 text-[#7b7066]">
                주문 시 입력하신 이메일을 입력해 주세요.
                <br />
                해당 이메일로 주문 내역을 조회할 수 있습니다.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-10">
              <label
                htmlFor="email"
                className="mb-3 block text-[14px] font-semibold text-[#45382d]"
              >
                이메일
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="example@email.com"
                disabled={loading}
                className={`h-[64px] w-full rounded-[9px] border bg-white px-5 text-[16px] text-[#45382d] outline-none transition placeholder:text-[#a99d93] ${
                  error
                    ? "border-[#d9877c] focus:border-[#c86d61]"
                    : "border-[#ddcdbb] focus:border-[#b99a7b]"
                }`}
              />

              {/* Error */}
              {error ? (
                <p className="mt-3 text-[13px] text-[#bd5c50]">
                  {error}
                </p>
              ) : (
                <p className="mt-3 text-[13px] text-[#81756a]">
                  주문 시 입력하신 이메일 주소를 정확하게 입력해주세요.
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-7 h-[64px] w-full rounded-[9px] bg-[#b49373] text-[17px] font-semibold text-white transition hover:bg-[#a48769] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "조회 중..." : "주문 내역 조회"}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="pb-8 text-center text-[13px] text-[#806f60]">
        © 2024 Grids &amp; Circle. All rights reserved.
      </footer>
    </main>
  );
}