import { bootstrap } from '../src/index'
import { handle } from 'hono/vercel'

const app = bootstrap()

export const config = {
  runtime: 'edge',
}

export default handle(app)
