/**
 * @function upload
 * @description handles reading the folder, gzipping and uploading a package group
 */

/* eslint-disable new-cap */

const fs = require('fs-extra');
const uuid = require('node-uuid');
const tar = require('tar');
const zlib = require('zlib');
const fstream = require('fstream');
const path = require('path');

const chooseRemote = require('../remotes/chooseRemote');

module.exports = (packageConfig) => new Promise((resolve, reject) => {
  const folderName = packageConfig.local.split('/').pop();
  const fileId = uuid.v1();
  const fileName = `${folderName}.${fileId}.tar.gz`;
  const tempFolder = `./tarballer_temp_${folderName}`;

  // copy local directory into temp
  fs.copy(path.join(process.cwd(), packageConfig.local), path.join(process.cwd(), tempFolder), (err) => {
    if (err) {
      reject(err);
    }

    // delete the exclusions
    const exclusions = (packageConfig.exclusions || []).map(exclusion => new Promise((res, rej) => {
      fs.remove(path.join(tempFolder, exclusion), (error) => {
        if (error) {
          rej(error);
        } else {
          res();
        }
      });
    }));

    Promise.all(exclusions)
      .then(() => {

        // Create the tarball
        const body = fstream.Reader({ path: tempFolder, type: 'Directory' })
          .on('error', (er) => {
            reject(`An error occurred reading node modules: ${er}`);
          })
          .pipe(tar.Pack({ noProprietary: true }))
          .pipe(zlib.Gzip());

        // upload to remote store
        chooseRemote.upload(packageConfig, fileName, body).then(() => {

          // clean up the temp folder now
          fs.remove(tempFolder, (e) => {
            if (e) {
              reject(e);
            } else {
              // resolve with the name value pair of local:remote
              resolve([packageConfig.local, `${packageConfig.remote}${fileName}`]);
            }
          });
        }).catch(reject);
      }).catch(reject);
  });
});
