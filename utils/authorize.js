/**
 * Helper function
 */
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const privateKey = process.env.JWT_SECRET;
AWS.config.update({ region: 'us-east-2' });

module.exports.authorize = async (event, context) => {
  const token = event.headers.Authorization;

  const decoded = jwt.verify(token, privateKey);
  const { userId, userEmail, timestamp } = decoded;

  try {
    return {
      principalId: userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: [
              'arn:aws:execute-api:us-east-2:random-account-id:random-api-id/dev/GET/me',
              'arn:aws:execute-api:us-east-2:random-account-id:random-api-id/dev/PUT/me/updateUser',
              'arn:aws:execute-api:us-east-2:random-account-id:random-api-id/dev/POST/me/presignedUrl',
            ],
          },
        ],
      },
      context: {
        org: 'revue',
        role: 'user',
        user: { userId, userEmail, timestamp },
      },
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
