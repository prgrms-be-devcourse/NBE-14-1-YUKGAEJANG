import Link from 'next/link';

import {
  ChevronDownIcon,
  UserIcon,
} from '@/app/_shared/components/icons/icons';

export function AdminHeader() {
  return (
    <header className="flex h-[82px] items-center justify-between border-b border-[#ebe4dc] bg-[#fffdfa]/90 px-6 lg:px-[46px]">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3"
        aria-label="Grids & Circle 홈으로 이동"
      >
        <div className="relative h-8 w-[25px] rotate-[-17deg] overflow-hidden rounded-[50%] bg-[#795d46]">
          <span className="absolute bottom-0 left-[11px] top-0 w-px bg-[#e9d8c5]" />
        </div>

        <span className="font-serif text-[28px] font-bold tracking-[-0.05em] text-[#34271e]">
          Grids & Circle
        </span>
      </Link>

      {/* Admin User */}
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-semibold text-[#4b3b30]"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full border border-[#e5dcd2] bg-[#fffdfb]">
          <UserIcon className="h-[18px] w-[18px]" />
        </span>

        <span className="hidden sm:block">
          관리자
        </span>

        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
    </header>
  );
}