/**
 * @function download
 * @description this handles downloading the tarball from the users S3 and writing to the local node_modules folder
 */

/* eslint-disable new-cap */

const tar = require('tar');
const zlib = require('zlib');
const path = require('path');

const chooseRemote = require('../remotes/chooseRemote');

module.exports = (remoteUrl, localPath, packageConfig) => new Promise((resolve, reject) => {
  // download from the chosen remote
  chooseRemote.download(remoteUrl, packageConfig)
    .then(stream => {
      // back with the stream, unzip and push to folder
      stream.pipe(zlib.createGunzip())
        // extract to local path
        .pipe(tar.Extract({ path: path.join(process.cwd(), localPath), strip: 1 }))
        .on('finish', () => {
          resolve();
        })
        .on('error', readErr => {
          reject(readErr);
        });
    })
    .catch(reject);
});
