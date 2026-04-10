import axios, { type AxiosInstance } from "axios";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";
import { AppError } from "../../shared/errors/app-error";

export type OrderServiceOrder = {
  id: string;
  userId: string;
  status: string;
  total: number;
  items: any[];
};

export class OrderServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.ORDER_SERVICE_URL,
      timeout: 5000
    });
  }

  async getOrder(orderId: string): Promise<OrderServiceOrder> {
    try {
      const { data } = await this.client.get<{ order: OrderServiceOrder }>(`/orders/${orderId}`);
      return data.order;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new AppError({
            message: `Order ${orderId} not found`,
            statusCode: 404,
            code: "ORDER_NOT_FOUND"
          });
        }
        logger.error({ error: error.message }, "Order service error");
        throw new AppError({
          message: "Failed to fetch order",
          statusCode: 503,
          code: "ORDER_SERVICE_ERROR"
        });
      }
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<OrderServiceOrder> {
    try {
      const { data } = await this.client.patch<{ order: OrderServiceOrder }>(`/orders/${orderId}/status`, {
        status
      });
      return data.order;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error({ error: error.message, orderId, status }, "Failed to update order status");
        throw new AppError({
          message: "Failed to update order status",
          statusCode: 503,
          code: "ORDER_SERVICE_ERROR"
        });
      }
      throw error;
    }
  }
}

export const orderServiceClient = new OrderServiceClient();
