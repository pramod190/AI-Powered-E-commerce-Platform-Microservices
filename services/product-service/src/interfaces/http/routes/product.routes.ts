import { Router } from "express";
import { z } from "zod";
import * as productController from "../controllers/product.controller";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middleware/validate";

export const productRouter = Router();

// ─── Shared param schema ─────────────────────────────────────────────────────

const idParam = z.object({ id: z.string().min(1) });

// ─── Create / Update body schemas ────────────────────────────────────────────

const createSchema = z.object({
  name:        z.string().min(1).max(200),
  price:       z.number().nonnegative(),
  category:    z.string().min(1).max(120),
  stock:       z.number().int().nonnegative(),
  description: z.string().max(2000).optional(),
  image:       z.string().url().max(1000).optional()
});

const updateSchema = createSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

// ─── Advanced Search query schema ────────────────────────────────────────────
//
// All fields are query-string strings; coerce.number() handles the string→number
// conversion before our validations run, so callers may pass ?page=2&limit=10.

const searchQuerySchema = z.object({
  /** Keyword search against name + description. */
  q:         z.string().max(200).optional(),

  /** Filter by category (case-insensitive). */
  category:  z.string().max(120).optional(),

  /** Minimum price, inclusive. */
  minPrice:  z.coerce.number().nonnegative().optional(),

  /** Maximum price, inclusive. */
  maxPrice:  z.coerce.number().nonnegative().optional(),

  /** Sort field: "price" | "createdAt". Defaults to createdAt. */
  sortBy:    z.enum(["price", "createdAt"]).optional(),

  /** Sort direction: "asc" | "desc". Defaults to desc. */
  sortOrder: z.enum(["asc", "desc"]).optional(),

  /** Page number (1-based). Defaults to 1. */
  page:      z.coerce.number().int().positive().optional(),

  /** Items per page. Defaults to 20, max 100. */
  limit:     z.coerce.number().int().positive().max(100).optional()
}).refine(
  (v) => {
    if (v.minPrice !== undefined && v.maxPrice !== undefined) {
      return v.minPrice <= v.maxPrice;
    }
    return true;
  },
  { message: "minPrice must be ≤ maxPrice", path: ["minPrice"] }
);

// ─── Routes ──────────────────────────────────────────────────────────────────

// ⚠️ /products/search MUST be declared before /products/:id so Express
//    treats "search" as a literal segment, not an id parameter.
productRouter.get(
  "/products/search",
  validate({ query: searchQuerySchema }),
  asyncHandler(productController.search)
);

productRouter.post(   "/products",     validate({ body: createSchema }),                            asyncHandler(productController.create));
productRouter.get(    "/products",                                                                   asyncHandler(productController.list));
productRouter.get(    "/products/:id", validate({ params: idParam }),                               asyncHandler(productController.getById));
productRouter.patch(  "/products/:id", validate({ params: idParam, body: updateSchema }),           asyncHandler(productController.updateById));
productRouter.delete( "/products/:id", validate({ params: idParam }),                               asyncHandler(productController.deleteById));


