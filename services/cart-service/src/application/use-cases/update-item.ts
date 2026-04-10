import type { Cart } from "../../domain/cart";
import type { CartRepository, UpdateItemInput } from "../ports/cart-repository";

export class UpdateCartItem {
  constructor(private readonly repo: CartRepository) {}

  execute(userId: string, productId: string, input: UpdateItemInput): Promise<Cart> {
    return this.repo.updateItem(userId, productId, input);
  }
}
