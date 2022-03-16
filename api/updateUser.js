/**
 * Route: Put /updateUser
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const { getUserInfo } = require('../utils/getUserInfo');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.updateUser = async (event, context) => {
  try {
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

    if (data.Count === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `${userId} does not exist on the system.`,
        }),
      };
    }

    const body = JSON.parse(event.body);

    console.log('body:', body);

    await dynamoDB
      .put({
        TableName: tableName,
        Item: body,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User id: ${userId} is being updated.`,
        body,
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
