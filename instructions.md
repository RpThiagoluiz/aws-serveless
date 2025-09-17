# Arquitetura de Microserviços AWS Serverless

## 📁 Estrutura dos 4 Repositórios:

```
1. user-lambda-service/     ← Lambda getUser (sem HTTP events)
2. api-gateway-infra/       ← Gateway + Autenticação (ponto único)
3. database-infra/          ← RDS/DynamoDB (deploy via infra)
4. main-application/        ← CRUD produtos, pedidos, clientes
```

## 🚀 Implementação:

### 1. Repositório: `user-lambda-service`

```yaml
# serverless.yml
service: user-lambda-service

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  environment:
    NODE_ENV: ${opt:stage, 'dev'}
    DB_HOST: ${env:DB_HOST}
    DB_NAME: ${env:DB_NAME}
  iam:
    role: ${env:AWS_ROLE_ARN}

functions:
  getUser:
    handler: src/handlers/getUser.handler
    # SEM eventos HTTP - chamada direta pelo Gateway
    timeout: 30
    memorySize: 256
```

```javascript
// src/handlers/getUser.js
const { getUserUseCase } = require('../usecases/getUserUseCase');

exports.handler = async (event) => {
  try {
    const { userId } = event; // Recebe direto do Gateway

    const user = await getUserUseCase.execute(userId);

    if (!user) {
      return {
        statusCode: 404,
        success: false,
        message: 'Usuário não encontrado',
      };
    }

    return {
      statusCode: 200,
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: 'Erro interno',
      error: error.message,
    };
  }
};
```

### 2. Repositório: `api-gateway-infra`

```yaml
# serverless.yml
service: api-gateway-infra

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  environment:
    JWT_SECRET: ${env:JWT_SECRET}
    USER_LAMBDA_ARN: ${env:USER_LAMBDA_ARN}
    MAIN_APP_LAMBDA_ARN: ${env:MAIN_APP_LAMBDA_ARN}
  iam:
    role: ${env:AWS_ROLE_ARN}

functions:
  # Authorizer centralizado
  authorizer:
    handler: src/auth/authorizer.handler

  # Proxy para User Service (getUser)
  userProxy:
    handler: src/proxy/userProxy.handler
    events:
      - http:
          path: users/{id}
          method: get
          cors: true
          authorizer:
            name: authorizer
            type: request
            identitySource: method.request.header.Authorization

  # Proxy para Main Application (CRUD)
  appProxy:
    handler: src/proxy/appProxy.handler
    events:
      - http:
          path: products/{proxy+}
          method: ANY
          cors: true
          authorizer:
            name: authorizer
            type: request
            identitySource: method.request.header.Authorization

      - http:
          path: orders/{proxy+}
          method: ANY
          cors: true
          authorizer:
            name: authorizer
            type: request
            identitySource: method.request.header.Authorization

      - http:
          path: customers/{proxy+}
          method: ANY
          cors: true
          authorizer:
            name: authorizer
            type: request
            identitySource: method.request.header.Authorization

  # Health check público
  health:
    handler: src/health.handler
    events:
      - http:
          path: health
          method: get
          cors: true
```

```javascript
// src/proxy/userProxy.js
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.handler = async (event) => {
  try {
    const { pathParameters, requestContext } = event;
    const userId = pathParameters.id;
    const requesterId = requestContext.authorizer.userId; // Do JWT

    // Chamar a Lambda do User Service
    const params = {
      FunctionName: process.env.USER_LAMBDA_ARN,
      Payload: JSON.stringify({
        userId: userId,
        requesterId: requesterId,
      }),
    };

    const result = await lambda.invoke(params).promise();
    const response = JSON.parse(result.Payload);

    return {
      statusCode: response.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: response.success,
        message: response.message,
        data: response.data,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Erro no gateway',
        error: error.message,
      }),
    };
  }
};
```

### 3. Repositório: `database-infra`

```yaml
# serverless.yml
service: database-infra

provider:
  name: aws
  region: us-east-1
  stage: ${opt:stage, 'dev'}

resources:
  Resources:
    # DynamoDB para dados rápidos
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: users-${opt:stage}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
        StreamSpecification:
          StreamViewType: NEW_AND_OLD_IMAGES

    ProductsTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: products-${opt:stage}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST

    OrdersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: orders-${opt:stage}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST

  Outputs:
    UsersTableName:
      Value: !Ref UsersTable
      Export:
        Name: ${self:service}-${opt:stage}-users-table

    ProductsTableName:
      Value: !Ref ProductsTable
      Export:
        Name: ${self:service}-${opt:stage}-products-table

    OrdersTableName:
      Value: !Ref OrdersTable
      Export:
        Name: ${self:service}-${opt:stage}-orders-table
```

