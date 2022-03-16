/**
 * Route: GET /getUser
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });

const { getUserInfo } = require('../utils/getUserInfo');

module.exports.getUser = async (event, context) => {
  try {
    const userId = decodeURIComponent(event.pathParameters.userId);
    const user = await getUserInfo(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User ID ${userId}`,
        user,
      }),
    };
  } catch (err) {
    console.log(err.message);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error',
      }),
    };
  }
};
