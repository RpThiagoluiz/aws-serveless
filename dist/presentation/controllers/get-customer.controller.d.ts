import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
export declare class GetCustomerController {
    private readonly getCustomerUseCase;
    constructor();
    handle(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
    private getErrorStatusCode;
}
//# sourceMappingURL=get-customer.controller.d.ts.map