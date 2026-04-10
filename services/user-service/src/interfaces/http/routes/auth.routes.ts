import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler";
import { validate } from "../middleware/validate";
import * as authController from "../controllers/auth.controller";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200)
});

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200)
});

authRouter.post("/auth/register", validate({ body: registerSchema }), asyncHandler(authController.register));
authRouter.post("/auth/login", validate({ body: loginSchema }), asyncHandler(authController.login));

