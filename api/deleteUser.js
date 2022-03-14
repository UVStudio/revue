/**
 * Route: DELETE /deleteUser
 */
const AWS = require('aws-sdk');
const secrets = require('../secrets.json');
AWS.config.update({ region: secrets.REGION });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

const { deleteBucket } = require('../utils/deleteBucket');

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
    await deleteBucket(data.name, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${data.email} deleted`,
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
