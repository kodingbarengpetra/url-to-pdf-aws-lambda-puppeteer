# url-to-pdf-aws-lambda-puppeteer

Generate PDF from URL using AWS Lambda, Function URL, and Puppeteer

## Requirements

- CDK >= 2.20.0

## Deploying

To deploy the infrastructure follow this steps.

1. Go to the CDK directory

   ```
   cd deployments/cdk
   ```

2. Bootstrap the CDK

   ```
   cdk bootstrap
   ```

3. Deploy the CDK

   ```
   cdk deploy
   ```

## References

- Running Puppeteer on AWS Lambda
  https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-aws-lambda
- chrome-aws-lambda
  https://github.com/alixaxel/chrome-aws-lambda
- Puppeteer HTML to PDF Generation with Node.js
  https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/