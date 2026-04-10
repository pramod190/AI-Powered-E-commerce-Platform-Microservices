import { AppError } from "../../shared/errors/app-error";
import type { ProductRepository } from "../ports/product-repository";

export class DeleteProduct {
  constructor(private readonly repo: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) {
      throw new AppError({ statusCode: 404, code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }
  }
}

