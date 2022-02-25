/**
 * Route: POST /addUser
 */
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });
const timestamp = Date.now();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.addUser = async (event, context) => {
  try {
    const item = JSON.parse(event.body).item;
    const headers = event.headers;
    item.user_email = headers.user_email;
    item.user_id = uuidv4();
    item.timestamp = timestamp;

    await dynamoDB
      .put({
        TableName: tableName,
        Item: item,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Add new user to revue-server-v3',
        headers,
        item,
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
