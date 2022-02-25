/**
 * Route: GET /getUserByEmail
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.getUserByEmail = async (event, context) => {
  try {
    //const item = JSON.parse(event.body).item;
    //const email = item.user_email;
    const headers = event.headers;
    const email = headers.user_email;
    const params = {
      TableName: tableName,
      //IndexName: 'user_email-index',
      KeyConditionExpression: 'user_email = :user_email',
      ExpressionAttributeValues: {
        ':user_email': email,
      },
      Limit: 1,
    };

    const data = await dynamoDB.query(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User: ${email}`,
        email,
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
