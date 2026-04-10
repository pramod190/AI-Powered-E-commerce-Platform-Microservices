import type { Product } from "../../domain/product";
import { AppError } from "../../shared/errors/app-error";
import type { ProductRepository } from "../ports/product-repository";

export class GetProduct {
  constructor(private readonly repo: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.repo.getById(id);
    if (!product) {
      throw new AppError({ statusCode: 404, code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }
    return product;
  }
}

