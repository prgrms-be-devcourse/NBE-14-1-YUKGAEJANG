import { OrderResponse } from '../apis/orderApi.type';

const mockOrders: OrderResponse[] = [
  {
    id: 1,
    email: "test@email.com",
    address: "서울특별시 강남구 테헤란로 123",
    zipCode: "06142",
    orderDate: "2026-08-26",
    items: [
      {
        productId: 1,
        productName: "아메리카노오",
        quantity: 3,
      },
      {
        productId: 2,
        productName: "콜드브루우",
        quantity: 2,
      },
      {
        productId: 3,
        productName: "커피",
        quantity: 1,
      },
      {
        productId: 4,
        productName: "디카페",
        quantity: 4,
      },
    ],
  },
  {
    id: 2,
    email: "test@email.com",
    address: "서울특별시 강남구 테헤란로 123",
    zipCode: "06142",
    orderDate: "2026-08-26",
    items: [
      {
        productId: 4,
        productName: "디카페",
        quantity: 10,
      },
      {
        productId: 3,
        productName: "커피",
        quantity: 2,
      },
    ],
  },
];

export default mockOrders;
