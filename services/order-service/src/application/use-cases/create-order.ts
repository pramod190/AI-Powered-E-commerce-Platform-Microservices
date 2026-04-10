import type { Order } from "../../domain/order";
import type { OrderRepository, CreateOrderInput } from "../ports/order-repository";

export class CreateOrder {
  constructor(private readonly repo: OrderRepository) {}

  execute(input: CreateOrderInput): Promise<Order> {
    return this.repo.create(input);
  }
}
