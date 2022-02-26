/**
 * Route: POST /registerUser
 */
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });
const bcrypt = require('bcryptjs');
const timestamp = Date.now();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.registerUser = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    body.userId = uuidv4();
    body.timestamp = timestamp;

    const passwordHash = await bcrypt.hash(body.password, 8);

    await dynamoDB
      .put({
        TableName: tableName,
        Item: body,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Added ${body.name} to ${process.env.USERS_TABLE}`,
        body,
        passwordHash,
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
