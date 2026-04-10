export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: Date;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
};
