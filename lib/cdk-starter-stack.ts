import * as cdk from 'aws-cdk-lib';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'OurBucket', {
      /**
       * The following properties ensure the bucket is properly 
       * deleted when we run cdk destroy */
      bucketName:"transformed-json-bucket",
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const lambdaFunction = new NodejsFunction(this, 'PrepJsonLambda', {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_16_X,
      functionName:"PrepJsonLambda",
      handler: 'handler',
      entry: path.join(__dirname, `/../src/services/index.ts`),
      bundling: {
        minify: false,
        externalModules: ['aws-sdk'],
      }
    });
    const s3PutEventSource = new lambdaEventSources.S3EventSource(bucket, {
      events: [
        s3.EventType.OBJECT_CREATED_PUT
      ]
    });
    lambdaFunction.addEventSource(s3PutEventSource);


    const table = new dynamodb.Table(this, id, {
      tableName:"env-table",
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {name: 'Environment', type: dynamodb.AttributeType.STRING},
      sortKey: {name: 'Ivr Flow', type: dynamodb.AttributeType.STRING},
      pointInTimeRecovery: false,
    });
    table.grantReadData(lambdaFunction);
  }
}
