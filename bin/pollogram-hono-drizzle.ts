#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { PollogramHonoDrizzleAppStages } from '../lib/pollogram-hono-drizzle-stages'

const app = new cdk.App()

new PollogramHonoDrizzleAppStages(app, 'Prod', {
  env: {
    region: 'us-east-2',
  },
})

new PollogramHonoDrizzleAppStages(app, 'Dev', {
  env: {
    region: 'us-east-2',
  },
})
