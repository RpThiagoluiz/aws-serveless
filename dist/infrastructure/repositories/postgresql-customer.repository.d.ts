import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';
export declare class PostgreSQLCustomerRepository implements ICustomerRepository {
    private readonly pool;
    constructor();
    findByCpf(cpf: string): Promise<Customer | null>;
    close(): Promise<void>;
}
//# sourceMappingURL=postgresql-customer.repository.d.ts.map