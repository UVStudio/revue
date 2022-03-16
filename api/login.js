/**
 * Route: POST /login
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const privateKey = process.env.JWT_SECRET;

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.login = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const userEmail = body.userEmail;

    const params = {
      TableName: tableName,
      KeyConditionExpression: 'userEmail = :user_email',
      ExpressionAttributeValues: {
        ':user_email': userEmail,
      },
      Limit: 1,
    };

    const data = await dynamoDB.query(params).promise();

    if (data.Count === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'User not found',
        }),
      };
    }

    const user = data.Items[0];

    const match = await bcrypt.compare(body.password, user.password);

    if (!match) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Password incorrect',
        }),
      };
    }

    const token = jwt.sign(
      { exp: Math.floor(Date.now() / 1000) + 60 * 3600, userId: user.userId },
      privateKey,
      {
        algorithm: 'HS256',
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: data.Items[0],
        body,
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
