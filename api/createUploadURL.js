/**
 * Route: POST /createUploadURL
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.createUploadURL = async (event, context) => {
  try {
    console.log('createUploadURL');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `createUploadURL`,
        event,
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
