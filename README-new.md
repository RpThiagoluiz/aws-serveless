# AWS Lambda - Customer Query Service

Lambda function para consulta rápida de customers usando **Clean Architecture** e **TypeScript**.

## 🏗️ Clean Architecture

```
src/
├── domain/                           # Camada de Domínio
│   ├── entities/
│   │   └── customer.entity.ts        # Entidade Customer
│   ├── repositories/
│   │   └── customer.repository.interface.ts  # Interface do Repository
│   ├── dtos/
│   │   ├── customer-data-source.dto.ts     # DTO do banco de dados
│   │   └── get-customer-response.dto.ts    # DTO de resposta
│   └── errors/
│       └── customer.errors.ts        # Erros específicos do domínio
│
├── application/                      # Camada de Aplicação
│   └── use-cases/
│       └── get-customer.use-case.ts  # Caso de uso GetCustomer
│
├── infrastructure/                   # Camada de Infraestrutura
│   └── repositories/
│       └── dynamodb-customer.repository.ts  # Implementação DynamoDB
│
├── presentation/                     # Camada de Apresentação
│   └── controllers/
│       └── get-customer.controller.ts  # Controller da Lambda
│
└── handler.ts                        # Entry point da Lambda
```

## 🎯 CustomerDataSourceDTO

```typescript
export interface CustomerDataSourceDTO {
  id: string;
  cpf: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🚀 Tecnologias

- **TypeScript**: Tipagem forte e melhor DX
- **AWS SDK**: Integração com DynamoDB
- **Jest**: Testes unitários
- **ESLint**: Linting rigoroso
- **Serverless Framework**: Deploy e infraestrutura

## 📦 Comandos

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Executar testes
npm test

# Linting
npm run lint
npm run lint:fix

# Build em modo watch
npm run build:watch
```

### Deploy

```bash
# Deploy development
npm run deploy:dev

# Deploy production
npm run deploy:prod

# Ver logs
npm run logs

# Remover stack
npm run remove
```

## 🔧 Configuração

### Variáveis de Ambiente

- `DYNAMODB_TABLE`: Nome da tabela DynamoDB
- `STAGE`: Ambiente (dev/prod)
- `REGION`: Região AWS

### DynamoDB Schema

```typescript
{
  cpf: string; // Partition Key
  id: string; // UUID único
  name: string; // Nome do customer
  email: string; // Email do customer
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

## 📡 API

### Endpoint

```
GET /customers/{cpf}
```

### Resposta de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "cpf": "12345678901",
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Resposta de Erro (404)

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer with CPF 12345678901 not found"
  }
}
```

### Códigos de Erro

- `CUSTOMER_NOT_FOUND` (404): Customer não encontrado
- `INVALID_CPF` (400): CPF inválido
- `MISSING_CPF` (400): CPF não informado
- `INTERNAL_ERROR` (500): Erro interno

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage
npm test -- --coverage
```

### Exemplo de Teste

```typescript
it('should return customer data when customer exists', async () => {
  const cpf = '12345678901';
  const mockCustomer = new Customer(/*...*/);
  mockRepository.findByCpf.mockResolvedValue(mockCustomer);

  const result = await useCase.execute(cpf);

  expect(result.success).toBe(true);
  expect(result.data?.cpf).toBe(cpf);
});
```

## 🏷️ Vantagens da Clean Architecture

### ✅ **Desacoplamento**

- **Domínio**: Independente de frameworks
- **Use Cases**: Lógica de negócio pura
- **Infraestrutura**: Facilmente substituível

### ✅ **Testabilidade**

- **Unit Tests**: Use cases isolados
- **Mocks**: Interfaces bem definidas
- **Coverage**: Cobertura alta de código

### ✅ **Manutenibilidade**

- **SOLID**: Princípios aplicados
- **Responsabilidades**: Bem separadas
- **Evolução**: Fácil adicionar features

## 🔄 Integração com Database-Infra

Esta Lambda consome dados do repositório `database-infra-terraform`:

```yaml
# Configuração automática via Serverless
environment:
  DYNAMODB_TABLE: customers-${self:provider.stage}

# Permissões IAM
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - dynamodb:GetItem
          - dynamodb:Query
        Resource:
          - 'arn:aws:dynamodb:*:*:table/customers-*'
```

## 📊 Performance

- **Cold Start**: ~500ms (TypeScript compilado)
- **Warm Start**: ~50ms
- **Memory**: 512MB (configurável)
- **Timeout**: 30s

## 🔍 Monitoramento

### CloudWatch Logs

```bash
# Ver logs da função
npm run logs

# Logs específicos
aws logs filter-log-events \
  --log-group-name "/aws/lambda/serverless-aws-lambda-dev-getCustomer"
```

### Métricas Importantes

- **Duration**: Tempo de execução
- **Errors**: Taxa de erro
- **Throttles**: Throttling
- **Cold Starts**: Inicializações frias

## 🚀 Deploy na AWS

A Lambda será automaticamente integrada com:

- **API Gateway**: Endpoint HTTP
- **DynamoDB**: Tabela customers-{stage}
- **CloudWatch**: Logs e métricas
- **IAM**: Permissões mínimas necessárias
