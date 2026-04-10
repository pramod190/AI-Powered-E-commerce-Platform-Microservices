import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodSchema } from "zod";

type Schema = {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
  headers?: ZodSchema;
};

export function validate(schema: Schema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schema.params) req.params = schema.params.parse(req.params);
    if (schema.query) req.query = schema.query.parse(req.query);
    if (schema.headers) schema.headers.parse(req.headers);
    if (schema.body) req.body = schema.body.parse(req.body);
    next();
  };
}

