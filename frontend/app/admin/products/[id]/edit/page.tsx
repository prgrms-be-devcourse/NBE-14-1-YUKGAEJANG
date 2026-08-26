'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import type { ProductResponse } from '@/app/_shared/apis/productApi.type';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export default function ProductEditPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const productId = params.id;

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            signal: controller.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('상품 정보를 불러오지 못했습니다.');
                }

                return response.json() as Promise<ProductResponse>;
            })
            .then((product) => {
                setName(product.name);
                setPrice(String(product.price));
                setImageUrl(product.imageUrl ?? '');
            })
            .catch((reason: unknown) => {
                if (reason instanceof DOMException && reason.name === 'AbortError') {
                    return;
                }

                setError(
                    reason instanceof Error
                        ? reason.message
                        : '상품 정보를 불러오는 중 문제가 발생했습니다.',
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => controller.abort();
    }, [productId]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const numericPrice = Number(price);

        if (!name.trim()) {
            setError('상품명을 입력해 주세요.');
            return;
        }

        if (!Number.isInteger(numericPrice) || numericPrice < 0) {
            setError('가격은 0 이상의 정수로 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/products/${productId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        price: numericPrice,
                        imageUrl: imageUrl.trim(),
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('상품 수정에 실패했습니다.');
            }

            window.alert('상품이 수정되었습니다.');
            router.push('/admin/products');
            router.refresh();
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : '상품 수정 중 문제가 발생했습니다.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-w-0 flex-1 px-6 py-10 lg:px-10">
                <div className="mx-auto max-w-[720px]">
                    <div className="h-[420px] animate-pulse rounded-2xl bg-[#eee8e2]" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-w-0 flex-1 px-6 py-10 lg:px-10">
            <div className="mx-auto max-w-[720px]">
                <div className="mb-7">
                    <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#392c23]">
                        상품 수정
                    </h1>

                    <p className="mt-2 text-sm text-[#96877b]">
                        상품명, 가격, 이미지 주소를 수정할 수 있습니다.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-[#eee7df] bg-white p-6 shadow-[0_7px_25px_rgba(76,54,38,0.035)] sm:p-8"
                >
                    <FormField label="상품 ID">
                        <input
                            value={productId}
                            disabled
                            className="h-11 w-full cursor-not-allowed rounded-lg border border-[#e8e0d8] bg-[#f5f1ed] px-4 text-sm text-[#8d8177]"
                        />
                    </FormField>

                    <FormField label="상품명" required>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            maxLength={255}
                            required
                            placeholder="상품명을 입력해 주세요"
                            className="h-11 w-full rounded-lg border border-[#e8e0d8] px-4 text-sm text-[#44362c] outline-none placeholder:text-[#b2a59b] focus:border-[#c7a77f]"
                        />
                    </FormField>

                    <FormField label="가격" required>
                        <div className="relative">
                            <input
                                type="number"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                min={0}
                                step={1}
                                required
                                placeholder="가격을 입력해 주세요"
                                className="h-11 w-full rounded-lg border border-[#e8e0d8] px-4 pr-12 text-sm text-[#44362c] outline-none placeholder:text-[#b2a59b] focus:border-[#c7a77f]"
                            />

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8d8177]">
                원
              </span>
                        </div>
                    </FormField>

                    <FormField label="이미지 URL">
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(event) => setImageUrl(event.target.value)}
                            maxLength={255}
                            placeholder="https://example.com/product.png"
                            className="h-11 w-full rounded-lg border border-[#e8e0d8] px-4 text-sm text-[#44362c] outline-none placeholder:text-[#b2a59b] focus:border-[#c7a77f]"
                        />
                    </FormField>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg border border-[#e6c9bf] bg-[#fff8f5] px-4 py-3 text-sm text-[#8b4939]"
                        >
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-[#f0ebe6] pt-6">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/products')}
                            disabled={isSubmitting}
                            className="h-11 rounded-lg border border-[#ded4ca] bg-white px-5 text-sm font-semibold text-[#67574a] hover:bg-[#faf6f1] disabled:opacity-60"
                        >
                            취소
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 rounded-lg bg-[#ae7d44] px-5 text-sm font-semibold text-white hover:bg-[#9d6e39] disabled:cursor-wait disabled:opacity-60"
                        >
                            {isSubmitting ? '수정 중...' : '수정 완료'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

function FormField({
                       label,
                       required = false,
                       children,
                   }: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#58483c]">
        {label}

          {required && <span className="ml-1 text-[#b86b59]">*</span>}
      </span>

            {children}
        </label>
    );
}