import type { User } from "../../domain/user";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string; // hashed
};

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}

