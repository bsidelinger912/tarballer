/**
 * @class s3
 * @description this handles uploading and downloading the tarball to the users S3
 */

/* eslint-disable no-use-before-define, new-cap */

// const tar = require('tar');
const AWS = require('aws-sdk');
// const zlib = require('zlib');

module.exports = {
  /**
   * upload to S3
   */
  upload: (packageConfig, fileName, body) => new Promise((resolve, reject) => {
    const remoteUrl = packageConfig.remote;
    const bucketName = getBucketName(remoteUrl); // .split('aws.com/').pop().replace('/', '');

    const s3 = new AWS.S3();
    const params = { Bucket: bucketName, Key: fileName, Body: body };

    // check if bucket exists
    s3.headBucket({ Bucket: bucketName }, (err) => {
      // if there's an error we need to create the bucket
      if (err) {
        if (err.originalError && err.originalError.code === 'CredentialsError') {
          reject('Could not find AWS credentials.');
        } else {
          s3.createBucket({ Bucket: bucketName }, (error) => {
            if (error) {
              reject(error);
            } else {
              doUpload(s3, params, resolve, reject);
            }
          });
        }
      } else {
        doUpload(s3, params, resolve, reject);
      }
    });
  }),

  /**
   * download from s3
   */
  download: (remoteUrl) => new Promise((resolve, reject) => {
    // download from s3 and unzip/untar
    const s3 = new AWS.S3();
    const bucketName = getBucketName(remoteUrl);
    const fileName = getFileName(remoteUrl);
    const params = { Bucket: bucketName, Key: fileName };

    // check if the tarball exists
    s3.headObject(params, (err) => {
      if (err) {
        reject('Tarball not foundo on your S3 bucket');
      } else {
        resolve(s3.getObject({ Bucket: bucketName, Key: fileName }).createReadStream());
      }
    });
  }),
};

function getBucketName(remoteUrl) {
  return remoteUrl.split('aws.com/').pop().split('/').shift();
}

function getFileName(remoteUrl) {
  return remoteUrl.split('/').pop();
}

// this does the actual upload after the bucket is verified/created.
function doUpload(s3, params, resolve, reject) {
  s3.upload(params)
    // .on('httpUploadProgress', (evt) => { console.log(evt); })
    .send((err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
}
