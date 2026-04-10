import Stripe from "stripe";
import { env } from "../../config/env";
import { logger } from "../../shared/logger";

let stripeClient: Stripe;

export function initStripe(): Stripe {
  stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
  });

  logger.info("Stripe client initialized");
  return stripeClient;
}

export function getStripe(): Stripe {
  return stripeClient;
}
