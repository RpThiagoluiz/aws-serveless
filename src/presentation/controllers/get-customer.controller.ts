import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { GetCustomerUseCase } from '../../application/use-cases/get-customer.use-case';
import { PostgreSQLCustomerRepository } from '../../infrastructure/repositories/postgresql-customer.repository';
import { CpfValidator } from '../../utils/cpf-validator';

export class GetCustomerController {
  private readonly getCustomerUseCase: GetCustomerUseCase;

  constructor() {
    const customerRepository = new PostgreSQLCustomerRepository();
    this.getCustomerUseCase = new GetCustomerUseCase(customerRepository);
  }

  public async handle(
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> {
    console.log('Lambda Event:', JSON.stringify(event, null, 2));
    console.log('Lambda Context:', JSON.stringify(context, null, 2));

    try {
      // Extrair CPF do query parameter
      const cpfParam = event.queryStringParameters?.['cpf'];

      if (!cpfParam) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers':
              'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
          },
          body: JSON.stringify({
            success: false,
            error: {
              code: 'MISSING_CPF',
              message: 'CPF query parameter is required',
            },
          }),
        };
      }

      // Validar e limpar CPF
      const { isValid, cleanCpf } = CpfValidator.validateAndClean(cpfParam);

      if (!isValid) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers':
              'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
          },
          body: JSON.stringify({
            success: false,
            error: {
              code: 'INVALID_CPF',
              message: 'CPF is not valid',
            },
          }),
        };
      }

      // Executar use case com CPF limpo
      const result = await this.getCustomerUseCase.execute(cleanCpf);

      // Determinar status code baseado no resultado
      const statusCode = result.success
        ? 200
        : this.getErrorStatusCode(result.error?.code);

      return {
        statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers':
            'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error('Unexpected error in GetCustomerController:', error);

      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers':
            'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        }),
      };
    }
  }

  private getErrorStatusCode(errorCode?: string): number {
    switch (errorCode) {
      case 'CUSTOMER_NOT_FOUND':
        return 404;
      case 'INVALID_CPF':
        return 400;
      case 'INTERNAL_ERROR':
      default:
        return 500;
    }
  }
}
