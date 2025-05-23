import { handle } from 'hono/aws-lambda'
import { bootstrap } from './index'

const app = bootstrap()
export const handler = handle(app)
