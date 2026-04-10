import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  SERVICE_NAME: z.string().default("order-service"),
  PORT: z.coerce.number().default(4004),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  CORS_ORIGINS: z
    .string()
    .transform((v) => v.split(",").map((s) => s.trim()))
    .default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PRODUCT_SERVICE_URL: z.string().default("http://localhost:4002"),
  CART_SERVICE_URL: z.string().default("http://localhost:4003"),
  PAYMENT_SERVICE_URL: z.string().default("http://localhost:4005")
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  process.exit(1);
}

export const env: Env = parsed.data;
