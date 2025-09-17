# 🧪 Guia de Testes - Sistema Completo

## 📋 Verificações Pré-Teste

### 1. ✅ Confirmar RDS Deploy

```bash
cd ../rds-postgrels
git log --oneline -3
# Verificar se último commit foi deployado com sucesso
```

### 2. ✅ Confirmar Lambda Deploy

- Verificar GitHub Actions do `serverless-aws-lambda`
- Status deve estar ✅ verde

## 🔍 Como Obter URL da API

### Opção 1: AWS Console

1. Acesse AWS Console > API Gateway
2. Procure por `serverless-aws-lambda-prod`
3. Copie a URL base (ex: `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

### Opção 2: GitHub Actions Log

1. Vá para Actions do repositório
2. Último deploy bem-sucedido
3. Procure por "endpoints:" no log
4. Exemplo de output:

```
endpoints:
  GET - https://abc123.execute-api.us-east-1.amazonaws.com/prod/customers
```

## 🧪 Testes Práticos

### 1. **Teste CPF Válido (com dados do seed)**

```bash
# CPF que existe no banco (seeded)
curl "https://YOUR_API_URL/customers?cpf=12345678901"

# Resposta esperada:
{
  "success": true,
  "data": {
    "id": "1",
    "cpf": "12345678901",
    "name": "João da Silva",
    "email": "joao@email.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. **Teste CPF com Formatação**

```bash
# Mesmo CPF com pontos e hífen
curl "https://YOUR_API_URL/customers?cpf=123.456.789-01"

# Deve retornar mesmo resultado (CPF é limpo automaticamente)
```

### 3. **Teste CPF Inválido**

```bash
# CPF com formato inválido
curl "https://YOUR_API_URL/customers?cpf=123"

# Resposta esperada:
{
  "success": false,
  "error": {
    "code": "INVALID_CPF",
    "message": "Invalid CPF format: 123"
  }
}
```

### 4. **Teste CPF Não Encontrado**

```bash
# CPF válido mas que não existe no banco
curl "https://YOUR_API_URL/customers?cpf=98765432100"

# Resposta esperada:
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer with CPF 98765432100 not found"
  }
}
```

### 5. **Teste sem Parâmetro CPF**

```bash
# Requisição sem query parameter
curl "https://YOUR_API_URL/customers"

# Resposta esperada:
{
  "success": false,
  "error": {
    "code": "MISSING_CPF",
    "message": "CPF parameter is required"
  }
}
```

## 🔍 Dados de Teste Disponíveis

Se o seed do RDS foi executado com sucesso, estes CPFs devem existir:

```bash
# Tente estes CPFs válidos:
curl "https://YOUR_API_URL/customers?cpf=12345678901"
curl "https://YOUR_API_URL/customers?cpf=98765432100"
curl "https://YOUR_API_URL/customers?cpf=11144477735"
```

## 🛠️ Ferramentas de Teste

### Postman/Insomnia

```
GET https://YOUR_API_URL/customers?cpf=12345678901
Headers: (nenhum necessário)
```

### Browser

```
https://YOUR_API_URL/customers?cpf=12345678901
```

### JavaScript (Frontend)

```javascript
fetch('https://YOUR_API_URL/customers?cpf=12345678901')
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## 🐛 Troubleshooting

### ❌ Error 500 - Internal Server Error

- Verificar logs do Lambda no CloudWatch
- Provavelmente erro de conexão com RDS
- Conferir se RDS está acessível

### ❌ Error 403 - Forbidden

- API Gateway configurado incorretamente
- Verificar CORS settings

### ❌ Error 404 - Not Found

- URL incorreta
- Verificar endpoint no AWS Console

### ❌ Timeout

- Lambda pode estar fazendo cold start
- Tentar novamente em alguns segundos

## 📊 Monitoramento

### CloudWatch Logs

```
Log Group: /aws/lambda/serverless-aws-lambda-prod-getCustomer
```

### Métricas

- Invocations
- Duration
- Errors
- Throttles

## ✅ Checklist de Teste Completo

- [ ] RDS PostgreSQL online
- [ ] Lambda deployado
- [ ] API Gateway funcionando
- [ ] Teste CPF válido
- [ ] Teste CPF inválido
- [ ] Teste CPF não encontrado
- [ ] Teste formatação CPF
- [ ] Verificar logs CloudWatch
- [ ] Conferir métricas

## 🎯 Resultado Esperado

Um sistema completo funcionando:

1. **API REST** recebendo requisições HTTP
2. **Validação de CPF** brasileira
3. **Consulta PostgreSQL** via connection pool
4. **Respostas JSON** padronizadas
5. **Error handling** robusto
6. **Clean Architecture** bem estruturada
