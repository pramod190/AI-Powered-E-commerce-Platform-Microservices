import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.header("x-request-id") ?? randomUUID();
    (req as any).id = id;
    res.setHeader("x-request-id", id);
    next();
  };
}

