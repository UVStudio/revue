/**
 * Helper function https://stackoverflow.com/questions/67423667/aws-nodejs-sdk-cannot-delete-object
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjects.html
 * https://www.tabnine.com/code/javascript/functions/aws-sdk/S3/deleteObjects
 */

module.exports.deleteObject = async (userName, userId) => {
  const { S3Client, DeleteBucketCommand } = require('@aws-sdk/client-s3');
  const s3Client = new S3Client({ region: 'us-east-2' });

  const bucketParams = {
    Bucket: `revue-${userName.toLowerCase()}-${userId}`,
    Key: `${process.env.S3_SECRET}`,
    Body: 'BODY',
  };

  try {
    // Delete S3 object.

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `deleteBucket ${bucketParams.Bucket}`,
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
