/**
 * Route: GET /getUser
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.getUser = async (event, context) => {
  try {
    const userId = decodeURIComponent(event.pathParameters.user_id);
    const params = {
      TableName: tableName,
      IndexName: 'user_id-index',
      KeyConditionExpression: 'user_id = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      },
      Limit: 1,
    };

    const data = await dynamoDB.query(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User ID ${userId}`,
        data,
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
