// Validates required env vars at startup — fails fast before any request
const required = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'DATABASE_URL'] as const;

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`);
}

export const config = Object.freeze({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN,
  db: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET!,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  },
});
