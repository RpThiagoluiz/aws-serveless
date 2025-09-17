"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCustomerController = void 0;
const get_customer_use_case_1 = require("../../application/use-cases/get-customer.use-case");
const postgresql_customer_repository_1 = require("../../infrastructure/repositories/postgresql-customer.repository");
const cpf_validator_1 = require("../../utils/cpf-validator");
class GetCustomerController {
    constructor() {
        const customerRepository = new postgresql_customer_repository_1.PostgreSQLCustomerRepository();
        this.getCustomerUseCase = new get_customer_use_case_1.GetCustomerUseCase(customerRepository);
    }
    async handle(event, context) {
        console.log('Lambda Event:', JSON.stringify(event, null, 2));
        console.log('Lambda Context:', JSON.stringify(context, null, 2));
        try {
            // Extrair CPF do query parameter
            const cpfParam = event.queryStringParameters?.['cpf'];
            if (!cpfParam) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Methods': 'GET,OPTIONS',
                    },
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'MISSING_CPF',
                            message: 'CPF query parameter is required',
                        },
                    }),
                };
            }
            // Validar e limpar CPF
            const { isValid, cleanCpf } = cpf_validator_1.CpfValidator.validateAndClean(cpfParam);
            if (!isValid) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Methods': 'GET,OPTIONS',
                    },
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'INVALID_CPF',
                            message: 'CPF is not valid',
                        },
                    }),
                };
            }
            // Executar use case com CPF limpo
            const result = await this.getCustomerUseCase.execute(cleanCpf);
            // Determinar status code baseado no resultado
            const statusCode = result.success
                ? 200
                : this.getErrorStatusCode(result.error?.code);
            return {
                statusCode,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS',
                },
                body: JSON.stringify(result),
            };
        }
        catch (error) {
            console.error('Unexpected error in GetCustomerController:', error);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS',
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'An unexpected error occurred',
                    },
                }),
            };
        }
    }
    getErrorStatusCode(errorCode) {
        switch (errorCode) {
            case 'CUSTOMER_NOT_FOUND':
                return 404;
            case 'INVALID_CPF':
                return 400;
            case 'INTERNAL_ERROR':
            default:
                return 500;
        }
    }
}
exports.GetCustomerController = GetCustomerController;
//# sourceMappingURL=get-customer.controller.js.map