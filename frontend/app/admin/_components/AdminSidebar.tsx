"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BagIcon,
  CartIcon,
  ChartIcon,
  ExternalIcon,
} from "@/app/_shared/components/icons/icons";

const NAV_ITEMS = [
  {
    label: "통계 대시보드",
    href: "/admin/statistics",
    icon: <ChartIcon />,
  },
  {
    label: "주문 관리",
    href: "/admin/orders",
    icon: <CartIcon />,
  },
  {
    label: "상품 관리",
    href: "/admin/products",
    icon: <BagIcon />,
  },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[238px] shrink-0 border-r border-[#ebe4dc] bg-[#faf7f3] px-3 py-7 lg:flex lg:flex-col">
      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex h-[49px] items-center gap-[15px]
                rounded-[10px] px-6
                text-sm transition-colors

                ${
                  isActive
                    ? "bg-[#eee5dc] font-bold text-[#3d3026]"
                    : "text-[#695d53] hover:bg-[#f2ece6]"
                }
              `}
            >
              <span className="grid h-[19px] w-[19px] shrink-0 place-items-center">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto">
        <Link
          href="/"
          className="
            flex h-11 w-full items-center
            justify-between rounded-lg
            border border-[#e5dcd2]
            bg-[#fffdfa] px-[15px]
            text-xs text-[#5c4d41]
            transition-colors
            hover:bg-[#f8f2ec]
          "
        >
          <span>사이트 바로가기</span>

          <ExternalIcon className="h-3.5 w-3.5" />
        </Link>

        <div className="mt-5 px-2 text-[11px] leading-[1.8] text-[#9a8c80]">
          <p>© 2026 Grids & Circle</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
}
