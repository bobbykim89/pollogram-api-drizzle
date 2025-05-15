import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

export const getDbClient = async () => {
  const dbUrl = process.env.DATABASE_URL
  neonConfig.fetchConnectionCache = true
  const sql = neon(dbUrl!)
  const db = drizzle({ client: sql })
  return db
}
