/**
 * helper function
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.getUserInfo = async (userId) => {
  try {
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

    if (data.Count === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `${userId} does not exist on the system.`,
        }),
      };
    }

    const user = data.Items[0];

    return user;
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
