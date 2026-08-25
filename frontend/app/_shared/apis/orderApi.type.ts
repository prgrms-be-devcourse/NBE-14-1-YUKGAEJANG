// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
//
// 주문 생성 API 타입
//
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
/**
 * 주문 생성 사용자 입력값 RequestBody 타입
 */
export type OrderCreateRequest = {
  email: string;
  zipCode: string;
  address: string;
  items: OrderItemRequest[];
};

/**
 * 주문한 상품
 * 
 * - 위 `주문 생성 사용자 입력값` 의 items 항목
 */
export type OrderItemRequest = {
  productId: number;
  quantity: number;
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
//
// 주문 생성/목록 응답
//
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
/**
 * 주문 생성/목록 API Response 타입
 */
export type OrderResponse = {
  id: number;
  email: string;
  zipCode: string;
  address: string;
  orderDate: string;
  items: OrderItemResponse[]
}

/**
 * 주문한 상품 응답의 items 항목
 */
export type OrderItemResponse = {
  productId: number;
  productName: string;
  quantity: number;

  // FIXME: backend 에서 price 내려주기
};
