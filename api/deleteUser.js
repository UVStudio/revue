/**
 * Route: DELETE /deleteUser
 */
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.deleteUser = async (event, context) => {
  try {
    const userId = decodeURIComponent(event.pathParameters.userId);
    const data = JSON.parse(event.body);
    const params = {
      TableName: tableName,
      Key: {
        userEmail: data.email,
        timestamp: data.timestamp,
      },
      Limit: 1,
    };

    await dynamoDB.delete(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${userId} deleted`,
        params,
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
