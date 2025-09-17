#!/bin/bash

# Script para testar a Lambda localmente

set -e

echo "🚀 Testando Lambda GetCustomer localmente..."

# Verificar se serverless está instalado
if ! command -v sls &> /dev/null; then
    echo "❌ Serverless Framework não encontrado. Instalando..."
    npm install -g serverless
fi

echo "📦 1/4 Instalando dependências..."
npm install

echo "🔨 2/4 Compilando TypeScript..."
npm run build

echo "🧪 3/4 Executando testes..."
npm test

echo "📋 4/4 Estrutura de arquivos criada:"
echo "src/"
echo "├── domain/"
echo "│   ├── entities/customer.entity.ts"
echo "│   ├── repositories/customer.repository.interface.ts"
echo "│   ├── dtos/"
echo "│   │   ├── customer-data-source.dto.ts"
echo "│   │   └── get-customer-response.dto.ts"
echo "│   └── errors/customer.errors.ts"
echo "├── application/"
echo "│   └── use-cases/get-customer.use-case.ts"
echo "├── infrastructure/"
echo "│   └── repositories/dynamodb-customer.repository.ts"
echo "├── presentation/"
echo "│   └── controllers/get-customer.controller.ts"
echo "└── handler.ts"

echo ""
echo "✅ Lambda configurada com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure AWS credentials"
echo "   2. Execute: npm run deploy:dev"
echo "   3. Teste endpoint: GET /customers/{cpf}"
echo ""
echo "🔍 Para debug local:"
echo "   sls invoke local -f getCustomer --data '{\"pathParameters\":{\"cpf\":\"12345678901\"}}'"
