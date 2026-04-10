import type {
  PaginatedProducts,
  ProductRepository,
  SearchProductsParams
} from "../ports/product-repository";

/**
 * SearchProducts use-case.
 *
 * Orchestrates paginated, filtered and sorted product retrieval.
 * All query optimisation lives in the repository implementation.
 */
export class SearchProducts {
  constructor(private readonly repo: ProductRepository) {}

  execute(params: SearchProductsParams): Promise<PaginatedProducts> {
    return this.repo.search(params);
  }
}
