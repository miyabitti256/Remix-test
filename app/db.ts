import { createContextKey, type Middleware } from 'remix/router'

import { createAuth } from './auth.ts'
import type { WorkerEnv } from './env.ts'

export type AppAuth = ReturnType<typeof createAuth>

export const d1BindingKey = createContextKey<D1Database>()
export const userIdKey = createContextKey<string | null>()

type RequestBindings = readonly [
  { key: typeof d1BindingKey; value: D1Database },
  { key: typeof userIdKey; value: string | null },
]

export function bindRequestContext(env: WorkerEnv, auth: AppAuth): Middleware<RequestBindings> {
  return async (context, next) => {
    const session = await auth.api.getSession({ headers: context.request.headers })

    context.set(d1BindingKey, env.DB)
    context.set(userIdKey, session?.user.id ?? null)

    return next()
  }
}
