import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { UseConfig } from '../lib'
import * as schema from './schema'

// export const getDbClient = async () => {
//   const dbUrl = process.env.DATABASE_URL
//   neonConfig.fetchConnectionCache = true
//   const sql = neon(dbUrl!)
//   const db = drizzle({ client: sql })
//   return db
// }

export class DbClient {
  private config: UseConfig
  private db: NeonHttpDatabase<typeof schema> | null = null
  constructor() {
    this.config = new UseConfig()
  }
  public getInstance(): NeonHttpDatabase<typeof schema> {
    if (!this.db) {
      const sql = neon(this.config.databaseUrl)
      this.db = drizzle({ client: sql, schema })
    }
    return this.db
  }
}