### 4. Repositório: `main-application` (NestJS + Terraform)

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Lambda Function para NestJS
resource "aws_lambda_function" "nestjs_app" {
  filename         = "../dist/lambda.zip"
  function_name    = "${var.project_name}-${var.environment}-nestjs-app"
  role            = var.lambda_role_arn
  handler         = "dist/main.handler"
  source_code_hash = filebase64sha256("../dist/lambda.zip")
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 512

  environment {
    variables = {
      NODE_ENV           = var.environment
      USERS_TABLE        = var.users_table_name
      PRODUCTS_TABLE     = var.products_table_name
      ORDERS_TABLE       = var.orders_table_name
      USER_LAMBDA_ARN    = var.user_lambda_arn
      DATABASE_URL       = var.database_url
    }
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_logs]
}

# IAM role para Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Permissões para DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-${var.environment}-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          var.users_table_arn,
          var.products_table_arn,
          var.orders_table_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          var.user_lambda_arn
        ]
      }
    ]
  })
}
```

```hcl
# terraform/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "main-application"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "dev"
}

variable "lambda_role_arn" {
  description = "Lambda execution role ARN"
  type        = string
}

variable "users_table_name" {
  description = "DynamoDB Users table name"
  type        = string
}

variable "products_table_name" {
  description = "DynamoDB Products table name"
  type        = string
}

variable "orders_table_name" {
  description = "DynamoDB Orders table name"
  type        = string
}

variable "users_table_arn" {
  description = "DynamoDB Users table ARN"
  type        = string
}

variable "products_table_arn" {
  description = "DynamoDB Products table ARN"
  type        = string
}

variable "orders_table_arn" {
  description = "DynamoDB Orders table ARN"
  type        = string
}

variable "user_lambda_arn" {
  description = "User Lambda function ARN"
  type        = string
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}
```

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Main Application API')
    .setDescription('CRUD para produtos, pedidos e clientes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
```

```typescript
// src/lambda.ts - Handler para AWS Lambda
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import {
  Context,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';

let cachedApp: any;

async function createNestApp() {
  if (!cachedApp) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);

    cachedApp = await NestFactory.create(AppModule, adapter);

    cachedApp.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    cachedApp.enableCors();
    await cachedApp.init();
  }

  return cachedApp;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const app = await createNestApp();
    const expressApp = app.getHttpAdapter().getInstance();

    return new Promise((resolve, reject) => {
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: '',
      };

      const req = {
        method: event.httpMethod,
        url: event.path,
        headers: event.headers,
        body: event.body,
        query: event.queryStringParameters || {},
        params: event.pathParameters || {},
      };

      expressApp(req, response, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message,
      }),
    };
  }
};
```

```typescript
// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
  })
  async findAll() {
    return await this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request
  ) {
    const userId = req.user?.['userId']; // Do JWT decodificado
    return await this.productsService.create(createProductDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request
  ) {
    const userId = req.user?.['userId'];
    return await this.productsService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar produto' })
  @ApiResponse({ status: 200, description: 'Produto deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.['userId'];
    return await this.productsService.remove(id, userId);
  }
}
```

