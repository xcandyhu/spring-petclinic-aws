import * as cdk from 'aws-cdk-lib';
import { EcsStack } from '../lib/ecs-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new EcsStack(app, 'EcsStack', {
  env: env,
  imageTag: app.node.tryGetContext('imageTag'),
  ecrRepo: app.node.tryGetContext('ecrRepo'),
  stackName: app.node.tryGetContext('stackName')
});
