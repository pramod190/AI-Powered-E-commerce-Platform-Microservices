import type { Product } from "../../domain/product";
import { AppError } from "../../shared/errors/app-error";
import type { ProductRepository, UpdateProductInput } from "../ports/product-repository";

export class UpdateProduct {
  constructor(private readonly repo: ProductRepository) {}

  async execute(id: string, input: UpdateProductInput): Promise<Product> {
    const updated = await this.repo.updateById(id, input);
    if (!updated) {
      throw new AppError({ statusCode: 404, code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }
    return updated;
  }
}

