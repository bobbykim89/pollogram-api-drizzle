import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'

export const getDbClient = async () => {
  const dbUrl = process.env.DATABASE_URL
  neonConfig.fetchConnectionCache = true
  const sql = neon(dbUrl!)
  const db = drizzle({ client: sql })
  return db
}

export class DbClient {
  private dbUrl: string
  private db: NeonHttpDatabase | null = null
  constructor() {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is not defined')
    }
    this.dbUrl = url
    neonConfig.fetchConnectionCache = true
  }
  public getInstance(): NeonHttpDatabase {
    if (!this.db) {
      const sql = neon(this.dbUrl)
      this.db = drizzle({ client: sql })
    }
    return this.db
  }
}
