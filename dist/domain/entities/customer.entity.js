"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
class Customer {
    constructor(id, cpf, name, email, createdAt, updatedAt) {
        this.id = id;
        this.cpf = cpf;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromDataSource(data) {
        return new Customer(data.id, data.cpf, data.name, data.email, new Date(data.createdAt), new Date(data.updatedAt));
    }
    toResponseData() {
        return {
            id: this.id,
            cpf: this.cpf,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}
exports.Customer = Customer;
//# sourceMappingURL=customer.entity.js.map