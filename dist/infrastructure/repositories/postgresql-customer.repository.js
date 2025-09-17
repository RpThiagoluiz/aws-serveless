"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLCustomerRepository = void 0;
const pg_1 = require("pg");
const customer_entity_1 = require("../../domain/entities/customer.entity");
const customer_errors_1 = require("../../domain/errors/customer.errors");
class PostgreSQLCustomerRepository {
    constructor() {
        this.pool = new pg_1.Pool({
            host: process.env['DB_HOST'],
            port: 5432,
            database: process.env['DB_NAME'],
            user: process.env['DB_USER'],
            password: process.env['DB_PASSWORD'],
            ssl: false, // AWS RDS em ambiente de desenvolvimento
            max: 2, // Limitar conexões para Lambda
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    async findByCpf(cpf) {
        const client = await this.pool.connect();
        try {
            console.log(`Searching for customer with CPF: ${cpf}`);
            const query = 'SELECT id, cpf, name, email, created_at, updated_at FROM customers WHERE cpf = $1';
            const result = await client.query(query, [cpf]);
            if (result.rows.length === 0) {
                console.log(`Customer with CPF ${cpf} not found in PostgreSQL`);
                return null;
            }
            const row = result.rows[0];
            console.log('PostgreSQL Result:', JSON.stringify(row, null, 2));
            // Mapear resultado do PostgreSQL para DTO
            const customerData = {
                id: row.id,
                cpf: row.cpf,
                name: row.name,
                email: row.email,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            };
            return customer_entity_1.Customer.fromDataSource(customerData);
        }
        catch (error) {
            console.error('Error querying PostgreSQL:', error);
            throw new customer_errors_1.DatabaseConnectionError(error instanceof Error ? error.message : 'Unknown database error');
        }
        finally {
            client.release();
        }
    }
    // Método para fechar o pool de conexões (cleanup)
    async close() {
        await this.pool.end();
    }
}
exports.PostgreSQLCustomerRepository = PostgreSQLCustomerRepository;
//# sourceMappingURL=postgresql-customer.repository.js.map