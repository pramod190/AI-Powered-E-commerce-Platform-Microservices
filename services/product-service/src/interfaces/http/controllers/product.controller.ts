import type { Request, Response } from "express";
import { MongoProductRepository } from "../../../infrastructure/repositories/mongo-product-repository";
import { CreateProduct }   from "../../../application/use-cases/create-product";
import { ListProducts }    from "../../../application/use-cases/list-products";
import { GetProduct }      from "../../../application/use-cases/get-product";
import { UpdateProduct }   from "../../../application/use-cases/update-product";
import { DeleteProduct }   from "../../../application/use-cases/delete-product";
import { SearchProducts }  from "../../../application/use-cases/search-products";
import type { ProductSortField, SortOrder } from "../../../application/ports/product-repository";

const repo = new MongoProductRepository();

const createProduct  = new CreateProduct(repo);
const listProducts   = new ListProducts(repo);
const getProduct     = new GetProduct(repo);
const updateProduct  = new UpdateProduct(repo);
const deleteProduct  = new DeleteProduct(repo);
const searchProducts = new SearchProducts(repo);

// ─── Basic CRUD handlers ─────────────────────────────────────────────────────

export async function create(req: Request, res: Response) {
  const product = await createProduct.execute(req.body);
  res.status(201).json({ product });
}

export async function list(_req: Request, res: Response) {
  const products = await listProducts.execute();
  res.json({ products });
}

export async function getById(req: Request, res: Response) {
  const product = await getProduct.execute(req.params.id);
  res.json({ product });
}

export async function updateById(req: Request, res: Response) {
  const product = await updateProduct.execute(req.params.id, req.body);
  res.json({ product });
}

export async function deleteById(req: Request, res: Response) {
  await deleteProduct.execute(req.params.id);
  res.status(204).send();
}

// ─── Advanced Search handler ─────────────────────────────────────────────────

const VALID_SORT_FIELDS  = new Set<ProductSortField>(["price", "createdAt"]);
const VALID_SORT_ORDERS  = new Set<SortOrder>(["asc", "desc"]);

export async function search(req: Request, res: Response) {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    page,
    limit
  } = req.query as Record<string, string | undefined>;

  const result = await searchProducts.execute({
    q:         q                                              || undefined,
    category:  category                                      || undefined,
    minPrice:  minPrice  !== undefined ? Number(minPrice)  : undefined,
    maxPrice:  maxPrice  !== undefined ? Number(maxPrice)  : undefined,
    sortBy:    VALID_SORT_FIELDS.has(sortBy as ProductSortField)
                 ? (sortBy as ProductSortField)
                 : undefined,
    sortOrder: VALID_SORT_ORDERS.has(sortOrder as SortOrder)
                 ? (sortOrder as SortOrder)
                 : undefined,
    page:      page  !== undefined ? Number(page)  : undefined,
    limit:     limit !== undefined ? Number(limit) : undefined
  });

  res.json(result);
}


