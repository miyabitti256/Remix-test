import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./app/db/schema.ts', './app/db/auth-schema.ts'],
  out: './drizzle',
  dialect: 'sqlite',
  // Drizzle Kit uses this only for direct SQLite operations; runtime access uses the D1 binding.
  dbCredentials: { url: './local.db' },
})
