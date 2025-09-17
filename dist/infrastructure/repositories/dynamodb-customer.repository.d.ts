import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';
export declare class DynamoDbCustomerRepository implements ICustomerRepository {
    private readonly dynamodb;
    private readonly tableName;
    constructor();
    findByCpf(cpf: string): Promise<Customer | null>;
}
//# sourceMappingURL=dynamodb-customer.repository.d.ts.map