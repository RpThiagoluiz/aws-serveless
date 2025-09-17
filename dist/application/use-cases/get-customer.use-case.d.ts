import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { GetCustomerResponseDTO } from '../../domain/dtos/get-customer-response.dto';
export declare class GetCustomerUseCase {
    private readonly customerRepository;
    constructor(customerRepository: ICustomerRepository);
    execute(cpf: string): Promise<GetCustomerResponseDTO>;
}
//# sourceMappingURL=get-customer.use-case.d.ts.map