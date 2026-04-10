import type { UserRepository, CreateUserInput } from "../../application/ports/user-repository";
import type { User } from "../../domain/user";
import { prisma } from "../db/prisma";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    return row;
  }

  async create(input: CreateUserInput): Promise<User> {
    const row = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.password
      }
    });
    return row;
  }
}

