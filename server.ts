import * as http from 'node:http'
import { createRequestListener } from 'remix/node-fetch-server'

import { router } from './app/router.ts'

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000
const server = http.createServer(createRequestListener(router.fetch))

server.listen(port, () => {
  console.log(`Remix-test is running at http://localhost:${port}`)
})

function shutdown() {
  server.close(() => process.exit(0))
  server.closeAllConnections()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
