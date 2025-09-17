"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomer = void 0;
const get_customer_controller_1 = require("./presentation/controllers/get-customer.controller");
// Instância única do controller para reutilização em execuções Lambda
const getCustomerController = new get_customer_controller_1.GetCustomerController();
/**
 * Lambda handler for getting customer by CPF
 *
 * @param event - API Gateway event
 * @param context - Lambda context
 * @returns Promise<APIGatewayProxyResult>
 */
const getCustomer = async (event, context) => {
    return getCustomerController.handle(event, context);
};
exports.getCustomer = getCustomer;
//# sourceMappingURL=handler.js.map