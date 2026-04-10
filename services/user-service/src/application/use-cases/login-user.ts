import { AppError } from "../../shared/errors/app-error";
import type { UserRepository } from "../ports/user-repository";
import { PasswordService } from "../services/password-service";
import { TokenService } from "../services/token-service";
import type { SignOptions } from "jsonwebtoken";

export type LoginUserInput = {
  email: string;
  password: string;
  jwtSecret: string;
  jwtExpiresIn: NonNullable<SignOptions["expiresIn"]>;
};

export type LoginUserResult = {
  accessToken: string;
  user: { id: string; name: string; email: string; createdAt: Date };
};

export class LoginUser {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserResult> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError({ statusCode: 401, code: "INVALID_CREDENTIALS", message: "Invalid credentials" });
    }

    const ok = await this.passwordService.verify(input.password, user.password);
    if (!ok) {
      throw new AppError({ statusCode: 401, code: "INVALID_CREDENTIALS", message: "Invalid credentials" });
    }

    const accessToken = this.tokenService.signAccessToken({
      secret: input.jwtSecret,
      expiresIn: input.jwtExpiresIn,
      user: { id: user.id, email: user.email }
    });

    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
    };
  }
}

