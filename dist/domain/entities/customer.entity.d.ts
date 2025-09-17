export declare class Customer {
    readonly id: string;
    readonly cpf: string;
    readonly name: string;
    readonly email: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, cpf: string, name: string, email: string, createdAt: Date, updatedAt: Date);
    static fromDataSource(data: {
        id: string;
        cpf: string;
        name: string;
        email: string;
        createdAt: string;
        updatedAt: string;
    }): Customer;
    toResponseData(): {
        id: string;
        cpf: string;
        name: string;
        email: string;
        createdAt: string;
        updatedAt: string;
    };
}
//# sourceMappingURL=customer.entity.d.ts.map