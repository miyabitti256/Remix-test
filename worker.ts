import { createAuth } from './app/auth.ts'
import { createAppRouter } from './app/router.ts'
import type { WorkerEnv } from './app/env.ts'

const worker = {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    try {
      const auth = createAuth(env, request)
      const pathname = new URL(request.url).pathname

      if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
        return auth.handler(request)
      }

      return await createAppRouter(env, auth).fetch(request)
    } catch (error) {
      console.error('Request failed:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
}

export default worker satisfies ExportedHandler<WorkerEnv>
