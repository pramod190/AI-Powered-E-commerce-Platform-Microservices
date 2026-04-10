import type { Order } from "../../domain/order";
import type { OrderRepository, UpdateOrderStatusInput } from "../ports/order-repository";

export class UpdateOrderStatus {
  constructor(private readonly repo: OrderRepository) {}

  execute(orderId: string, input: UpdateOrderStatusInput): Promise<Order> {
    return this.repo.updateStatus(orderId, input);
  }
}
