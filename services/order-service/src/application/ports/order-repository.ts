import type { Order, OrderStatus } from "../../domain/order";

export type CreateOrderInput = {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
};

export type UpdateOrderStatusInput = {
  status: OrderStatus;
};

export interface OrderRepository {
  create(input: CreateOrderInput): Promise<Order>;
  getById(id: string): Promise<Order | null>;
  getByUserId(userId: string): Promise<Order[]>;
  updateStatus(orderId: string, input: UpdateOrderStatusInput): Promise<Order>;
  listAll(limit: number, offset: number): Promise<{ orders: Order[]; total: number }>;
}
