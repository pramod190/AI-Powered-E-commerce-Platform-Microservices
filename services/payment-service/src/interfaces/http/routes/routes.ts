import { Router } from "express";
import { healthRouter } from "./health.routes";
import { paymentRouter } from "./index";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(paymentRouter);
