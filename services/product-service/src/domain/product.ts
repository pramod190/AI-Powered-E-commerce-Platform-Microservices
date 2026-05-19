export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
};

