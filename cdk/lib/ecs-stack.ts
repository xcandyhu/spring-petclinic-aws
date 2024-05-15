import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

interface EcsStackProps extends cdk.StackProps {
  readonly imageTag: string;
  readonly ecrRepo: string;
  readonly containerPort: number;
}

class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { isDefault: true });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    // Add EC2 capacity to the cluster
    cluster.addCapacity('DefaultAutoScalingGroupCapacity', {
      instanceType: new ec2.InstanceType('t2.micro'),
      desiredCapacity: 1,
      minCapacity: 1,
      maxCapacity: 1
    });

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef', {
      networkMode: ecs.NetworkMode.AWS_VPC,
    });
    const container = taskDefinition.addContainer('clinic', {
      image: ecs.ContainerImage.fromRegistry(`public.ecr.aws/a4b5x1e9/${props.ecrRepo}:${props.imageTag}`),
      memoryLimitMiB: 512,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'ecsclinic' })
    });

    container.addPortMappings({
      containerPort: props.containerPort,
      protocol: ecs.Protocol.TCP,
    });

    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Allow inbound HTTP traffic',
    });
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    const serviceSecurityGroup = new ec2.SecurityGroup(this, 'ServiceSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Allow inbound traffic from ALB',
    });
    serviceSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(props.containerPort));

    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', { vpc, internetFacing: true });
    const listener = alb.addListener('listener', { port: 80 });

    const ecsService = new ecs.Ec2Service(this, 'ClinicService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      securityGroups: [serviceSecurityGroup],
    });

    listener.addTargets('ECS', {
      port: 80,
      targets: [ecsService],
    });

    new cdk.CfnOutput(this, 'ALBDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'The DNS name of the Application Load Balancer',
    });
  }
}

export { EcsStack };
