export type Product = {
  id: number;
  name: string;
  origin: string;
  price: number;
};

export type CartItem = Product & {
  quantity: number;
};
