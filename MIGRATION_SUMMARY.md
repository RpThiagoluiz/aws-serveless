# Migração serverless-aws-lambda para PostgreSQL

## Resumo das Mudanças

O projeto `serverless-aws-lambda` foi migrado do DynamoDB para PostgreSQL RDS, mantendo a arquitetura Clean Architecture.

### ✅ Arquivos Criados/Modificados

#### 1. **Infraestrutura**

- `src/infrastructure/repositories/postgresql-customer.repository.ts` - Novo repository para PostgreSQL
- `src/utils/cpf-validator.ts` - Utilitário para validação e limpeza de CPF

#### 2. **Configuração**

- `serverless.yml` - Atualizado para:
  - Usar query parameters ao invés de path parameters
  - Incluir variáveis de ambiente do PostgreSQL
  - Remover configurações do DynamoDB
- `package.json` - Dependências atualizadas:
  - Adicionado: `pg` e `@types/pg`
  - Removido: `aws-sdk` (DynamoDB)

#### 3. **Application Layer**

- `src/application/use-cases/get-customer.use-case.ts` - Atualizado para usar CpfValidator

#### 4. **Presentation Layer**

- `src/presentation/controllers/get-customer.controller.ts` - Atualizado para query parameters

#### 5. **CI/CD**

- `.github/workflows/deploy.yml` - Atualizado com variáveis de ambiente do PostgreSQL

#### 6. **Testes**

- `src/__tests__/cpf-validator.test.ts` - Novos testes para validação de CPF
- `src/__tests__/postgresql-customer-repository.test.ts` - Testes para repository PostgreSQL
- `src/__tests__/get-customer.use-case.test.ts` - Testes atualizados

### 🔧 Funcionalidades Implementadas

1. **Validação de CPF**: Limpeza e validação usando algoritmo oficial
2. **Query Parameters**: Endpoint agora usa `?cpf=12345678901`
3. **PostgreSQL Connection**: Conexão com RDS usando pool de conexões
4. **Error Handling**: Tratamento robusto de erros de banco
5. **Clean Architecture**: Mantida a separação de responsabilidades

### 🚀 Próximos Passos

1. Configurar secrets no GitHub para:

   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

2. Fazer push das mudanças para trigger do deployment

3. Testar endpoint: `https://api-url.com/customers?cpf=12345678901`

### 📝 Comando de Teste Local

```bash
# Instalar dependências
npm install

# Executar testes
npm test

# Compilar TypeScript
npm run build

# Deploy (se configurado)
sls deploy --stage prod
```

### 🔍 Estrutura Final

```
src/
├── application/
│   └── use-cases/
│       └── get-customer.use-case.ts ✓
├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── dtos/
│   └── errors/
├── infrastructure/
│   └── repositories/
│       └── postgresql-customer.repository.ts ✓
├── presentation/
│   └── controllers/
│       └── get-customer.controller.ts ✓
├── utils/
│   └── cpf-validator.ts ✓
└── __tests__/ ✓
```

### ✅ Status

- [x] PostgreSQL Repository implementado
- [x] CPF Validator criado
- [x] Controller atualizado para query params
- [x] Use Case atualizado
- [x] Testes passando (16/16)
- [x] Configuração serverless atualizada
- [x] GitHub Actions configurado
- [ ] Deploy para produção (pending secrets)
