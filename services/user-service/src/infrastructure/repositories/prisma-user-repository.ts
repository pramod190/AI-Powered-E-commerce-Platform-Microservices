import type { UserRepository, CreateUserInput } from "../../application/ports/user-repository";
import type { User } from "../../domain/user";
import { prisma } from "../db/prisma";

function toUser(row: { id: string; name: string | null; email: string; password: string; createdAt: Date }): User {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    password: row.password,
    createdAt: row.createdAt,
  };
}

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    return row ? toUser(row) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const row = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
      },
    });
    return toUser(row);
  }
}
