"use client";

import { useMemo, useState } from "react";

import { ProductResponse } from '@/app/_shared/apis/productApi.type';

import mockProducts from '@/app/_shared/mocks/products.mock';
import { 
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  formatPrice,
  PlusIcon,
  SearchIcon,
  UserIcon,
} from '@/app/_shared/components/icons/icons';
import EmptyState from './add/_components/EmptyState';

const PRODUCTS = mockProducts;
const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return PRODUCTS;
    }

    return PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(keyword) ||
        String(product.id).includes(keyword)
      );
    });
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  const currentProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const allCurrentPageSelected =
    currentProducts.length > 0 &&
    currentProducts.every((product) =>
      selectedIds.includes(product.id),
    );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleToggleAll = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !currentProducts.some(
              (product) => product.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);

      currentProducts.forEach((product) => {
        next.add(product.id);
      });

      return [...next];
    });
  };

  const handleToggleProduct = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.max(1, Math.min(totalPages, nextPage)));
  };

  return (
    <main className="min-w-0 flex-1 px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-[1168px]">
        {/* Page Header */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-[28px] font-bold tracking-[-0.04em] text-[#392c23]">
              상품 목록 (관리자용)
            </h1>

            <p className="text-sm text-[#96877b]">
              전체 상품을 조회하고 등록, 수정, 삭제할 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            className="
              inline-flex h-11 items-center justify-center gap-2
              rounded-lg bg-[#ae7d44] px-5
              text-sm font-semibold text-white
              shadow-[0_4px_8px_rgba(105,74,42,0.12)]
              transition-colors
              hover:bg-[#9d6e39]
            "
          >
            <PlusIcon className="h-4 w-4" />
            상품 등록
          </button>
        </div>

        {/* Product Card */}
        <section className="overflow-hidden rounded-2xl border border-[#eee7df] bg-white shadow-[0_7px_25px_rgba(76,54,38,0.035)]">
          {/* Search */}
          <div className="flex flex-col gap-3 border-b border-[#f0ebe6] p-4 sm:flex-row">
            <div className="relative w-full sm:max-w-[360px]">
              <input
                value={search}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                placeholder="상품명 또는 상품 ID 검색"
                className="
                  h-11 w-full rounded-lg
                  border border-[#e8e0d8]
                  bg-white px-4 pr-10
                  text-sm text-[#44362c]
                  outline-none
                  placeholder:text-[#b2a59b]
                  focus:border-[#c7a77f]
                "
              />

              <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#8d7d70]" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="h-[54px] bg-[#fcfaf8] text-left text-xs font-semibold text-[#75675c]">
                  <th className="w-14 pl-[18px]">
                    <Checkbox
                      checked={allCurrentPageSelected}
                      onChange={handleToggleAll}
                    />
                  </th>

                  <th>상품 정보</th>

                  <th className="w-[180px]">
                    가격
                  </th>

                  <th className="w-[180px]">
                    상품 ID
                  </th>

                  <th className="w-[190px]">
                    관리
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    selected={selectedIds.includes(product.id)}
                    onSelect={() =>
                      handleToggleProduct(product.id)
                    }
                  />
                ))}

                {currentProducts.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex min-w-[800px] items-center justify-between border-t border-[#f0ebe6] px-[18px] py-3">
            <span className="text-xs text-[#75685d]">
              전체 {filteredProducts.length}개
            </span>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

function Header() {
  return (
    <header className="flex h-[82px] items-center justify-between border-b border-[#ebe4dc] bg-[#fffdfa]/90 px-6 lg:px-[46px]">
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-[25px] rotate-[-17deg] overflow-hidden rounded-[50%] bg-[#795d46]">
          <span className="absolute bottom-0 left-[11px] top-0 w-px bg-[#e9d8c5]" />
        </div>

        <span className="font-serif text-[28px] font-bold tracking-[-0.05em] text-[#34271e]">
          Grids & Circle
        </span>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 text-sm font-semibold text-[#4b3b30]"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full border border-[#e5dcd2] bg-[#fffdfb]">
          <UserIcon className="h-[18px] w-[18px]" />
        </span>

        <span className="hidden sm:block">관리자</span>

        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
    </header>
  );
}



/* -------------------------------------------------------------------------- */
/* Product Row                                                                */
/* -------------------------------------------------------------------------- */

type ProductRowProps = {
  product: ProductResponse;
  selected: boolean;
  onSelect: () => void;
};

function ProductRow({
  product,
  selected,
  onSelect,
}: ProductRowProps) {
  return (
    <tr className="h-[91px] border-t border-[#f2ede8] text-[13px] text-[#4e4137]">
      <td className="pl-[18px]">
        <Checkbox
          checked={selected}
          onChange={onSelect}
        />
      </td>

      <td>
        <div className="flex items-center gap-[15px]">
          <ProductThumbnail imageUrl={product.imageUrl} />

          <div>
            <strong className="mb-1.5 block text-[13px] font-semibold text-[#3d3027]">
              {product.name}
            </strong>

            <span className="block text-[11px] text-[#a79a8f]">
              상품 #{product.id}
            </span>
          </div>
        </div>
      </td>

      <td className="font-medium text-[#403228]">
        {formatPrice(product.price)}
      </td>

      <td className="text-[#75675c]">
        {product.id}
      </td>

      <td>
        <div className="flex gap-2">
          <button
            type="button"
            className="
              h-[35px] min-w-14 rounded-lg
              border border-[#cbb59d]
              bg-white px-3
              text-xs text-[#735c45]
              hover:bg-[#faf6f1]
            "
          >
            수정
          </button>

          <button
            type="button"
            className="
              h-[35px] min-w-14 rounded-lg
              border border-[#edaaa3]
              bg-white px-3
              text-xs text-[#dc7168]
              hover:bg-[#fff8f7]
            "
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Product Thumbnail                                                          */
/* -------------------------------------------------------------------------- */

function ProductThumbnail({
  imageUrl,
}: {
  imageUrl?: string;
}) {
  return (
    <div className="relative grid h-[58px] w-12 place-items-center">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-[54px] w-11 object-contain"
        />
      ) : (
        <CoffeeBagPlaceholder />
      )}
    </div>
  );
}

function CoffeeBagPlaceholder() {
  return (
    <div className="relative h-[46px] w-[29px] rounded-[3px_3px_5px_5px] bg-gradient-to-r from-[#d4b17d] via-[#f1d9ad] to-[#cba36d]">
      <div className="absolute left-1 right-1 top-[15px] flex h-[19px] flex-col items-center justify-center rounded-sm bg-[#f8f2e9]">
        <span className="mb-px h-1 w-1.5 rounded-full bg-[#9d6744]" />

        <b className="text-[3px] tracking-[0.3px] text-[#594535]">
          COFFEE
        </b>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="flex items-center gap-1">
      <PaginationButton
        disabled={page === 1}
        onClick={() => onPageChange(1)}
      >
        <DoubleChevronLeftIcon />
      </PaginationButton>

      <PaginationButton
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon />
      </PaginationButton>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className={`
            grid h-8 w-8 place-items-center rounded-md text-xs
            ${
              page === pageNumber
                ? "bg-[#ae7d44] text-white"
                : "text-[#8b7c70] hover:bg-[#f5efe9]"
            }
          `}
        >
          {pageNumber}
        </button>
      ))}

      <PaginationButton
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRightIcon />
      </PaginationButton>

      <PaginationButton
        disabled={page === totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        <DoubleChevronRightIcon />
      </PaginationButton>

      <select
        defaultValue="10"
        className="
          ml-2 h-8 rounded-md
          border border-[#e7dfd7]
          bg-white px-2
          text-[11px] text-[#716258]
          outline-none
        "
      >
        <option value="10">10개씩 보기</option>
        <option value="20">20개씩 보기</option>
        <option value="50">50개씩 보기</option>
      </select>
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="
        grid h-8 w-8 place-items-center
        rounded-md text-[#8b7c70]
        hover:bg-[#f5efe9]
        disabled:cursor-default
        disabled:text-[#d2c8bf]
      "
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Checkbox                                                                   */
/* -------------------------------------------------------------------------- */

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="상품 선택"
      aria-pressed={checked}
      onClick={onChange}
      className={`
        grid h-[18px] w-[18px] place-items-center
        rounded-[4px] border
        transition-colors
        ${
          checked
            ? "border-[#ae7d44] bg-[#ae7d44]"
            : "border-[#ded5cc] bg-white"
        }
      `}
    >
      {checked && (
        <svg
          viewBox="0 0 11 11"
          className="h-[11px] w-[11px]"
          fill="none"
        >
          <path
            d="M2 5.5L4.3 8L9 3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
