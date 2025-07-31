import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/lib/drizzle/drizzle.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'xka_user',
    password: process.env.POSTGRES_PASSWORD || 'xka_password',
    database: process.env.POSTGRES_DB || 'xka',
  },
})