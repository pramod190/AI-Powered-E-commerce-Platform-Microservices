import type { Request, Response } from "express";
import { PrismaOrderRepository } from "../../../infrastructure/repositories/prisma-order-repository";
import { CreateOrder } from "../../../application/use-cases/create-order";
import { GetOrder } from "../../../application/use-cases/get-order";
import { GetUserOrders } from "../../../application/use-cases/get-user-orders";
import { UpdateOrderStatus } from "../../../application/use-cases/update-order-status";
import { cartServiceClient } from "../../../infrastructure/http-client/cart-service";
import { productServiceClient } from "../../../infrastructure/http-client/product-service";
import { AppError } from "../../../shared/errors/app-error";
import type { OrderStatus } from "../../../domain/order";

const repo = new PrismaOrderRepository();

const createOrder = new CreateOrder(repo);
const getOrder = new GetOrder(repo);
const getUserOrders = new GetUserOrders(repo);
const updateOrderStatus = new UpdateOrderStatus(repo);

export async function createOrderHandler(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    throw new AppError({
      message: "User ID header (x-user-id) is required",
      statusCode: 401,
      code: "MISSING_USER_ID"
    });
  }

  // Fetch cart from Cart Service
  const cart = await cartServiceClient.getCart(userId);

  if (!cart.items || cart.items.length === 0) {
    throw new AppError({
      message: "Cart is empty",
      statusCode: 400,
      code: "EMPTY_CART"
    });
  }

  // Create order with cart items
  const order = await createOrder.execute({
    userId,
    items: cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price
    }))
  });

  // Clear cart after order creation
  await cartServiceClient.clearCart(userId);

  res.status(201).json({ order });
}

export async function getOrderHandler(req: Request, res: Response) {
  const order = await getOrder.execute(req.params.id);

  if (!order) {
    throw new AppError({
      message: "Order not found",
      statusCode: 404,
      code: "ORDER_NOT_FOUND"
    });
  }

  res.json({ order });
}

export async function getUserOrdersHandler(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    throw new AppError({
      message: "User ID header (x-user-id) is required",
      statusCode: 401,
      code: "MISSING_USER_ID"
    });
  }

  const orders = await getUserOrders.execute(userId);
  res.json({ orders });
}

export async function updateOrderStatusHandler(req: Request, res: Response) {
  const order = await updateOrderStatus.execute(req.params.id, req.body);
  res.json({ order });
}
