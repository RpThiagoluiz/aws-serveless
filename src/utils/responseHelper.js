/**
 * Response utility for standardizing API responses
 */
class ResponseHelper {
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  static error(
    message = 'Internal Server Error',
    statusCode = 500,
    details = null
  ) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        success: false,
        message,
        details,
        timestamp: new Date().toISOString(),
      }),
    };
  }
}

module.exports = ResponseHelper;
