import type { Product } from "../../domain/product";
import type { ProductRepository } from "../ports/product-repository";

export class ListProducts {
  constructor(private readonly repo: ProductRepository) {}

  execute(): Promise<Product[]> {
    return this.repo.list();
  }
}

