import type { Product } from "../../domain/product";

// ─── Basic CRUD types ────────────────────────────────────────────────────────

export type CreateProductInput = {
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  image?: string;
};

export type UpdateProductInput = Partial<CreateProductInput>;

// ─── Advanced Search types ───────────────────────────────────────────────────

/** Fields that can be used to sort results. */
export type ProductSortField = "price" | "createdAt";

/** Sort direction. */
export type SortOrder = "asc" | "desc";

/** All accepted search / filter / pagination parameters. */
export type SearchProductsParams = {
  /** Full-text keyword search against name & description. */
  q?: string;

  /** Filter by exact category (case-insensitive). */
  category?: string;

  /** Minimum price (inclusive). */
  minPrice?: number;

  /** Maximum price (inclusive). */
  maxPrice?: number;

  /** Field to sort by. Defaults to "createdAt". */
  sortBy?: ProductSortField;

  /** Sort direction. Defaults to "desc". */
  sortOrder?: SortOrder;

  /** 1-based page number. Defaults to 1. */
  page?: number;

  /** Items per page. Defaults to 20, max 100. */
  limit?: number;
};

/** Paginated wrapper returned by search(). */
export type PaginatedProducts = {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

// ─── Repository interface ────────────────────────────────────────────────────

export interface ProductRepository {
  create(input: CreateProductInput): Promise<Product>;
  /** Legacy: returns all products, no pagination. Prefer search(). */
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  updateById(id: string, input: UpdateProductInput): Promise<Product | null>;
  deleteById(id: string): Promise<boolean>;
  /** Advanced search with pagination, filters and sorting. */
  search(params: SearchProductsParams): Promise<PaginatedProducts>;
}


