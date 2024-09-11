import "dotenv/config";
import { z } from "zod";

interface EnvVars {
  PORT?: number;
  PRODUCT_MICROSERVICE_HOST?: string;
  PRODUCT_MICROSERVICE_PORT?: string;
}

const envSchema = z.object({
  PORT: z.preprocess(
    (p: string) => Number(p),
    z.number({ required_error: "Environment Variable PORT is required" })
  ),
  PRODUCT_MICROSERVICE_HOST: z.string(),
  PRODUCT_MICROSERVICE_PORT: z.string(),
});

const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
  const envar = error.issues[0].path;
  throw new Error(
    `Config validation Error: ${envar}:${error.issues[0].message}`
  );
}

//extract typing
const envVars: EnvVars = data;

export const envs = {
  port: envVars.PORT,
  productMsHost: envVars.PRODUCT_MICROSERVICE_HOST,
  productMsPort: envVars.PRODUCT_MICROSERVICE_PORT,
};
