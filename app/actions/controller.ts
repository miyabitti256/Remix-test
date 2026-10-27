import { createController } from 'remix/router'

import { routes } from '../routes.ts'
import { renderHomePage } from './home.ts'

export default createController(routes, {
  actions: {
    home() {
      return renderHomePage()
    },
    health() {
      return Response.json({ status: 'ok' })
    },
  },
})
