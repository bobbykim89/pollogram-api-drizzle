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
        DATABASE_URL: process.env.DATABASE_URL!,
        ADMIN_SECRET_PHRASE: process.env.ADMIN_SECRET_PHRASE!,
        JWT_SECRET: process.env.JWT_SECRET!,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
        CLOUDINARY_TARGET_FOLDER: process.env.CLOUDINARY_TARGET_FOLDER!,
      },
      timeout: cdk.Duration.seconds(10),
      bundling: {
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
      binaryMediaTypes: ['multipart/form-data', '*/*'],
      deployOptions: {
        stageName: stage,
        cachingEnabled: true,
        cacheTtl: cdk.Duration.minutes(5),
      },
    })
  }
}
