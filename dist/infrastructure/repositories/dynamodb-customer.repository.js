"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDbCustomerRepository = void 0;
const aws_sdk_1 = require("aws-sdk");
const customer_entity_1 = require("../../domain/entities/customer.entity");
const customer_errors_1 = require("../../domain/errors/customer.errors");
class DynamoDbCustomerRepository {
    constructor() {
        this.dynamodb = new aws_sdk_1.DynamoDB.DocumentClient();
        this.tableName = process.env['DYNAMODB_TABLE'] || 'customers-dev';
    }
    async findByCpf(cpf) {
        try {
            const params = {
                TableName: this.tableName,
                Key: {
                    cpf: cpf,
                },
            };
            console.log('DynamoDB Query:', JSON.stringify(params, null, 2));
            const result = await this.dynamodb.get(params).promise();
            if (!result.Item) {
                console.log(`Customer with CPF ${cpf} not found in DynamoDB`);
                return null;
            }
            console.log('DynamoDB Result:', JSON.stringify(result.Item, null, 2));
            // Mapear resultado do DynamoDB para DTO
            const customerData = {
                id: result.Item['id'],
                cpf: result.Item['cpf'],
                name: result.Item['name'],
                email: result.Item['email'],
                createdAt: result.Item['createdAt'],
                updatedAt: result.Item['updatedAt'],
            };
            return customer_entity_1.Customer.fromDataSource(customerData);
        }
        catch (error) {
            console.error('Error querying DynamoDB:', error);
            throw new customer_errors_1.DatabaseConnectionError(error instanceof Error ? error.message : 'Unknown database error');
        }
    }
}
exports.DynamoDbCustomerRepository = DynamoDbCustomerRepository;
//# sourceMappingURL=dynamodb-customer.repository.js.map