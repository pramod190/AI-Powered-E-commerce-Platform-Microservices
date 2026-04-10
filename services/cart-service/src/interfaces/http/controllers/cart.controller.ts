import type { Request, Response } from "express";
import { RedisCartRepository } from "../../../infrastructure/repositories/redis-cart-repository";
import { AddItemToCart } from "../../../application/use-cases/add-item";
import { RemoveItemFromCart } from "../../../application/use-cases/remove-item";
import { GetCart } from "../../../application/use-cases/get-cart";
import { ClearCart } from "../../../application/use-cases/clear-cart";
import { UpdateCartItem } from "../../../application/use-cases/update-item";
import { productServiceClient } from "../../../infrastructure/http-client/product-service";
import { AppError } from "../../../shared/errors/app-error";

const repo = new RedisCartRepository();

const addItemToCart = new AddItemToCart(repo);
const removeItemFromCart = new RemoveItemFromCart(repo);
const getCart = new GetCart(repo);
const clearCart = new ClearCart(repo);
const updateCartItem = new UpdateCartItem(repo);

async function enrichCartWithPricing(cart: any) {
  if (cart.items.length === 0) {
    return { ...cart, total: 0, itemCount: 0 };
  }

  const productIds = cart.items.map((item) => item.productId);
  const products = await productServiceClient.getProducts(productIds);

  let total = 0;
  const enrichedItems = cart.items.map((item) => {
    const product = products.get(item.productId);
    if (!product) {
      throw new AppError({
        message: `Product ${item.productId} not found`,
        statusCode: 404,
        code: "PRODUCT_NOT_FOUND"
      });
    }
    const itemTotal = product.price * item.quantity;
    total += itemTotal;
    return {
      ...item,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category
      },
      subtotal: itemTotal
    };
  });

  return { ...cart, items: enrichedItems, total, itemCount: cart.itemCount };
}

export async function getCartHandler(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    throw new AppError({
      message: "User ID header (x-user-id) is required",
      statusCode: 401,
      code: "MISSING_USER_ID"
    });
  }

  const cart = await getCart.execute(userId);
  if (!cart) {
    const emptyCart = await repo.getOrCreateCart(userId);
    const enriched = await enrichCartWithPricing(emptyCart);
    return res.json({ cart: enriched });
  }

  const enriched = await enrichCartWithPricing(cart);
  res.json({ cart: enriched });
}

export async function addItemHandler(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    throw new AppError({
      message: "User ID header (x-user-id) is required",
      statusCode: 401,
      code: "MISSING_USER_ID"
    });
  }

  const cart = await addItemToCart.execute(userId, req.body);
  const enriched = await enrichCartWithPricing(cart);
  res.status(201).json({ cart: enriched });
}

export async function removeItemHandler(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    throw new AppError({
      message: "User ID header (x-user-id) is required",
      statusCode: 401,
      code: "MISSING_USER_ID"
    });
  }

  const cart = await removeItemFromCart.execute(userId, req.params.productId);
  const enriched = await enrichCartWithPricing(cart);
  res.json({ cart: enriched });
}

export async function updateItemHandler(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    throw new AppError({
      message: "User ID header (x-user-id) is required",
      statusCode: 401,
      code: "MISSING_USER_ID"
    });
  }

  const cart = await updateCartItem.execute(userId, req.params.productId, req.body);
  const enriched = await enrichCartWithPricing(cart);
  res.json({ cart: enriched });
}

export async function clearCartHandler(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    throw new AppError({
      message: "User ID header (x-user-id) is required",
      statusCode: 401,
      code: "MISSING_USER_ID"
    });
  }

  await clearCart.execute(userId);
  res.status(204).send();
}
