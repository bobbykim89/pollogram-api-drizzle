// import { handle } from 'hono/vercel'
import { handle } from '@hono/node-server/vercel'
import { bootstrap } from './index'

const app = bootstrap()
export default handle(app)
