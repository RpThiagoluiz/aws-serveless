"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCustomerUseCase = void 0;
const customer_errors_1 = require("../../domain/errors/customer.errors");
const cpf_validator_1 = require("../../utils/cpf-validator");
class GetCustomerUseCase {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async execute(cpf) {
        try {
            // Limpar e validar CPF
            const cleanCpf = cpf_validator_1.CpfValidator.clean(cpf);
            if (!cpf_validator_1.CpfValidator.isValid(cleanCpf)) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_CPF',
                        message: `Invalid CPF format: ${cpf}`,
                    },
                };
            }
            // Buscar customer usando CPF limpo
            const customer = await this.customerRepository.findByCpf(cleanCpf);
            if (!customer) {
                return {
                    success: false,
                    error: {
                        code: 'CUSTOMER_NOT_FOUND',
                        message: `Customer with CPF ${cpf} not found`,
                    },
                };
            }
            return {
                success: true,
                data: customer.toResponseData(),
            };
        }
        catch (error) {
            console.error('Error in GetCustomerUseCase:', error);
            if (error instanceof customer_errors_1.CustomerNotFoundError) {
                return {
                    success: false,
                    error: {
                        code: 'CUSTOMER_NOT_FOUND',
                        message: error.message,
                    },
                };
            }
            if (error instanceof customer_errors_1.InvalidCpfError) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_CPF',
                        message: error.message,
                    },
                };
            }
            return {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred',
                },
            };
        }
    }
}
exports.GetCustomerUseCase = GetCustomerUseCase;
//# sourceMappingURL=get-customer.use-case.js.map