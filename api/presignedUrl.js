/**
 * Route: POST /presignedUrl
 */
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getUserInfo } = require('../utils/getUserInfo');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.presignedUrl = async (event, context) => {
  const userId = event.requestContext.authorizer.jwt.claims.userId;
  const body = JSON.parse(event.body);
  const timestamp = Date.now();

  const fileNames = body.fileNames; //Array
  const signedUrlArray = [];

  const user = await getUserInfo(userId);
  const userName = user.name;

  try {
    for (let i = 0; i < fileNames.length; i++) {
      const bucketParams = {
        Bucket: `revue-${userName.toLowerCase()}-${userId}`,
        Key: `${timestamp}/${fileNames[i]}`,
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
