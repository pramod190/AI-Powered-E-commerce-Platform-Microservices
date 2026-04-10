import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function requestId(): (req: Request, _res: Response, next: NextFunction) => void {
  return (req: Request, _res: Response, next: NextFunction) => {
    (req as any).id = req.headers["x-request-id"] || crypto.randomUUID();
    next();
  };
}
