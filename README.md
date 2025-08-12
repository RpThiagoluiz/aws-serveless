# Serverless AWS Lambda with Clean Architecture

Este projeto implementa uma API serverless simples usando AWS Lambda com clean architecture.

## Estrutura do Projeto

```
├── src/
│   ├── controllers/        # Controladores HTTP
│   │   └── helloWorldController.js
│   ├── usecases/          # Casos de uso (regras de negócio)
│   │   └── helloWorldUseCase.js
│   └── utils/             # Utilitários
│       └── responseHelper.js
├── handler.js             # Entry point das funções Lambda
├── serverless.yml         # Configuração do Serverless Framework
├── package.json          # Dependências do projeto
└── README.md
```

## Endpoints

- `GET /hello` - Retorna uma mensagem de hello world

## Deploy

### Configuração das Secrets no GitHub

Configure as seguintes secrets no seu repositório GitHub:

1. `AWS_ACCESS_KEY_ID` - Sua AWS Access Key ID
2. `AWS_SECRET_ACCESS_KEY` - Sua AWS Secret Access Key
3. `AWS_REGION` - Região AWS (ex: us-east-1)

### Deploy via GitHub Actions

O deploy é feito automaticamente quando você faz push na branch `main`.

### Deploy Manual

```bash
# Instalar dependências
npm install

# Deploy para dev
npm run deploy:dev

# Deploy para produção
npm run deploy:prod
```

## Testando Local

Para testar localmente, você pode usar o Serverless Framework:

```bash
# Instalar Serverless Framework
npm install -g serverless

# Invocar função localmente
serverless invoke local -f hello
```

## Logs

Para ver os logs da função:

```bash
npm run logs
```
