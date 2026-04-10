import { AppError } from "../../shared/errors/app-error";
import type { UserRepository } from "../ports/user-repository";
import { PasswordService } from "../services/password-service";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
  saltRounds: number;
};

export type RegisterUserResult = {
  user: { id: string; name: string; email: string; createdAt: Date };
};

export class RegisterUser {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserResult> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError({
        statusCode: 409,
        code: "EMAIL_ALREADY_EXISTS",
        message: "Email already registered"
      });
    }

    const hashed = await this.passwordService.hash(input.password, input.saltRounds);
    const created = await this.userRepo.create({
      name: input.name,
      email: input.email,
      password: hashed
    });

    return {
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        createdAt: created.createdAt
      }
    };
  }
}

