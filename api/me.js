/**
 * Route: GET /me
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });

const { getUserInfo } = require('../utils/getUserInfo');

module.exports.me = async (event, context) => {
  try {
    const userId = event.requestContext.authorizer.jwt.claims.userId;
    const user = await getUserInfo(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
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
