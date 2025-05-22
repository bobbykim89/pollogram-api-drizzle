import { drizzle } from 'drizzle-orm/neon-serverless'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import * as schema from './schema'
import { UseConfig } from '../lib'

class Migrator {
  private config: UseConfig
  constructor() {
    this.config = new UseConfig()
  }
  public migrate = async () => {
    neonConfig.webSocketConstructor = ws
    const pool = new Pool({ connectionString: this.config.databaseUrl })
    pool.on('error', (err: any) => console.error(err))

    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      const db = await drizzle(client, { schema })
      await migrate(db, { migrationsFolder: 'src/migrations' })
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
    } finally {
      client.release()
    }
    await pool.end()
  }
}

const init = () => {
  const migrator = new Migrator()
  console.log('-- Initialize migration')
  migrator
    .migrate()
    .then((val) => {
      console.log('-- Migration completed')
      process.exit(0)
    })
    .catch((err) => {
      console.log('-- Migration error')
      process.exit(1)
    })
}

init()
