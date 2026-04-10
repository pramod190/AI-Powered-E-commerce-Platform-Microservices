import type { Request, Response } from "express";
import { env } from "../../../config/env";
import { PrismaUserRepository } from "../../../infrastructure/repositories/prisma-user-repository";
import { LoginUser } from "../../../application/use-cases/login-user";
import { RegisterUser } from "../../../application/use-cases/register-user";
import { PasswordService } from "../../../application/services/password-service";
import { TokenService } from "../../../application/services/token-service";

const userRepo = new PrismaUserRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();

const registerUser = new RegisterUser(userRepo, passwordService);
const loginUser = new LoginUser(userRepo, passwordService, tokenService);

export async function register(req: Request, res: Response) {
  const result = await registerUser.execute({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    saltRounds: env.BCRYPT_SALT_ROUNDS
  });

  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await loginUser.execute({
    email: req.body.email,
    password: req.body.password,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN
  });

  res.status(200).json(result);
}

