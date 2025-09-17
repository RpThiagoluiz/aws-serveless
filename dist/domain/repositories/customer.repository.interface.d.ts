import { Customer } from '../entities/customer.entity';
export interface ICustomerRepository {
    findByCpf(cpf: string): Promise<Customer | null>;
}
//# sourceMappingURL=customer.repository.interface.d.ts.map