/**
 * Route: POST /presignedUrl
 */
const AWS = require('aws-sdk');
const secrets = require('../secrets.json');
AWS.config.update({ region: secrets.REGION });
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: secrets.REGION });

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.presignedUrl = async (event, context) => {
  const userId = event.requestContext.authorizer.jwt.claims.userId;
  const body = JSON.parse(event.body);
  const fileNames = body.fileNames; //Array
  const signedUrlArray = [];

  const params = {
    TableName: tableName,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :user_id',
    ExpressionAttributeValues: {
      ':user_id': userId,
    },
    Limit: 1,
  };

  //User authentication
  const data = await dynamoDB.query(params).promise();
  const user = data.Items[0];
  const userName = user.name;

  try {
    for (let i = 0; i < fileNames.length; i++) {
      const bucketParams = {
        Bucket: `revue-${userName.toLowerCase()}-${userId}`,
        Key: `${userName}/${fileNames[i]}`,
        ACL: 'public-read',
      };

      // Create a command to put the object in the S3 bucket.
      const command = new PutObjectCommand(bucketParams);

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 360000,
      });

      signedUrlArray.push({
        fileName: fileNames[i],
        signedUrl,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `presignedUrl generated`,
        signedUrlArray,
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
