import { CfnOutput, Duration, Size, Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, FunctionUrl, FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class UrlToPdfLambdaStack extends Stack {
    private renderFunction: Function;
    private functionUrl: FunctionUrl;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        this.renderFunction = this.createRenderFunction();
        this.functionUrl = this.createFunctionUrl(this.renderFunction);

        this.outputs();
    }

    createRenderFunction(): Function {
        const assetPath = path.join(__dirname, '/../../../lambda');
        const func = new Function(this, 'renderFunction', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset(assetPath),
            handler: 'index.handler',
            memorySize: 10240,
            ephemeralStorageSize: Size.gibibytes(1),
            timeout: Duration.minutes(1),
        });

        return func;
    }

    createFunctionUrl(func: Function): FunctionUrl {
        const functUrl = func.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
        });

        return functUrl;
    }

    outputs() {
        return [
            new CfnOutput(this, 'FunctionArn', { value: this.renderFunction.functionArn }),
            new CfnOutput(this, 'FunctionUrl', { value: this.functionUrl.url }),
        ];
    }
}
