import { handle } from 'hono/vercel'
import { bootstrap } from './index'

const app = bootstrap()
export default handle(app)
