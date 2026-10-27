import { createRouter } from 'remix/router'

import { bindRequestContext, type AppAuth } from './db.ts'
import type { WorkerEnv } from './env.ts'
import controller from './actions/controller.ts'
import { routes } from './routes.ts'

export function createAppRouter(env: WorkerEnv, auth: AppAuth) {
  const router = createRouter({
    middleware: [bindRequestContext(env, auth)],
  })

  router.map(routes, controller)
  return router
}
