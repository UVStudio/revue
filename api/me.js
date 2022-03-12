/**
 * Route: GET /me
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.me = async (event, context) => {
  try {
    // console.log('me event: ', event);
    // console.log('me context: ', context);
    const userId = event.requestContext.authorizer.jwt.claims.userId;

    const params = {
      TableName: tableName,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :user_id',
      ExpressionAttributeValues: {
        ':user_id': userId,
      },
      Limit: 1,
    };

    const data = await dynamoDB.query(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `me handler invoked!`,
        userId,
        user: data.Items[0],
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
