/**
 * Route: POST /uploadObj
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

module.exports.uploadObj = async (event, context) => {
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
  const user = data.Items[0];
  const userName = user.name;

  const file = '../../../video.mp4';
  const fileStream = fs.createReadStream(file);
  // const formData = new FormData();
  // formData.append('file', )

  const bucketParams = {
    Bucket: `revue-${userName.toLowerCase()}-${userId}`,
    Key: path.basename(file),
    Body: fileStream,
    ACL: 'public-read',
  };

  try {
    console.log('uploadObj');

    // Create a command to put the object in the S3 bucket.
    const command = new PutObjectCommand(bucketParams);
    // Create the presigned URL.
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 36000,
    });
    // console.log(
    //   `Putting "${bucketParams.Key}" using signedUrl with body "${bucketParams.Body}" in v3`
    // );
    // console.log(signedUrl);
    // const data = await s3Client.send(new PutObjectCommand(bucketParams)); -- this needs to be a FE function

    console.log('Success - signedUrl: ', signedUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `uploadObj success`,
        signedUrl,
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
