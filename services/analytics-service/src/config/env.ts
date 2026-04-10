/**
 * Analytics Service - Environment Configuration
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(4006),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  RABBITMQ_URL: z.string().url().default('amqp://localhost'),
  MONGODB_URI: z.string().url(),
  PRODUCT_SERVICE_URL: z.string().url(),
  CART_SERVICE_URL: z.string().url(),
  ORDER_SERVICE_URL: z.string().url(),
  PAYMENT_SERVICE_URL: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

function validate(): Env {
  const config = envSchema.safeParse(process.env);

  if (!config.success) {
    console.error('❌ Invalid environment variables:', config.error.flatten());
    process.exit(1);
  }

  return config.data;
}

export const env = validate();
