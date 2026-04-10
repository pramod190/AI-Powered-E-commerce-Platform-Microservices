import type { Order } from "../../domain/order";
import type { OrderRepository } from "../ports/order-repository";

export class GetOrder {
  constructor(private readonly repo: OrderRepository) {}

  execute(orderId: string): Promise<Order | null> {
    return this.repo.getById(orderId);
  }
}
