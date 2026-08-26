import { SearchIcon } from '@/app/_shared/components/icons/icons';

export default function EmptyState() {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-[#9c8f84]">
      <div className="mb-1.5 grid h-[42px] w-[42px] place-items-center rounded-full bg-[#f4eee8]">
        <SearchIcon className="h-4 w-4" />
      </div>

      <strong className="text-sm text-[#66574b]">
        상품이 없습니다.
      </strong>

      <span className="text-xs">
        검색어나 상품 등록 여부를 확인해주세요.
      </span>
    </div>
  );
}
