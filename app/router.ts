import { createRouter } from 'remix/router'

import { bindRequestContext, type WorkerEnv } from './db.ts'
import controller from './actions/controller.ts'
import { routes } from './routes.ts'

export function createAppRouter(env: WorkerEnv) {
  const router = createRouter({
    middleware: [bindRequestContext(env)],
  })

  router.map(routes, controller)
  return router
}
