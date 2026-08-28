'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/app/_shared/apis/apiConfig';
import {
  ProductListResponse,
  ProductResponse,
} from '@/app/_shared/apis/productApi.type';

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
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  const [productsData, setProductsData] =
    useState<ProductListResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  /*
   * 상품 목록 조회
   *
   * Spring Page는 0부터 시작하기 때문에
   * 프론트의 page(1부터 시작)에서 1을 빼서 전달한다.
   *
   * productName이 있으면 서버에서 상품명 검색을 수행한다.
   */
  const fetchProducts = async (
    targetPage: number,
    productName: string = search,
  ) => {
    await Promise.resolve();

    setIsLoading(true);
    setErrorMessage('');

    try {
      const params = new URLSearchParams();

      params.set('page', String(targetPage - 1));

      if (productName.trim()) {
        params.set('productName', productName.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/products?${params.toString()}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error(
          '상품 목록을 불러오지 못했습니다.',
        );
      }

      const responseData: ProductListResponse =
        await response.json();

      setProductsData(responseData);
    } catch (error) {
      console.error(error);

      setProductsData(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : '상품 목록 조회 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * 페이지가 변경될 때마다 상품 목록 조회
   */
  useEffect(() => {
    void Promise.resolve().then(() =>
      fetchProducts(page, search),
    );
  }, [page]);

  /*
   * 백엔드에서 받은 현재 페이지 상품
   */
  const products = productsData?.products ?? [];

  /*
   * 백엔드에서 전달한 전체 페이지 수
   */
  const totalPages = Math.max(
    productsData?.totalPages ?? 1,
    1,
  );

  /*
   * 현재 페이지 전체 선택 여부
   */
  const allCurrentPageSelected =
    products.length > 0 &&
    products.every((product) =>
      selectedIds.includes(product.id),
    );

  /*
   * 검색어 변경
   */
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  /*
   * 검색 실행
   *
   * 검색할 때는 첫 페이지부터 조회한다.
   */
  const handleSearchSubmit = () => {
    setPage(1);

    void fetchProducts(1, search);
  };

  /*
   * 현재 페이지 전체 선택 / 해제
   */
  const handleToggleAll = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !products.some(
              (product) => product.id === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds((current) => {
      const next = new Set(current);

      products.forEach((product) => {
        next.add(product.id);
      });

      return [...next];
    });
  };

  /*
   * 개별 상품 선택 / 해제
   */
  const handleToggleProduct = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter(
            (selectedId) => selectedId !== id,
          )
        : [...current, id],
    );
  };

  /*
   * 페이지 변경
   */
  const handlePageChange = (nextPage: number) => {
    setPage(
      Math.max(
        1,
        Math.min(totalPages, nextPage),
      ),
    );
  };

  /*
   * 관리자 상품 삭제
   */
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      '상품을 삭제하시겠습니까?',
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        alert('상품 삭제에 실패했습니다.');
        return;
      }

      alert('상품이 삭제되었습니다.');

      /*
       * 삭제된 상품을 선택 목록에서도 제거
       */
      setSelectedIds((current) =>
        current.filter(
          (selectedId) => selectedId !== id,
        ),
      );

      /*
       * 삭제 후 현재 페이지를 다시 조회한다.
       *
       * 검색 중이었다면 검색어도 유지한다.
       */
      const params = new URLSearchParams();

      params.set('page', String(page - 1));

      if (search.trim()) {
        params.set('productName', search.trim());
      }

      const responseAfterDelete = await fetch(
        `${API_BASE_URL}/products?${params.toString()}`,
        {
          method: 'GET',
        },
      );

      if (!responseAfterDelete.ok) {
        throw new Error(
          '상품 목록을 다시 불러오지 못했습니다.',
        );
      }

      const updatedData: ProductListResponse =
        await responseAfterDelete.json();

      /*
       * 현재 페이지가 삭제로 인해 없어졌다면
       * 마지막 페이지로 이동한다.
       */
      if (
        page > updatedData.totalPages &&
        updatedData.totalPages > 0
      ) {
        setPage(updatedData.totalPages);
        return;
      }

      /*
       * 현재 페이지가 그대로 존재한다면
       * 새로 받아온 상품 목록으로 즉시 갱신한다.
       */
      setProductsData(updatedData);
    } catch (error) {
      console.error(error);

      alert(
        '상품 목록을 새로고침하지 못했습니다.',
      );
    }
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
            onClick={() =>
              router.push('/admin/products/add')
            }
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
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                placeholder="상품명 검색"
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

              <button
                type="button"
                onClick={handleSearchSubmit}
                aria-label="상품 검색"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <SearchIcon className="h-[17px] w-[17px] text-[#8d7d70]" />
              </button>

            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">

              <thead>
                <tr className="h-[54px] bg-[#fcfaf8] text-left text-xs font-semibold text-[#75675c]">

                  <th className="w-14 pl-[18px]">
                    <Checkbox
                      checked={
                        allCurrentPageSelected
                      }
                      onChange={
                        handleToggleAll
                      }
                    />
                  </th>

                  <th>상품 정보</th>

                  <th className="w-[180px]">
                    가격
                  </th>

                  <th className="w-[190px]">
                    관리
                  </th>

                </tr>
              </thead>

              <tbody>

                {!isLoading &&
                  !errorMessage &&
                  products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      selected={selectedIds.includes(
                        product.id,
                      )}
                      onSelect={() =>
                        handleToggleProduct(
                          product.id,
                        )
                      }
                      onDelete={() =>
                        handleDelete(product.id)
                      }
                      onEdit={() =>
                        router.push(
                          `/admin/products/${product.id}/edit`,
                        )
                      }
                    />
                  ))}

                {isLoading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-[#8d7d70]"
                    >
                      상품 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                )}

                {!isLoading && errorMessage && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-red-600"
                    >
                      {errorMessage}
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !errorMessage &&
                  products.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState />
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex min-w-[680px] items-center justify-between border-t border-[#f0ebe6] px-[18px] py-3">

            <span className="text-xs text-[#75685d]">
              현재 페이지 {products.length}개
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

        <span className="hidden sm:block">
          관리자
        </span>

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
  onDelete: () => void;
  onEdit: () => void;
};

function ProductRow({
  product,
  selected,
  onSelect,
  onDelete,
  onEdit,
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

          <ProductThumbnail
            imageUrl={product.imageUrl}
          />

          <div className="min-w-0">
            <strong className="block text-[13px] font-semibold text-[#3d3027]">
              {product.name}
            </strong>
          </div>
        </div>
      </td>

      <td className="font-medium text-[#403228]">
        {formatPrice(product.price)}
      </td>

      <td>
        <div className="flex gap-2">

          <button
            type="button"
            onClick={onEdit}
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
            onClick={onDelete}
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
        onClick={() =>
          onPageChange(page - 1)
        }
      >
        <ChevronLeftIcon />
      </PaginationButton>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() =>
            onPageChange(pageNumber)
          }
          className={`
            grid h-8 w-8 place-items-center rounded-md text-xs
            ${
              page === pageNumber
                ? 'bg-[#ae7d44] text-white'
                : 'text-[#8b7c70] hover:bg-[#f5efe9]'
            }
          `}
        >
          {pageNumber}
        </button>
      ))}

      <PaginationButton
        disabled={page === totalPages}
        onClick={() =>
          onPageChange(page + 1)
        }
      >
        <ChevronRightIcon />
      </PaginationButton>

      <PaginationButton
        disabled={page === totalPages}
        onClick={() =>
          onPageChange(totalPages)
        }
      >
        <DoubleChevronRightIcon />
      </PaginationButton>

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
        grid h-8 w-8 items-center justify-center
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
            ? 'border-[#ae7d44] bg-[#ae7d44]'
            : 'border-[#ded5cc] bg-white'
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
