import type { Cart } from "../../domain/cart";
import type { CartRepository } from "../ports/cart-repository";

export class RemoveItemFromCart {
  constructor(private readonly repo: CartRepository) {}

  execute(userId: string, productId: string): Promise<Cart> {
    return this.repo.removeItem(userId, productId);
  }
}
