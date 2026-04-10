import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../../../config/env";
import { AppError } from "../../../shared/errors/app-error";

function extractBearerToken(req: Request): string | null {
  const header = req.header("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer") return null;
  return token ?? null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    return next(new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Missing bearer token" }));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload | string;
    if (typeof decoded === "string") {
      return next(new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Invalid token" }));
    }

    const sub = decoded.sub;
    const email = typeof decoded.email === "string" ? decoded.email : undefined;

    if (typeof sub !== "string" || !sub) {
      return next(new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Invalid token" }));
    }

    req.user = { id: sub, email };
    return next();
  } catch (e: any) {
    const code = e?.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
    const message = e?.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return next(new AppError({ statusCode: 401, code, message }));
  }
}

