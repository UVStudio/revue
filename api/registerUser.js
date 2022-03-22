/**
 * Route: POST /registerUser
 */
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const privateKey = process.env.JWT_SECRET;
const timestamp = Date.now();
const { createBucket } = require('../utils/createBucket');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.registerUser = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    body.userId = uuidv4();
    body.timestamp = timestamp;

    const passwordHash = await bcrypt.hash(body.password, 8);

    body.password = passwordHash;

    const userEmail = body.userEmail;

    const params = {
      TableName: tableName,
      KeyConditionExpression: 'userEmail = :user_email',
      ExpressionAttributeValues: {
        ':user_email': userEmail,
      },
      Limit: 1,
    };

    const user = await dynamoDB.query(params).promise();

    if (user.Count > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Email ${body.userEmail} is already registered on our system.`,
        }),
      };
    }

    await dynamoDB
      .put({
        TableName: tableName,
        Item: body,
      })
      .promise();

    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 3600,
        userId: user.userId,
        userEmail: user.userEmail,
        timestamp: user.timestamp,
      },
      privateKey,
      {
        algorithm: 'HS256',
      }
    );

    await createBucket(body.userName, body.userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Added ${body.userName} to ${process.env.USERS_TABLE}`,
        body,
        passwordHash,
        token,
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
