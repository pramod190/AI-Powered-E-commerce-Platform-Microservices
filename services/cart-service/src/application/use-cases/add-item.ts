import type { Cart } from "../../domain/cart";
import type { CartRepository, AddItemInput } from "../ports/cart-repository";

export class AddItemToCart {
  constructor(private readonly repo: CartRepository) {}

  execute(userId: string, input: AddItemInput): Promise<Cart> {
    return this.repo.addItem(userId, input);
  }
}
