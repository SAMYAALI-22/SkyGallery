# Serverless Contact Form

A production-ready serverless contact form built with AWS Lambda, API Gateway, and DynamoDB. This project demonstrates modern serverless architecture patterns and provides a complete solution for collecting and managing contact form submissions without server management.

## 🏗️ Architecture

```
Frontend (React) → API Gateway → Lambda Function → DynamoDB
```

### Components

- **Frontend**: React application with TypeScript and Tailwind CSS
- **API Gateway**: RESTful API endpoint with CORS support
- **Lambda Function**: Node.js serverless function for processing submissions
- **DynamoDB**: NoSQL database for storing contact form data

## ✨ Features

- **Serverless Architecture**: No servers to manage, automatic scaling
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error handling and user feedback
- **CORS Support**: Proper cross-origin resource sharing configuration
- **Cost Effective**: Pay only for what you use
- **High Availability**: Built-in redundancy and fault tolerance
- **Real-time Feedback**: Loading states and success/error messages

## 🚀 Quick Start

### Prerequisites

- AWS Account
- Node.js 18+ installed
- AWS CLI configured

### 1. Clone and Setup Frontend

```bash
git clone <repository-url>
cd serverless-contact-form
npm install
npm run dev
```

### 2. Deploy AWS Infrastructure

Using CloudFormation (recommended):

```bash
aws cloudformation create-stack \
  --stack-name serverless-contact-form \
  --template-body file://aws-infrastructure/cloudformation-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

### 3. Get API Endpoint

```bash
aws cloudformation describe-stacks \
  --stack-name serverless-contact-form \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text
```

### 4. Update Frontend Configuration

Replace the API endpoint in `src/App.tsx`:

```typescript
const API_ENDPOINT = 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/contact';
```

## 📁 Project Structure

```
├── src/                          # React frontend source
│   ├── App.tsx                   # Main application component
│   ├── index.css                 # Tailwind CSS styles
│   └── main.tsx                  # Application entry point
├── aws-lambda/                   # Lambda function code
│   └── contact-form-handler.js   # Main Lambda handler
├── aws-infrastructure/           # Infrastructure as Code
│   └── cloudformation-template.yaml
├── deployment-guide.md           # Detailed deployment instructions
└── README.md                     # This file
```

## 🛠️ Development

### Local Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Lambda Function Locally

```bash
# Test with sample event
node -e "
const handler = require('./aws-lambda/contact-form-handler');
const event = {
  httpMethod: 'POST',
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    message: 'Test message'
  })
};
handler.handler(event).then(console.log);
"
```

## 🔧 Configuration

### Environment Variables

Lambda function uses these environment variables:

- `DYNAMODB_TABLE_NAME`: Name of the DynamoDB table
- `ENVIRONMENT`: Environment name (dev, staging, prod)

### DynamoDB Schema

```javascript
{
  id: "contact_1234567890_abc123",      // Primary key
  name: "John Doe",                     // Contact name
  email: "john@example.com",            // Email address
  subject: "Website Inquiry",           // Message subject
  message: "Hello, I'm interested...",  // Message content
  timestamp: "2024-01-15T10:30:00Z",    // ISO timestamp
  createdAt: 1705312200,                // Unix timestamp
  status: "new",                        // Processing status
  source: "contact-form"                // Source identifier
}
```

## 📊 Monitoring

### CloudWatch Metrics

Monitor these key metrics:

- **Lambda**: Invocations, Errors, Duration
- **API Gateway**: Request Count, Latency, 4XX/5XX Errors
- **DynamoDB**: Read/Write Capacity, Throttles

### Logging

```bash
# View Lambda logs
aws logs tail /aws/lambda/ContactFormHandler --follow

# View API Gateway logs (if enabled)
aws logs tail API-Gateway-Execution-Logs_YOUR_API_ID/prod --follow
```

## 💰 Cost Estimation

Estimated monthly costs for moderate usage:

- **Lambda**: $0.20 (1M requests)
- **API Gateway**: $3.50 (1M requests)
- **DynamoDB**: $1.25 (1M writes, 1M reads)
- **Total**: ~$5/month for 1M form submissions

## 🔒 Security

### Implemented Security Measures

- Input validation and sanitization
- CORS configuration
- IAM least privilege access
- HTTPS only communication
- SQL injection prevention (NoSQL)

### Additional Security Recommendations

- Enable AWS WAF for API protection
- Implement rate limiting
- Add reCAPTCHA for spam prevention
- Enable CloudTrail for audit logging

## 🚀 Deployment

### Production Deployment

1. **Build the frontend:**
```bash
npm run build
```

2. **Deploy to S3 + CloudFront:**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

3. **Update API endpoint** in the deployed frontend

### CI/CD Pipeline

Consider setting up automated deployment with:
- GitHub Actions
- AWS CodePipeline
- AWS SAM CLI

## 🧪 Testing

### Manual Testing

```bash
# Test API endpoint
curl -X POST https://YOUR_API_ENDPOINT/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "This is a test message"
  }'
```

### Automated Testing

Add these test types:
- Unit tests for Lambda function
- Integration tests for API
- End-to-end tests for frontend

## 🔄 Maintenance

### Regular Tasks

- Monitor CloudWatch metrics and alarms
- Review and rotate IAM credentials
- Update Lambda runtime versions
- Backup DynamoDB data
- Review and optimize costs

### Scaling Considerations

- Lambda: Automatic scaling (up to 1000 concurrent executions)
- API Gateway: Handles 10,000 requests per second by default
- DynamoDB: On-demand scaling or provisioned capacity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the [deployment guide](deployment-guide.md)
2. Review CloudWatch logs
3. Open an issue on GitHub
4. Check AWS documentation

## 🎯 Use Cases

This serverless contact form is perfect for:

- Personal portfolios and websites
- Small business websites
- Landing pages
- Marketing campaigns
- Event registration forms
- Customer feedback collection

## 🔮 Future Enhancements

Potential improvements:

- [ ] Email notifications with Amazon SES
- [ ] Admin dashboard for managing submissions
- [ ] File upload support with S3
- [ ] Multi-language support
- [ ] Advanced spam protection
- [ ] Analytics and reporting
- [ ] Webhook integrations
- [ ] Form builder interface