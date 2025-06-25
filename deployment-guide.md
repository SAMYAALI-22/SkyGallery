# Serverless Contact Form Deployment Guide

This guide will help you deploy the serverless contact form using AWS Lambda, API Gateway, and DynamoDB.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Basic understanding of AWS services

## Deployment Options

### Option 1: Using AWS CloudFormation (Recommended)

1. **Deploy the CloudFormation Stack**
   ```bash
   aws cloudformation create-stack \
     --stack-name serverless-contact-form \
     --template-body file://aws-infrastructure/cloudformation-template.yaml \
     --capabilities CAPABILITY_NAMED_IAM \
     --parameters ParameterKey=ProjectName,ParameterValue=my-contact-form \
                  ParameterKey=Environment,ParameterValue=prod
   ```

2. **Wait for Stack Creation**
   ```bash
   aws cloudformation wait stack-create-complete \
     --stack-name serverless-contact-form
   ```

3. **Get the API Endpoint**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name serverless-contact-form \
     --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
     --output text
   ```

### Option 2: Manual Setup

#### Step 1: Create DynamoDB Table

```bash
aws dynamodb create-table \
  --table-name ContactFormSubmissions \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    IndexName=TimestampIndex,KeySchema=[{AttributeName=timestamp,KeyType=HASH}],Projection={ProjectionType=ALL} \
    IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL}
```

#### Step 2: Create IAM Role for Lambda

1. Create trust policy file (`trust-policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

2. Create the role:
```bash
aws iam create-role \
  --role-name ContactFormLambdaRole \
  --assume-role-policy-document file://trust-policy.json
```

3. Attach basic execution policy:
```bash
aws iam attach-role-policy \
  --role-name ContactFormLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

4. Create and attach DynamoDB policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/ContactFormSubmissions*"
    }
  ]
}
```

#### Step 3: Create Lambda Function

1. Zip the Lambda function:
```bash
cd aws-lambda
zip -r contact-form-handler.zip contact-form-handler.js
```

2. Create the function:
```bash
aws lambda create-function \
  --function-name ContactFormHandler \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/ContactFormLambdaRole \
  --handler contact-form-handler.handler \
  --zip-file fileb://contact-form-handler.zip \
  --environment Variables='{DYNAMODB_TABLE_NAME=ContactFormSubmissions}' \
  --timeout 30 \
  --memory-size 256
```

#### Step 4: Create API Gateway

1. Create REST API:
```bash
aws apigateway create-rest-api \
  --name ContactFormAPI \
  --description "API for serverless contact form"
```

2. Get the root resource ID and create contact resource
3. Create POST and OPTIONS methods
4. Set up Lambda integration
5. Deploy the API

## Frontend Configuration

Update the API endpoint in your React application:

```typescript
// In src/App.tsx, replace the API_ENDPOINT constant
const API_ENDPOINT = 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/contact';
```

## Testing the Deployment

1. **Test the API directly:**
```bash
curl -X POST https://YOUR_API_ENDPOINT/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

2. **Check DynamoDB:**
```bash
aws dynamodb scan --table-name ContactFormSubmissions
```

3. **View Lambda logs:**
```bash
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/ContactFormHandler
```

## Monitoring and Maintenance

### CloudWatch Metrics
- Monitor Lambda invocations, errors, and duration
- Track API Gateway request count and latency
- Monitor DynamoDB read/write capacity

### Cost Optimization
- Lambda: Pay per request (first 1M requests free)
- API Gateway: Pay per API call
- DynamoDB: Pay per request with on-demand billing

### Security Best Practices
- Enable AWS CloudTrail for API logging
- Use AWS WAF for API protection
- Implement rate limiting
- Validate and sanitize all inputs
- Use HTTPS only

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure OPTIONS method is configured
   - Check CORS headers in Lambda response

2. **Lambda Timeout:**
   - Increase timeout in Lambda configuration
   - Optimize DynamoDB queries

3. **Permission Errors:**
   - Verify IAM role has correct permissions
   - Check Lambda execution role

4. **API Gateway 502 Errors:**
   - Check Lambda function logs
   - Verify Lambda integration configuration

### Useful Commands

```bash
# View Lambda logs
aws logs tail /aws/lambda/ContactFormHandler --follow

# Test Lambda function directly
aws lambda invoke \
  --function-name ContactFormHandler \
  --payload '{"httpMethod":"POST","body":"{\"name\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Test message\"}"}' \
  response.json

# Check API Gateway stages
aws apigateway get-stages --rest-api-id YOUR_API_ID
```

## Cleanup

To remove all resources:

```bash
# If using CloudFormation
aws cloudformation delete-stack --stack-name serverless-contact-form

# If manual setup
aws lambda delete-function --function-name ContactFormHandler
aws apigateway delete-rest-api --rest-api-id YOUR_API_ID
aws dynamodb delete-table --table-name ContactFormSubmissions
aws iam delete-role --role-name ContactFormLambdaRole
```

## Next Steps

- Add email notifications using Amazon SES
- Implement form validation and spam protection
- Add authentication for admin panel
- Create dashboard for viewing submissions
- Set up automated backups for DynamoDB