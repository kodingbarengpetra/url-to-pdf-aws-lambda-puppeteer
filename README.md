# url-to-pdf-aws-lambda-puppeteer

Generate PDF from URL using AWS Lambda, Function URL, and Puppeteer

## Requirements

- CDK >= 2.20.0
- NPM

## Deploying

To deploy the infrastructure follow this steps.

1. From root to the Lambda directory and install node packages
   
   ```
   cd lambda
   npm i
   ```

2. From root directory go to the CDK directory and install node packages.

   ```
   cd deployments/cdk
   npm i
   ```

3. Bootstrap the CDK

   ```
   cdk bootstrap
   ```

4. Deploy the CDK

   ```
   cdk deploy
   ```

5. The CDK will output something like

   ```
    UrlToPdfLambdaStack.BucketName = urltopdflambdastack-tempbucke1234567
    UrlToPdfLambdaStack.FunctionArn = arn:aws:lambda:ap-southeast-1:123456787901:function:UrlToPdfLambdaStack-1234567-1234567
    UrlToPdfLambdaStack.FunctionUrl = https://1234567.lambda-url.ap-southeast-1.on.aws/
   ```

   The function URL is the URL you want to use.

## Usage

By using the function URL you can get PDF by executing query param `url`, e.g.

```
curl --output file.pdf "https://1234567.lambda-url.ap-southeast-1.on.aws/?url=https://www.example.com"
```

you can also use query param `return=url` to get the signed URL instead.

```
curl --output file.pdf "https://1234567.lambda-url.ap-southeast-1.on.aws/?url=https://www.example.com&return=url"
```

The output will be something like

```
{
    "url": "https:\/\/blablablabla"
}
```

## References

- Running Puppeteer on AWS Lambda
  https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-aws-lambda
- chrome-aws-lambda
  https://github.com/alixaxel/chrome-aws-lambda
- Puppeteer HTML to PDF Generation with Node.js
  https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/