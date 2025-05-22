import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { appendTrailingSlash } from 'hono/trailing-slash'
import { userModule } from './user/user.module'

export const bootstrap = () => {
  const app = new Hono()
  app
    .basePath('/api')
    .use(prettyJSON())
    .use(appendTrailingSlash())
    .get('/', (c) => {
      return c.json(
        {
          message: 'Hello from pollito!',
          name: 'Manguito Lovebird',
        },
        200
      )
    })
    .route('/user/', userModule.setRoute())
  return app
}
