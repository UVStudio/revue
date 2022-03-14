/**
 * Route: POST /createUploadURL
 */
const AWS = require('aws-sdk');
const secrets = require('../secrets.json');
AWS.config.update({ region: secrets.REGION });
const { v4: uuidv4 } = require('uuid');

const {
  S3Client,
  CreateBucketCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: secrets.REGION });

module.exports.createUploadURL = async (event, context) => {
  const bucketParams = {
    Bucket: `revue-${uuidv4()}`,
    Key: `${secrets.S3_SECRET}`,
    Body: 'BODY',
  };

  try {
    console.log('createUploadURL');

    try {
      // Create an S3 bucket.
      console.log(`Creating bucket ${bucketParams.Bucket}`);
      await s3Client.send(
        new CreateBucketCommand({ Bucket: bucketParams.Bucket })
      );
      console.log(`Waiting for "${bucketParams.Bucket}" bucket creation...`);
    } catch (err) {
      console.log('Error creating bucket', err);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `createUploadURL`,
        bucketParams,
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
