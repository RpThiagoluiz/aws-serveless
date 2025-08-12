/**
 * Hello World Use Case
 * Contains the business logic for the hello world endpoint
 */
class HelloWorldUseCase {
  /**
   * Execute the hello world logic
   * @returns {Object} Hello world data
   */
  execute() {
    try {
      const currentTime = new Date().toISOString();

      return {
        message: 'Hello World from Serverless Lambda!',
        environment: process.env.NODE_ENV || 'development',
        timestamp: currentTime,
        version: '1.0.0',
      };
    } catch (error) {
      throw new Error(
        `Failed to execute hello world use case: ${error.message}`
      );
    }
  }
}

module.exports = HelloWorldUseCase;