```typescript
// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DynamoDBService } from '../database/dynamodb.service';
import { UserValidationService } from '../services/user-validation.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly userValidationService: UserValidationService
  ) {}

  async findAll() {
    try {
      const products = await this.dynamoDBService.scan(
        process.env.PRODUCTS_TABLE
      );

      return {
        success: true,
        data: products,
        total: products.length,
      };
    } catch (error) {
      throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.dynamoDBService.getItem(
        process.env.PRODUCTS_TABLE,
        { id }
      );

      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Erro ao buscar produto: ${error.message}`);
    }
  }

  async create(createProductDto: CreateProductDto, userId: string) {
    try {
      // Validar usuário usando a User Lambda
      const userValidation = await this.userValidationService.validateUser(
        userId
      );

      if (!userValidation.success) {
        throw new Error('Usuário não autorizado para criar produtos');
      }

      const product = {
        id: uuidv4(),
        ...createProductDto,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.dynamoDBService.putItem(process.env.PRODUCTS_TABLE, product);

      return {
        success: true,
        message: 'Produto criado com sucesso',
        data: product,
      };
    } catch (error) {
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    try {
      // Validar usuário
      const userValidation = await this.userValidationService.validateUser(
        userId
      );

      if (!userValidation.success) {
        throw new Error('Usuário não autorizado para atualizar produtos');
      }

      // Verificar se produto existe
      const existingProduct = await this.dynamoDBService.getItem(
        process.env.PRODUCTS_TABLE,
        { id }
      );

      if (!existingProduct) {
        throw new NotFoundException('Produto não encontrado');
      }

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      };

      await this.dynamoDBService.putItem(
        process.env.PRODUCTS_TABLE,
        updatedProduct
      );

      return {
        success: true,
        message: 'Produto atualizado com sucesso',
        data: updatedProduct,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Validar usuário
      const userValidation = await this.userValidationService.validateUser(
        userId
      );

      if (!userValidation.success) {
        throw new Error('Usuário não autorizado para deletar produtos');
      }

      // Verificar se produto existe
      const existingProduct = await this.dynamoDBService.getItem(
        process.env.PRODUCTS_TABLE,
        { id }
      );

      if (!existingProduct) {
        throw new NotFoundException('Produto não encontrado');
      }

      await this.dynamoDBService.deleteItem(process.env.PRODUCTS_TABLE, { id });

      return {
        success: true,
        message: 'Produto deletado com sucesso',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Erro ao deletar produto: ${error.message}`);
    }
  }
}
```

```typescript
// src/services/user-validation.service.ts
import { Injectable } from '@nestjs/common';
import { LambdaService } from './lambda.service';

@Injectable()
export class UserValidationService {
  constructor(private readonly lambdaService: LambdaService) {}

  async validateUser(userId: string) {
    try {
      const params = {
        FunctionName: process.env.USER_LAMBDA_ARN,
        Payload: JSON.stringify({ userId }),
      };

      const result = await this.lambdaService.invoke(params);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao validar usuário',
        error: error.message,
      };
    }
  }
}
```

```json
// package.json
{
  "name": "main-application",
  "version": "1.0.0",
  "description": "NestJS application with CRUD operations",
  "scripts": {
    "build": "nest build",
    "build:lambda": "npm run build && npm run package:lambda",
    "package:lambda": "zip -r dist/lambda.zip dist/ node_modules/ -x 'node_modules/.cache/*' 'node_modules/@types/*'",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "terraform:plan": "cd terraform && terraform plan",
    "terraform:apply": "cd terraform && terraform apply",
    "terraform:destroy": "cd terraform && terraform destroy"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "aws-lambda": "^1.0.7",
    "aws-sdk": "^2.1400.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@types/aws-lambda": "^8.10.0",
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.0.0"
  }
}
```

```yaml
# .github/workflows/deploy.yml
name: Deploy NestJS Application

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build:lambda

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-session-token: ${{ secrets.AWS_SESSION_TOKEN }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Terraform Init
        run: |
          cd terraform
          terraform init

      - name: Terraform Plan
        run: |
          cd terraform
          terraform plan \
            -var="environment=${{ github.ref == 'refs/heads/main' && 'prod' || 'dev' }}" \
            -var="lambda_role_arn=${{ secrets.AWS_ROLE_ARN }}" \
            -var="users_table_name=${{ secrets.USERS_TABLE_NAME }}" \
            -var="products_table_name=${{ secrets.PRODUCTS_TABLE_NAME }}" \
            -var="orders_table_name=${{ secrets.ORDERS_TABLE_NAME }}" \
            -var="user_lambda_arn=${{ secrets.USER_LAMBDA_ARN }}"

      - name: Terraform Apply
        run: |
          cd terraform  
          terraform apply -auto-approve \
            -var="environment=${{ github.ref == 'refs/heads/main' && 'prod' || 'dev' }}" \
            -var="lambda_role_arn=${{ secrets.AWS_ROLE_ARN }}" \
            -var="users_table_name=${{ secrets.USERS_TABLE_NAME }}" \
            -var="products_table_name=${{ secrets.PRODUCTS_TABLE_NAME }}" \
            -var="orders_table_name=${{ secrets.ORDERS_TABLE_NAME }}" \
            -var="user_lambda_arn=${{ secrets.USER_LAMBDA_ARN }}"
```

## 🔄 Fluxo de Request:

```
1. Client → POST /products (JWT token)
2. API Gateway → Valida JWT no authorizer
3. API Gateway → Chama appProxy para products
4. appProxy → Chama main-application/productsHandler
5. productsHandler → Chama user-lambda-service/getUser (validar user)
6. user-lambda-service → Consulta database
7. main-application → Se usuário válido, cria produto no database
8. Response → Retorna pela mesma cadeia
```

## 📋 Deploy Order:

```bash
1. cd database-infra && sls deploy
2. cd user-lambda-service && sls deploy
3. cd main-application && npm run terraform:apply
4. cd api-gateway-infra && sls deploy
```

## 🎯 Pontos Externos de Acesso:

- ✅ **Único endpoint público:** API Gateway
- ✅ **Autenticação centralizada:** JWT/API Key no Gateway
- ✅ **Lambdas protegidas:** Sem acesso direto
- ✅ **Comunicação interna:** Lambda-to-Lambda

## Regras da Arquitetura:

1. **Recurso de proteção da aplicação toda no Gateway** - Ele é o ponto externo de validação seja por JWT ou API Key
2. **API do getUser** - Chamada pela aplicação que por sua vez a lambda comunica com o banco de dados e retorna os dados do usuário ou que ele não existe
3. **A aplicação recebe esse retorno** e faz as tratativas corretas
4. **Todas as requests passam pelo Gateway** antes de chegar nas Lambdas de negócio

Esta estrutura garante uma arquitetura serverless robusta e escalável seguindo as melhores práticas de microserviços.
