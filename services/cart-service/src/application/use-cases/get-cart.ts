import type { Cart } from "../../domain/cart";
import type { CartRepository } from "../ports/cart-repository";

export class GetCart {
  constructor(private readonly repo: CartRepository) {}

  execute(userId: string): Promise<Cart | null> {
    return this.repo.getCart(userId);
  }
}
