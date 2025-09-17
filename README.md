# Serverless AWS Lambda - Customer Service

This repository contains a Lambda function for retrieving customer data from DynamoDB.

## Architecture

- **Function**: `getCustomer` - Retrieves customer data by CPF
- **Database**: DynamoDB table `customers-{stage}`
- **Runtime**: Node.js 18.x

## Structure

```
src/
  handlers/
    getCustomer.js       # Lambda handler
  usecases/
    getCustomerUseCase.js # Business logic
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:

- `AWS_ROLE_ARN`: IAM role ARN for Serverless Framework

3. Deploy:

```bash
# Deploy to dev
npm run deploy:dev

# Deploy to prod
npm run deploy:prod
```

## Usage

The Lambda function is invoked directly (no HTTP events) and expects:

```json
{
  "cpf": "12345678901"
}
```

Returns:

```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "cpf": "12345678901",
    "nome": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```
