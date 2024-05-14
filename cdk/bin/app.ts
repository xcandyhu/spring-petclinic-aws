import * as cdk from '@aws-cdk/core';
import { EcsStack } from '../lib/ecs-stack';

const app = new cdk.App();
new EcsStack(app, 'EcsStack', {
  imageTag: app.node.tryGetContext('imageTag'),
  ecrRepo: app.node.tryGetContext('ecrRepo'),
  containerPort: parseInt(app.node.tryGetContext('containerPort')),
  stackName: app.node.tryGetContext('stackName')
});