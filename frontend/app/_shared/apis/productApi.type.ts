// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
//
// 상품 생성 API 타입
//
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
/**
 * 상품 생성/수정 사용자 입력값 RequestBody 타입
 */
export type ProductCreateRequest = {
  name: string;
  price: number;
  imageUrl?: string;
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
//
// 상품 생성/수정/목록 응답
//
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
/**
 * 주문 생성/수정/목록 API Response 타입
 */
export type ProductResponse = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  // origin: string;
};

export type ProductListResponse = {
  totalPages: number;
  products: ProductResponse[];
};

export type CartItem = {
  product: ProductResponse;
  quantity: number;
};
