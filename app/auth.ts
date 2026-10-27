import { betterAuth } from 'better-auth'

import type { WorkerEnv } from './env.ts'

export function createAuth(env: WorkerEnv, request: Request) {
  const baseURL = env.BETTER_AUTH_URL || new URL(request.url).origin

  return betterAuth({
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET,
    baseURL,
    trustedOrigins: [baseURL],
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
  })
}
