import axios, { type AxiosInstance } from "axios";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";
import { AppError } from "../../shared/errors/app-error";

export type ProductServiceProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
};

export class ProductServiceClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.PRODUCT_SERVICE_URL,
      timeout: 5000
    });
  }

  async getProduct(productId: string): Promise<ProductServiceProduct> {
    try {
      const { data } = await this.client.get<{ product: ProductServiceProduct }>(`/products/${productId}`);
      return data.product;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new AppError({
            message: `Product ${productId} not found`,
            statusCode: 404,
            code: "PRODUCT_NOT_FOUND"
          });
        }
        logger.error({ error: error.message }, "Product service error");
        throw new AppError({
          message: "Failed to fetch product",
          statusCode: 503,
          code: "PRODUCT_SERVICE_ERROR"
        });
      }
      throw error;
    }
  }

  async getProducts(productIds: string[]): Promise<Map<string, ProductServiceProduct>> {
    const products = new Map<string, ProductServiceProduct>();

    for (const id of productIds) {
      try {
        const product = await this.getProduct(id);
        products.set(id, product);
      } catch (error) {
        logger.warn({ productId: id }, "Failed to fetch individual product");
      }
    }

    return products;
  }
}

export const productServiceClient = new ProductServiceClient();
