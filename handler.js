'use strict';

const HelloWorldController = require('./src/controllers/helloWorldController');

// Initialize controller
const helloWorldController = new HelloWorldController();

/**
 * Lambda handler for Hello World endpoint
 * @param {Object} event - AWS Lambda event object
 * @param {Object} context - AWS Lambda context object
 * @returns {Object} HTTP response
 */
module.exports.hello = async (event, context) => {
  // Set context to avoid timeout issues
  context.callbackWaitsForEmptyEventLoop = false;

  return await helloWorldController.getHelloWorld(event);
};
