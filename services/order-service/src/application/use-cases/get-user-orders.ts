import type { Order } from "../../domain/order";
import type { OrderRepository } from "../ports/order-repository";

export class GetUserOrders {
  constructor(private readonly repo: OrderRepository) {}

  execute(userId: string): Promise<Order[]> {
    return this.repo.getByUserId(userId);
  }
}
