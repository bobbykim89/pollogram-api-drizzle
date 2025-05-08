import { handle } from 'hono/vercel'
// import { handle } from '@hono/node-server/vercel'
import { bootstrap } from './index'

const app = bootstrap()

const handler = handle(app)

// export default handle(app)
export const GET = handler
export const POST = handler
export const PATCH = handler
export const PUT = handler
export const DELETE = handler
export const OPTIONS = handler
