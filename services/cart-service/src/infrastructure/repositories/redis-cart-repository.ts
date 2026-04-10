import { getRedis } from "../cache/redis";
import type { Cart, CartItem } from "../../domain/cart";
import type { CartRepository, AddItemInput, UpdateItemInput } from "../../application/ports/cart-repository";
import { AppError } from "../../shared/errors/app-error";
import { env } from "../../config/env";
import { productServiceClient, type ProductServiceProduct } from "../http-client/product-service";
import { logger } from "../../shared/logger";

const CART_KEY_PREFIX = "cart:";

type CartData = {
  items: CartItem[];
};

export class RedisCartRepository implements CartRepository {
  private getCartKey(userId: string): string {
    return `${CART_KEY_PREFIX}${userId}`;
  }

  private async toDomain(userId: string, data: CartData | null): Promise<Cart | null> {
    if (!data) return null;

    const item = await getRedis().get(this.getCartKey(userId));
    if (!item) return null;

    const now = new Date();
    return {
      userId,
      items: data.items,
      itemCount: data.items.reduce((sum, item) => sum + item.quantity, 0),
      total: 0, // Will be calculated by API layer
      createdAt: now,
      updatedAt: now
    };
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    this.validateUserId(userId);

    const key = this.getCartKey(userId);
    let cartData = await this.getCartData(userId);

    if (!cartData) {
      cartData = { items: [] };
      await getRedis().setEx(key, env.CART_TTL, JSON.stringify(cartData));
      logger.debug({ userId }, "Created new cart");
    } else {
      // Refresh TTL on access
      await getRedis().expire(key, env.CART_TTL);
    }

    const now = new Date();
    return {
      userId,
      items: cartData.items,
      itemCount: cartData.items.reduce((sum, item) => sum + item.quantity, 0),
      total: 0,
      createdAt: now,
      updatedAt: now
    };
  }

  async addItem(userId: string, input: AddItemInput): Promise<Cart> {
    this.validateUserId(userId);
    this.validateAddItemInput(input);

    // Verify product exists and has sufficient stock
    const product = await productServiceClient.getProduct(input.productId);
    if (product.stock < input.quantity) {
      throw new AppError({
        message: `Insufficient stock. Available: ${product.stock}`,
        statusCode: 400,
        code: "INSUFFICIENT_STOCK",
        details: { available: product.stock, requested: input.quantity }
      });
    }

    const key = this.getCartKey(userId);
    let cartData = await this.getCartData(userId);

    if (!cartData) {
      cartData = { items: [] };
    }

    // Update or add item
    const existingItem = cartData.items.find((item) => item.productId === input.productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + input.quantity;
      if (newQuantity > product.stock) {
        throw new AppError({
          message: `Total quantity exceeds stock. Available: ${product.stock}`,
          statusCode: 400,
          code: "INSUFFICIENT_STOCK",
          details: { available: product.stock, requested: newQuantity }
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      cartData.items.push({
        productId: input.productId,
        quantity: input.quantity,
        addedAt: new Date()
      });
    }

    await getRedis().setEx(key, env.CART_TTL, JSON.stringify(cartData));
    logger.debug({ userId, productId: input.productId, quantity: input.quantity }, "Item added to cart");

    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    this.validateUserId(userId);
    if (!productId) {
      throw new AppError({
        message: "Product ID is required",
        statusCode: 400,
        code: "INVALID_PRODUCT_ID"
      });
    }

    const key = this.getCartKey(userId);
    let cartData = await this.getCartData(userId);

    if (!cartData) {
      cartData = { items: [] };
    }

    const initialLength = cartData.items.length;
    cartData.items = cartData.items.filter((item) => item.productId !== productId);

    if (cartData.items.length === initialLength) {
      throw new AppError({
        message: "Item not found in cart",
        statusCode: 404,
        code: "ITEM_NOT_FOUND"
      });
    }

    await getRedis().setEx(key, env.CART_TTL, JSON.stringify(cartData));
    logger.debug({ userId, productId }, "Item removed from cart");

    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: string, productId: string, input: UpdateItemInput): Promise<Cart> {
    this.validateUserId(userId);
    if (!productId) {
      throw new AppError({
        message: "Product ID is required",
        statusCode: 400,
        code: "INVALID_PRODUCT_ID"
      });
    }
    if (input.quantity < 0) {
      throw new AppError({
        message: "Quantity must be non-negative",
        statusCode: 400,
        code: "INVALID_QUANTITY"
      });
    }

    // If quantity is 0, remove the item
    if (input.quantity === 0) {
      return this.removeItem(userId, productId);
    }

    // Verify product exists and has sufficient stock
    const product = await productServiceClient.getProduct(productId);
    if (product.stock < input.quantity) {
      throw new AppError({
        message: `Insufficient stock. Available: ${product.stock}`,
        statusCode: 400,
        code: "INSUFFICIENT_STOCK",
        details: { available: product.stock, requested: input.quantity }
      });
    }

    const key = this.getCartKey(userId);
    let cartData = await this.getCartData(userId);

    if (!cartData) {
      throw new AppError({
        message: "Cart not found",
        statusCode: 404,
        code: "CART_NOT_FOUND"
      });
    }

    const item = cartData.items.find((item) => item.productId === productId);
    if (!item) {
      throw new AppError({
        message: "Item not found in cart",
        statusCode: 404,
        code: "ITEM_NOT_FOUND"
      });
    }

    item.quantity = input.quantity;

    await getRedis().setEx(key, env.CART_TTL, JSON.stringify(cartData));
    logger.debug({ userId, productId, quantity: input.quantity }, "Item quantity updated");

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    this.validateUserId(userId);

    const key = this.getCartKey(userId);
    const cartData: CartData = { items: [] };

    await getRedis().setEx(key, env.CART_TTL, JSON.stringify(cartData));
    logger.debug({ userId }, "Cart cleared");
  }

  async deleteCart(userId: string): Promise<void> {
    this.validateUserId(userId);

    const key = this.getCartKey(userId);
    await getRedis().del(key);
    logger.debug({ userId }, "Cart deleted");
  }

  async getCart(userId: string): Promise<Cart | null> {
    this.validateUserId(userId);

    const cartData = await this.getCartData(userId);
    if (!cartData) return null;

    const now = new Date();
    return {
      userId,
      items: cartData.items,
      itemCount: cartData.items.reduce((sum, item) => sum + item.quantity, 0),
      total: 0,
      createdAt: now,
      updatedAt: now
    };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private async getCartData(userId: string): Promise<CartData | null> {
    const key = this.getCartKey(userId);
    const data = await getRedis().get(key);
    return data ? (JSON.parse(data) as CartData) : null;
  }

  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new AppError({
        message: "Invalid user ID",
        statusCode: 400,
        code: "INVALID_USER_ID"
      });
    }
  }

  private validateAddItemInput(input: AddItemInput): void {
    if (!input.productId) {
      throw new AppError({
        message: "Product ID is required",
        statusCode: 400,
        code: "INVALID_PRODUCT_ID"
      });
    }
    if (input.quantity < 1) {
      throw new AppError({
        message: "Quantity must be at least 1",
        statusCode: 400,
        code: "INVALID_QUANTITY"
      });
    }
  }
}
