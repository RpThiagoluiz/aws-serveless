# Solução para IAM Role - AWS Academy

## ❌ **Problema Original**

```
CREATE_FAILED: IamRoleLambdaExecution (AWS::IAM::Role)
User: arn:aws:sts::***:assumed-role/voclabs/user*** is not authorized to perform: iam:CreateRole
```

## ✅ **Solução Implementada**

### **Estratégia: Usar Role Existente**

Similar ao que fizemos com o RDS, vamos usar a role `LabRole` que já existe no AWS Academy.

### **Arquivos Criados:**

#### 1. **serverless-prod.yml** (Produção)

```yaml
provider:
  name: aws
  runtime: nodejs18.x
  stage: ${opt:stage, 'dev'}
  region: ${opt:region, 'us-east-1'}

  # Use existing LabRole for AWS Academy
  iam:
    role: ${env:AWS_ROLE_ARN}

  environment:
    DB_HOST: ${env:DB_HOST}
    DB_NAME: ${env:DB_NAME}
    DB_USER: ${env:DB_USER}
    DB_PASSWORD: ${env:DB_PASSWORD}
```

#### 2. **serverless.yml** (Desenvolvimento)

```yaml
provider:
  name: aws
  runtime: nodejs18.x
  # SEM configuração de iam.role
  # Permite teste local sem credenciais AWS

  environment:
    DB_HOST: ${env:DB_HOST, 'localhost'}
    DB_NAME: ${env:DB_NAME, 'customers_db'}
    # Com defaults para desenvolvimento
```

### **GitHub Actions Atualizado:**

```yaml
- name: Deploy Customer Lambda
  run: sls deploy --stage prod --config serverless-prod.yml
  env:
    AWS_ROLE_ARN: ${{ secrets.FIAP_POS_AWS_ROLE_ARN }}
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_NAME: ${{ secrets.DB_NAME }}
    DB_USER: ${{ secrets.DB_USER }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

## 🔧 **Como Funciona**

### **Desenvolvimento Local:**

```bash
# Usa serverless.yml sem role (permite teste sem AWS)
npx sls package --stage dev
```

### **Deploy Produção:**

```bash
# Usa serverless-prod.yml com LabRole
sls deploy --stage prod --config serverless-prod.yml
```

## 🚀 **Próximos Passos**

1. **Configurar Secret no GitHub:**

   - `FIAP_POS_AWS_ROLE_ARN`: `arn:aws:iam::ACCOUNT_ID:role/LabRole`

2. **Fazer Push das Mudanças**

3. **Deploy Automático:** GitHub Actions usará a role existente

## ✅ **Status**

- [x] Configuração dual (dev/prod)
- [x] Role IAM externa configurada
- [x] GitHub Actions atualizado
- [x] Teste local funcionando
- [ ] Deploy em produção (pending push)

## 📝 **Vantagens desta Abordagem**

- ✅ Não precisa criar roles IAM
- ✅ Compatível com AWS Academy
- ✅ Desenvolvimento local sem credenciais
- ✅ Produção usa role segura
- ✅ Mesmo padrão usado no RDS
