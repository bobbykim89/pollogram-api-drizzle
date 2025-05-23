import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { PollogramHonoDrizzleStack } from './pollogram-hono-drizzle-stack'

export class PollogramHonoDrizzleAppStages extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props)

    new PollogramHonoDrizzleStack(this, 'PollogramHonoDrizzleStack')
  }
}
