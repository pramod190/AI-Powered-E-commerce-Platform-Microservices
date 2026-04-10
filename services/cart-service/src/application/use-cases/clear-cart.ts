import type { CartRepository } from "../ports/cart-repository";

export class ClearCart {
  constructor(private readonly repo: CartRepository) {}

  execute(userId: string): Promise<void> {
    return this.repo.clearCart(userId);
  }
}
