/**
 * @class fileSystem
 * @description handles uploading to local and remote file systems via ssh
 */

/* eslint-disable new-cap, no-use-before-define */

const Client = require('ssh2').Client;
const fs = require('fs');

module.exports = {
  /**
   * Upload to remote or local file system
   */
  upload: (packageConfig, fileName, body) => new Promise((resolve, reject) => {
    // detirmine if we're local or remote filesystem
    if (isRemote(packageConfig)) {
      if (!packageConfig.privateKey) {
        return reject('You need a private key for remote servers');
      }

      const [username, hostLocation] = packageConfig.remote.split('@');
      const [host, path] = hostLocation.split(/\/(.+)/);

      const connection = new Client();

      connection.on('ready', () => {
        connection.sftp((err, sftp) => {
          if (err) {
            connection.end();
            reject(`sftp error: ${err}`);
          }

          // create write stream to pipe to
          const writeStream = sftp.createWriteStream(`/${path}/${fileName}`)
            .on('close', () => {
              sftp.end();
              connection.end();
              resolve();
            }).on('error', error => {
              reject(`write stream error: ${error}`);
            });

          // upload file
          body.pipe(writeStream);
        });
      }).connect({
        host,
        username,
        privateKey: fs.readFileSync(packageConfig.privateKey),
        passphrase: packageConfig.passphrase, // TODO: prompt for this!!!!
      });
    } else {
      // create write stream to pipe to
      const writeStream = fs.createWriteStream(`/${packageConfig.remote}/${fileName}`)
        .on('close', () => {
          resolve();
        }).on('error', error => {
          reject(`write stream error: ${error}`);
        });

      // write file
      body.pipe(writeStream);
    }
  }),


  download: (remoteUrl, packageConfig) => new Promise((resolve, reject) => {
    // detirmine if we're local or remote filesystem
    if (isRemote(packageConfig || { remote: remoteUrl })) {
      if (!packageConfig) {
        return reject('Couldn\'t find configuration for ${remoteUrl} in tarballer.json');
      } else if (!packageConfig.privateKey) {
        return reject('You need a private key for remote servers');
      }

      const [username, hostLocation] = remoteUrl.split('@');
      const [host, pathAndFile] = hostLocation.split(/\/(.+)/);

      const connection = new Client();

      connection.on('ready', () => {
        connection.sftp((err, sftp) => {
          if (err) {
            connection.end();
            reject(`sftp error: ${err}`);
          }

          // read the remote file
          const readStream = sftp.createReadStream(`/${pathAndFile}`)
            .on('close', () => {
              sftp.end();
              connection.end();
            }).on('error', error => {
              reject(`read stream error: ${error}`);
            });

          resolve(readStream);
        });
      }).connect({
        host,
        username,
        privateKey: fs.readFileSync(packageConfig.privateKey),
        passphrase: packageConfig.passphrase, // TODO: prompt for this!!!!
      });
    } else {
      // create a read stream from remote
      const readStream = fs.createReadStream(remoteUrl)
        .on('error', error => {
          reject(`write stream error: ${error}`);
        });

      resolve(readStream);
    }
  }),
};

function isRemote(packageConfig) {
  return packageConfig.remote.indexOf('@') > -1;
}
