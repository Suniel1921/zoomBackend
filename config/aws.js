const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize S3 for file uploads
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

module.exports = {
  s3,
  BUCKET_NAME,
  uploadToS3: async (file, key) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };

    return s3.upload(params).promise();
  },
  getSignedUrl: (key) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: 60 * 5 // URL expires in 5 minutes
    };

    return s3.getSignedUrlPromise('getObject', params);
  }
};