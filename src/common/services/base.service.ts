import { UseConfig } from '../../lib'
import { DbClient } from '../../db/clients'
import * as schema from '../../db/schema'
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http'

export class BaseService {
  config: UseConfig
  schema: typeof schema
  client: NeonHttpDatabase<typeof schema>
  constructor() {
    this.config = new UseConfig()
    this.schema = schema
    const dbClient = new DbClient()
    this.client = dbClient.getInstance()
  }
}
