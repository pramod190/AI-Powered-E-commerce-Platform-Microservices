import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { asyncHandler } from "../utils/async-handler";

export const meRouter = Router();

// Example protected route
meRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

