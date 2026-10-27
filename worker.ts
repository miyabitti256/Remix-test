import { createAppRouter } from './app/router.ts'
import type { WorkerEnv } from './app/db.ts'

const worker = {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    try {
      return await createAppRouter(env).fetch(request)
    } catch (error) {
      console.error('Request failed:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
}

export default worker satisfies ExportedHandler<WorkerEnv>
