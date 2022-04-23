import { CfnOutput, Duration, RemovalPolicy, Size, Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, FunctionUrl, FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class UrlToPdfLambdaStack extends Stack {
    private renderFunction: Function;
    private functionUrl: FunctionUrl;
    private tempBucket: Bucket;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        this.tempBucket = this.createBucket();
        this.renderFunction = this.createRenderFunction(this.tempBucket);
        this.functionUrl = this.createFunctionUrl(this.renderFunction);

        this.outputs();
    }

    createRenderFunction(bucket: Bucket): Function {
        const assetPath = path.join(__dirname, '/../../../lambda');
        const func = new Function(this, 'renderFunction', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset(assetPath),
            handler: 'index.handler',
            memorySize: 10240,
            ephemeralStorageSize: Size.gibibytes(1),
            timeout: Duration.minutes(1),
            environment: {
                TEMP_BUCKET_NAME: bucket.bucketName,
            }
        });

        bucket.grantReadWrite(func);

        return func;
    }

    createFunctionUrl(func: Function): FunctionUrl {
        const functUrl = func.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
        });

        return functUrl;
    }

    createBucket(): Bucket {
        const bucket = new Bucket(this, 'TempBucket', {
            lifecycleRules: [
                {
                    expiration: Duration.days(1),
                }
            ],
            removalPolicy: RemovalPolicy.DESTROY,
        });
        return bucket;
    }

    outputs() {
        return [
            new CfnOutput(this, 'FunctionArn', { value: this.renderFunction.functionArn }),
            new CfnOutput(this, 'FunctionUrl', { value: this.functionUrl.url }),
            new CfnOutput(this, 'BucketName', { value: this.tempBucket.bucketName }),
        ];
    }
}
