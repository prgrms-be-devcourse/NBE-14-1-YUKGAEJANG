'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/app/_shared/apis/apiConfig';
import { ProductCreateRequest } from '@/app/_shared/apis/productApi.type';

const PRODUCT_IMAGES = Array.from(
  { length: 10 },
  (_, index) => `/imgs/product_type_${index}.png`,
);

export default function AdminProductsAddPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    imageUrl?: string;
  }>({});

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // 숫자만 입력
    if (!/^\d*$/.test(value)) {
      return;
    }

    setPrice(value);
  };

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!name.trim()) {
      nextErrors.name = '상품명을 입력해주세요.';
    }

    if (!price) {
      nextErrors.price = '가격을 입력해주세요.';
    } else if (Number(price) <= 0) {
      nextErrors.price = '가격은 0보다 커야 합니다.';
    }

    if (!imageUrl) {
      nextErrors.imageUrl = '상품 이미지를 선택해주세요.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const requestBody: ProductCreateRequest = {
      name: name.trim(),
      price: Number(price),
      imageUrl,
    };

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();

      alert(errorData.message ?? '상품 등록에 실패했습니다.');
      return;
    }

    alert('상품이 등록되었습니다.');

    router.push('/admin/products');
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-[1080px]">
        {/* Page Header */}
        <div className="mb-7 flex items-start gap-4">
          <button
            type="button"
            onClick={handleCancel}
            aria-label="상품 목록으로 돌아가기"
            className="
              grid h-10 w-10 shrink-0 place-items-center
              rounded-lg
              border border-[#e7ded5]
              bg-white
              text-[#55463b]
              transition-colors
              hover:bg-[#f8f3ee]
            "
          >
            <ArrowLeftIcon className="h-[18px] w-[18px]" />
          </button>

          <div>
            <h1 className="mb-2 text-[28px] font-bold tracking-[-0.04em] text-[#392c23]">
              상품 등록
            </h1>

            <p className="text-sm text-[#96877b]">
              새로운 상품 정보를 입력해주세요.
            </p>
          </div>
        </div>

        {/* Form */}
        <section className="rounded-2xl border border-[#e8e0d8] bg-white p-5 shadow-[0_7px_25px_rgba(76,54,38,0.035)] sm:p-7">
          <h2 className="mb-7 text-[17px] font-bold text-[#403228]">
            기본 정보
          </h2>

          <div className="space-y-7">
            {/* Product Name */}
            <div>
              <label
                htmlFor="product-name"
                className="mb-2.5 block text-sm font-semibold text-[#57483c]"
              >
                상품명
                <span className="ml-1 text-[#d56f67]">*</span>
              </label>

              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);

                  if (errors.name) {
                    setErrors((current) => ({
                      ...current,
                      name: undefined,
                    }));
                  }
                }}
                placeholder="상품명을 입력해주세요."
                className={`
                  h-11 w-full rounded-lg
                  border bg-white px-4
                  text-sm text-[#44362c]
                  outline-none
                  placeholder:text-[#b2a59b]
                  transition-colors
                  focus:border-[#b89161]
                  ${errors.name ? 'border-[#df8d84]' : 'border-[#e5ddd5]'}
                `}
              />

              {errors.name ? (
                <p className="mt-2 text-xs text-[#d56f67]">{errors.name}</p>
              ) : (
                <p className="mt-2 text-xs text-[#9b8d82]">
                  고객이 인지하기 쉬운 상품명을 입력해주세요.
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="product-price"
                className="mb-2.5 block text-sm font-semibold text-[#57483c]"
              >
                가격
                <span className="ml-1 text-[#d56f67]">*</span>
              </label>

              <div className="relative">
                <input
                  id="product-price"
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="가격을 입력해주세요."
                  className={`
                    h-11 w-full rounded-lg
                    border bg-white px-4 pr-12
                    text-sm text-[#44362c]
                    outline-none
                    placeholder:text-[#b2a59b]
                    transition-colors
                    focus:border-[#b89161]
                    ${errors.price ? 'border-[#df8d84]' : 'border-[#e5ddd5]'}
                  `}
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#76685d]">
                  원
                </span>
              </div>

              {errors.price ? (
                <p className="mt-2 text-xs text-[#d56f67]">{errors.price}</p>
              ) : (
                <p className="mt-2 text-xs text-[#9b8d82]">
                  숫자로만 입력해주세요.
                </p>
              )}
            </div>

            {/* Product Image */}
            <div>
              <div className="mb-2.5">
                <p className="text-sm font-semibold text-[#57483c]">
                  상품 이미지
                  <span className="ml-1 text-[#d56f67]">*</span>
                </p>

                <p className="mt-1.5 text-xs text-[#9b8d82]">
                  상품 대표 이미지를 선택해주세요.
                  <span className="ml-1 text-[#b0a299]">
                    (product_type_0.png ~ product_type_9.png)
                  </span>
                </p>
              </div>

              <div
                className={`
                  grid grid-cols-2 gap-3
                  sm:grid-cols-3
                  md:grid-cols-5
                `}
              >
                {PRODUCT_IMAGES.map((image) => {
                  const selected = imageUrl === image;

                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => {
                        setImageUrl(image);

                        if (errors.imageUrl) {
                          setErrors((current) => ({
                            ...current,
                            imageUrl: undefined,
                          }));
                        }
                      }}
                      className={`
                        group relative
                        overflow-hidden rounded-xl
                        border bg-white
                        p-3
                        text-left
                        transition-all
                        ${
                          selected
                            ? 'border-[#b8894e] ring-1 ring-[#b8894e]'
                            : 'border-[#ebe3db] hover:border-[#ccb397]'
                        }
                      `}
                    >
                      {/* Selected */}
                      {selected && (
                        <span
                          className="
                            absolute right-2 top-2 z-10
                            grid h-7 w-7 place-items-center
                            rounded-full
                            bg-[#a9763e]
                            text-white
                            shadow-sm
                          "
                        >
                          <CheckIcon className="h-4 w-4" />
                        </span>
                      )}

                      {/* Image */}
                      <div className="flex h-[130px] items-center justify-center rounded-lg bg-[#fcfaf7]">
                        <img
                          src={image}
                          alt={`상품 이미지 ${image}`}
                          className="
                            h-[115px]
                            w-auto
                            object-contain
                            transition-transform
                            group-hover:scale-[1.03]
                          "
                        />
                      </div>

                      {/* File name */}
                      <p
                        className={`
                          mt-3 truncate text-center
                          text-[11px]
                          ${
                            selected
                              ? 'font-semibold text-[#8d6338]'
                              : 'text-[#786a5e]'
                          }
                        `}
                      >
                        {image.split('/').pop()}
                      </p>
                    </button>
                  );
                })}
              </div>

              {errors.imageUrl && (
                <p className="mt-2 text-xs text-[#d56f67]">{errors.imageUrl}</p>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="
              h-11 min-w-[88px]
              rounded-lg
              border border-[#cbb59d]
              bg-white
              px-5
              text-sm font-medium
              text-[#735c45]
              transition-colors
              hover:bg-[#faf6f1]
            "
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="
              h-11 min-w-[120px]
              rounded-lg
              bg-[#ae7d44]
              px-5
              text-sm font-semibold
              text-white
              shadow-[0_4px_8px_rgba(105,74,42,0.12)]
              transition-colors
              hover:bg-[#9d6e39]
            "
          >
            상품 등록
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

type IconProps = {
  className?: string;
};

function Icon({
  className = 'h-[18px] w-[18px]',
  children,
}: IconProps & {
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Icon>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12 4 4L19 6" />
    </Icon>
  );
}
