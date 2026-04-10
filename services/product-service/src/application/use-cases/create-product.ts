import type { Product } from "../../domain/product";
import type { CreateProductInput, ProductRepository } from "../ports/product-repository";

export class CreateProduct {
  constructor(private readonly repo: ProductRepository) {}

  execute(input: CreateProductInput): Promise<Product> {
    return this.repo.create(input);
  }
}

