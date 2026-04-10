import { Router } from "express";
import { healthRouter } from "./health.routes";
import { orderRouter } from "./index";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(orderRouter);
