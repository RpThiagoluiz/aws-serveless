"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectionError = exports.InvalidCpfError = exports.CustomerNotFoundError = void 0;
class CustomerNotFoundError extends Error {
    constructor(cpf) {
        super(`Customer with CPF ${cpf} not found`);
        this.name = 'CustomerNotFoundError';
    }
}
exports.CustomerNotFoundError = CustomerNotFoundError;
class InvalidCpfError extends Error {
    constructor(cpf) {
        super(`Invalid CPF format: ${cpf}`);
        this.name = 'InvalidCpfError';
    }
}
exports.InvalidCpfError = InvalidCpfError;
class DatabaseConnectionError extends Error {
    constructor(message) {
        super(`Database connection error: ${message}`);
        this.name = 'DatabaseConnectionError';
    }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
//# sourceMappingURL=customer.errors.js.map