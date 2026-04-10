import { getPrisma } from "../db/prisma";
import type { Order, OrderStatus } from "../../domain/order";
import type { OrderRepository, CreateOrderInput, UpdateOrderStatusInput } from "../../application/ports/order-repository";
import { AppError } from "../../shared/errors/app-error";

export class PrismaOrderRepository implements OrderRepository {
  async create(input: CreateOrderInput): Promise<Order> {
    const prisma = getPrisma();

    const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: input.userId,
        status: "PENDING",
        total,
        items: {
          createMany: {
            data: input.items.map((item) => ({
              userId: input.userId,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity
            }))
          }
        }
      },
      include: {
        items: true
      }
    });

    return this.toDomain(order);
  }

  async getById(id: string): Promise<Order | null> {
    const prisma = getPrisma();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    return order ? this.toDomain(order) : null;
  }

  async getByUserId(userId: string): Promise<Order[]> {
    const prisma = getPrisma();

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: { createdAt: "desc" }
    });

    return orders.map((order) => this.toDomain(order));
  }

  async updateStatus(orderId: string, input: UpdateOrderStatusInput): Promise<Order> {
    const prisma = getPrisma();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      throw new AppError({
        message: `Order ${orderId} not found`,
        statusCode: 404,
        code: "ORDER_NOT_FOUND"
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: input.status },
      include: {
        items: true
      }
    });

    return this.toDomain(updated);
  }

  async listAll(limit: number, offset: number): Promise<{ orders: Order[]; total: number }> {
    const prisma = getPrisma();

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: true
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset
      }),
      prisma.order.count()
    ]);

    return {
      orders: orders.map((order) => this.toDomain(order)),
      total
    };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private toDomain(
    order: any
  ): Order {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status as OrderStatus,
      items: order.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
}
