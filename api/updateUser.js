/**
 * Route: Put /updateUser
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });
const { getUserInfo } = require('../utils/getUserInfo');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.updateUser = async (event, context) => {
  try {
    const { userId, userEmail, timestamp } =
      event.requestContext.authorizer.user;
    const body = JSON.parse(event.body);

    await dynamoDB
      .update({
        TableName: tableName,
        Key: {
          userEmail,
          timestamp,
        },
        UpdateExpression: 'set company = :company, userName = :userName',

        ExpressionAttributeValues: {
          ':company': body.company,
          ':userName': body.userName,
        },
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

// const params = {
//   TableName: tableName,
//   IndexName: 'userId-index',
//   KeyConditionExpression: 'userId = :user_id',
//   ExpressionAttributeValues: {
//     ':user_id': userId,
//   },
//   Limit: 1,
// };

// const data = await dynamoDB.query(params).promise();

// if (data.Count === 0) {
//   return {
//     statusCode: 400,
//     body: JSON.stringify({
//       message: `${userId} does not exist on the system.`,
//     }),
//   };
// }
