import axios, { type AxiosInstance } from "axios";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";
import { AppError } from "../../shared/errors/app-error";

export type CartServiceCart = {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      category: string;
    };
    subtotal: number;
  }>;
  total: number;
  itemCount: number;
};

export class CartServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.CART_SERVICE_URL,
      timeout: 5000
    });
  }

  async getCart(userId: string): Promise<CartServiceCart> {
    try {
      const { data } = await this.client.get<{ cart: CartServiceCart }>("/cart", {
        headers: { "x-user-id": userId }
      });
      return data.cart;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error({ error: error.message }, "Cart service error");
        throw new AppError({
          message: "Failed to fetch cart",
          statusCode: 503,
          code: "CART_SERVICE_ERROR"
        });
      }
      throw error;
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      await this.client.delete("/cart", {
        headers: { "x-user-id": userId }
      });
    } catch (error) {
      logger.warn({ userId }, "Failed to clear cart");
      // Don't throw - clearing cart is best-effort
    }
  }
}

export const cartServiceClient = new CartServiceClient();
