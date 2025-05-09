import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

export const bootstrap = () => {
  const app = new Hono()
  app
    .basePath('/api')
    .use(prettyJSON())
    .get('/', (c) => {
      return c.json(
        {
          message: 'Hello from pollito!',
          name: 'Manguito Lovebird',
        },
        200
      )
    })
  return app
}
