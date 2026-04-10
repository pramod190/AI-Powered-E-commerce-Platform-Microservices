import { Router } from "express";
import { healthRouter } from "./health.routes";
import { productRouter } from "./product.routes";

export const apiRouter = Router();
apiRouter.use(healthRouter);
apiRouter.use(productRouter);

