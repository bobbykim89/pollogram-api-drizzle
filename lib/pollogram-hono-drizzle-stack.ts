import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime, Alias } from 'aws-cdk-lib/aws-lambda'
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'

export class PollogramHonoDrizzleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const stage: string = process.env.STAGE || 'prod' // default 'prod'
    const pollogramApiFn = new NodejsFunction(this, 'PollogramHonoDrizzle', {
      runtime: Runtime.NODEJS_22_X,
      entry: 'src/handler.ts',
      handler: 'handler',
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL || '',
      },
      timeout: cdk.Duration.seconds(10),
      bundling: {
        nodeModules: [],
        minify: true,
        forceDockerBundling: false,
      },
    })
    const alias = new Alias(this, 'PollogramHonoDrizzleApiAlias', {
      aliasName: 'pollogram-hono-drizzle-live',
      version: pollogramApiFn.currentVersion,
    })

    new LambdaRestApi(this, 'PollogramHonoDrizzleApiGateway', {
      handler: alias,
      proxy: true,
      deployOptions: {
        stageName: stage,
        cachingEnabled: true,
        cacheTtl: cdk.Duration.minutes(5),
      },
    })
  }
}
