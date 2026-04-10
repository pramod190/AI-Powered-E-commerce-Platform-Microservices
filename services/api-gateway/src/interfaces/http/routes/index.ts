import { Router } from "express";
import { healthRouter } from "./health.routes";
import { proxyRouter } from "./proxy.routes";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(proxyRouter);

