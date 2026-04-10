import mongoose, { type InferSchemaType } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true,  trim: true, maxlength: 200 },
    price:       { type: Number, required: true,  min: 0 },
    category:    { type: String, required: true,  trim: true, maxlength: 120 },
    stock:       { type: Number, required: true,  min: 0 },
    description: { type: String, required: false, maxlength: 2000 }
  },
  { timestamps: true }
);

// ─── Indexes (query-optimisation) ────────────────────────────────────────────
//
// 1. Text index  → powers $text keyword search on name + description.
//    Without this, keyword search would require a full collection scan (O(n)).
productSchema.index({ name: "text", description: "text" }, { name: "product_text_search" });

// 2. category + price  → covers "filter by category, sort by price" queries.
//    MongoDB can satisfy both the match and the sort from this one index,
//    avoiding an in-memory SORT stage entirely.
productSchema.index({ category: 1, price: 1 }, { name: "category_price" });

// 3. category + createdAt  → covers "filter by category, sort by newest" queries.
productSchema.index({ category: 1, createdAt: -1 }, { name: "category_newest" });

// 4. price alone  → covers price-sort without a category filter.
productSchema.index({ price: 1 }, { name: "price_asc" });

// 5. createdAt alone  → default sort (newest first) without any filter.
productSchema.index({ createdAt: -1 }, { name: "newest" });

// ─────────────────────────────────────────────────────────────────────────────

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId };

export const ProductModel =
  mongoose.models.Product ?? mongoose.model("Product", productSchema, "products");


