# CSP Report Handler

![log-report-lamdba build](https://github.com/cpilsworth/csp-report-handler/workflows/Node.js%20CI/badge.svg)

This project provides a api endpoint to recieve the Content Security Policy (CSP) violation reports sent by browsers.

An AWS HTTP API Gateway is created in your own account using a [SAM](https://docs.aws.amazon.com/serverless-application-model/) template.  The API receives the [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) [violation reports](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#Sample_violation_report) sent automatically by the browser to the [report-uri](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#Enabling_reporting) endpoint referenced in the CSP header.  

When the report is received, it is validated against a [schema](log-report/schema.json), the json is logged in a CloudWatch Logs group that is retained for 7 days (by default).

- [log-report](log-report) - Lambda handler that validates payload and sends the event to CloudWatch Logs.
- [events](events) - Invocation events that you can use to invoke the function.
- [log-report/tests](log-report/tests/unit) - Unit tests for the application code. 
- [template.yaml](template.yaml) - A template that defines the application's AWS resources.

The application uses several AWS resources, including Lambda functions and an API Gateway API. These resources are defined in the `template.yaml` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

## Pricing
This template costs nothing, but you'll pay for the resources used.  At the time of writing [HTTP API calls pricing](https://aws.amazon.com/api-gateway/pricing/#HTTP_APIs) is $1 per million for the first 300 million requests. $0.9 for each million after that.  

Report events are stored in CloudWatch Logs, which has 5Gb of ingestion/storage in the free tier.  Further details of [pricing here](https://aws.amazon.com/cloudwatch/pricing/). 

## Deploy the CSP Report Handler

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 10](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.
* **AWS Region**: The AWS region you want to deploy your app to.
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
* **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modified IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
* **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

You can find your API Gateway Endpoint URL in the output values displayed after deployment.

## Use the SAM CLI to build and test locally

Build your application with the `sam build` command.

```bash
csp-report-collector$ sam build
```

The SAM CLI installs dependencies defined in `log-report/package.json`, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
csp-report-collector$ sam local invoke LogReportFunction --event events/event.json --env-vars env.json
```

The SAM CLI can also emulate your application's API. Use the `sam local start-api` to run the API locally on port 3000.

```bash
csp-report-collector$ sam local start-api
csp-report-collector$ curl http://localhost:3000/
```

The SAM CLI reads the application template to determine the API's routes and the functions that they invoke. The `Events` property on each function's definition includes the route and method for each path.

```yaml
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs generated by your deployed Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

`NOTE`: This command works for all AWS Lambda functions; not just the ones you deploy using SAM.

```bash
csp-report-collector$ sam logs -n LogReportFunction --stack-name csp-report-collector --tail
```

You can find more information and examples about filtering Lambda function logs in the [SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `log-report/tests` folder in this project. Use NPM to install the [Mocha test framework](https://mochajs.org/) and run unit tests.

```bash
csp-report-collector$ cd log-report
log-report$ npm install
log-report$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name csp-report-collector
```

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)
