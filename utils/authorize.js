/**
 * Route:
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });
const jwt = require('jsonwebtoken');
const secrets = require('../secrets.json');
const privateKey = secrets.JWT_SECRET;

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.authorize = async (event, context) => {
  const token = event.headers.Authorization;

  console.log('event: ', event);

  const decoded = jwt.verify(token, privateKey);
  const userId = decoded.userId;

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
              'arn:aws:execute-api:us-east-2:random-account-id:random-api-id/dev/POST/createUploadURL',
            ],
          },
        ],
      },
      context: {
        org: 'revue',
        role: 'user',
        createdAt: Date.now(),
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
