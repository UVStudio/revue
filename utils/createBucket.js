/**
 * Helper function
 */

module.exports.createBucket = async (userName, userId) => {
  const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');
  const s3Client = new S3Client({ region: 'us-east-2' });

  const bucketParams = {
    Bucket: `revue-${userName.toLowerCase()}-${userId}`,
    Key: `${process.env.S3_SECRET}`,
    Body: 'BODY',
  };

  try {
    // Create an S3 bucket.
    console.log(`Creating bucket ${bucketParams.Bucket}`);
    await s3Client.send(
      new CreateBucketCommand({ Bucket: bucketParams.Bucket })
    );
    console.log(`Waiting for "${bucketParams.Bucket}" bucket creation...`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `createBucket`,
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
