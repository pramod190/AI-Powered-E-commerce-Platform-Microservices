import mongoose, { type FilterQuery } from "mongoose";
import type { Product } from "../../domain/product";
import type {
  CreateProductInput,
  PaginatedProducts,
  ProductRepository,
  SearchProductsParams,
  UpdateProductInput
} from "../../application/ports/product-repository";
import { ProductModel } from "../models/product.model";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDomain(doc: any): Product {
  return {
    id:          String(doc._id),
    name:        doc.name,
    price:       doc.price,
    category:    doc.category,
    stock:       doc.stock,
    description: doc.description ?? undefined,
    createdAt:   doc.createdAt,
    updatedAt:   doc.updatedAt
  };
}

/** Cap limit to prevent accidental full-collection loads. */
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE  = 1;

// ─── Repository ───────────────────────────────────────────────────────────────

export class MongoProductRepository implements ProductRepository {

  // ── Basic CRUD ─────────────────────────────────────────────────────────────

  async create(input: CreateProductInput): Promise<Product> {
    const doc = await ProductModel.create(input);
    return toDomain(doc);
  }

  async list(): Promise<Product[]> {
    const docs = await ProductModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(toDomain);
  }

  async getById(id: string): Promise<Product | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await ProductModel.findById(id).lean();
    return doc ? toDomain(doc) : null;
  }

  async updateById(id: string, input: UpdateProductInput): Promise<Product | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await ProductModel.findByIdAndUpdate(id, { $set: input }, { new: true }).lean();
    return doc ? toDomain(doc) : null;
  }

  async deleteById(id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) return false;
    const res = await ProductModel.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }

  // ── Advanced Search ────────────────────────────────────────────────────────

  async search(params: SearchProductsParams): Promise<PaginatedProducts> {
    const page  = Math.max(1, params.page  ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit ?? DEFAULT_LIMIT));
    const skip  = (page - 1) * limit;

    // ── Build filter ────────────────────────────────────────────────────────
    //
    // We only add conditions that were actually requested so MongoDB can
    // pick the tightest compound index available.
    const filter: FilterQuery<typeof ProductModel> = {};

    // Keyword search — uses the "product_text_search" text index.
    // $text is always O(log n) vs a $regex full-scan.
    if (params.q && params.q.trim()) {
      filter.$text = { $search: params.q.trim() };
    }

    // category — case-insensitive via collation (defined on the query below).
    if (params.category) {
      filter.category = params.category.trim();
    }

    // price range — both bounds are optional so we build $gte/$lte selectively.
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      filter.price = {};
      if (params.minPrice !== undefined) filter.price.$gte = params.minPrice;
      if (params.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
    }

    // ── Build sort ──────────────────────────────────────────────────────────
    //
    // When $text is used MongoDB can also rank by textScore, so we prioritise
    // relevance first, then the user-chosen field.
    const sortBy    = params.sortBy    ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";
    const mongoDir  = sortOrder === "asc" ? 1 : -1;

    const sort: Record<string, 1 | -1 | { $meta: "textScore" }> = {};
    if (params.q) {
      // Relevance score first when a keyword is given.
      sort.score = { $meta: "textScore" };
    }
    sort[sortBy] = mongoDir;

    // ── Execute count + data queries IN PARALLEL ────────────────────────────
    //
    // Running both independently halves the round-trip latency compared to
    // a sequential count-then-find pattern.
    const collation = { locale: "en", strength: 2 }; // case-insensitive matching

    const [total, docs] = await Promise.all([
      ProductModel.countDocuments(filter).collation(collation),
      ProductModel.find(filter, params.q ? { score: { $meta: "textScore" } } : {})
        .collation(collation)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const totalPages  = Math.ceil(total / limit);

    return {
      data: docs.map(toDomain),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}


