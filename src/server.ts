import { serve } from '@hono/node-server'
import { bootstrap } from './index'

const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV !== 'production') {
  serve(
    {
      fetch: bootstrap().fetch,
      port: 8000,
    },
    (info) => console.info(`Listening on http://localhost:${info.port}`)
  )
}
