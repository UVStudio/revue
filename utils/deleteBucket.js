/**
 * Helper function
 */

module.exports.deleteBucket = async (userName, userId) => {
  const { S3Client, DeleteBucketCommand } = require('@aws-sdk/client-s3');
  const secrets = require('../secrets.json');
  const s3Client = new S3Client({ region: secrets.REGION });

  const bucketParams = {
    Bucket: `revue-${userName.toLowerCase()}-${userId}`,
    Key: `${secrets.S3_SECRET}`,
    Body: 'BODY',
  };

  try {
    // Delete the S3 bucket.
    console.log(`Deleting bucket ${bucketParams.Bucket}`);
    await s3Client.send(
      new DeleteBucketCommand({ Bucket: bucketParams.Bucket })
    );

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
