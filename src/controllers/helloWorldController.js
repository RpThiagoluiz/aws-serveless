const HelloWorldUseCase = require('../usecases/helloWorldUseCase');
const ResponseHelper = require('../utils/responseHelper');

/**
 * Hello World Controller
 * Handles HTTP requests for hello world endpoint
 */
class HelloWorldController {
  constructor() {
    this.helloWorldUseCase = new HelloWorldUseCase();
  }

  /**
   * Handle GET request for hello world
   * @param {Object} event - AWS Lambda event object
   * @returns {Object} HTTP response
   */
  async getHelloWorld(event) {
    try {
      console.log(
        'Hello World request received:',
        JSON.stringify(event.requestContext?.requestId || 'unknown')
      );

      const result = this.helloWorldUseCase.execute();

      return ResponseHelper.success(
        result,
        'Hello world retrieved successfully'
      );
    } catch (error) {
      console.error('Error in HelloWorldController:', error);

      return ResponseHelper.error(
        'Failed to get hello world',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  }
}

module.exports = HelloWorldController;
