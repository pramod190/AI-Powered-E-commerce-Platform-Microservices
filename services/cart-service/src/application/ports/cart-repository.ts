import type { Cart, CartItem } from "../../domain/cart";

export type AddItemInput = {
  productId: string;
  quantity: number;
};

export type UpdateItemInput = {
  quantity: number;
};

export interface CartRepository {
  /**
   * Create or get cart for a user.
   * Initializes with empty items if new, returns existing if found.
   */
  getOrCreateCart(userId: string): Promise<Cart>;

  /**
   * Add or update item in cart.
   * If item exists, update quantity; if not, create new item.
   */
  addItem(userId: string, input: AddItemInput): Promise<Cart>;

  /**
   * Remove specific item from cart.
   */
  removeItem(userId: string, productId: string): Promise<Cart>;

  /**
   * Update item quantity.
   * If quantity <= 0, removes the item.
   */
  updateItem(userId: string, productId: string, input: UpdateItemInput): Promise<Cart>;

  /**
   * Clear all items from cart.
   */
  clearCart(userId: string): Promise<void>;

  /**
   * Delete entire cart.
   */
  deleteCart(userId: string): Promise<void>;

  /**
   * Get cart for user (returns null if not found).
   */
  getCart(userId: string): Promise<Cart | null>;
}
