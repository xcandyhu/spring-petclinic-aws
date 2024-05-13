import * as cdk from '@aws-cdk/core';
import { EcsStack } from '../lib/ecs-stack';

const app = new cdk.App();
new EcsStack(app, 'EcsStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION, // Ensure these are set in Jenkins or the environment
    account: process.env.CDK_DEFAULT_ACCOUNT
  },
  imageTag: app.node.tryGetContext('imageTag'),
  ecrRepo: app.node.tryGetContext('ecrRepo'),
  containerPort: parseInt(app.node.tryGetContext('containerPort')),
});