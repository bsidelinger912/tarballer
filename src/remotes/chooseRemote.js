/**
 * @function chooseStorage
 * @description this function chooses from supported remote storage locations
 */

/* eslint-disable no-use-before-define */

const s3 = require('./s3');
const fileSystem = require('./fileSystem');

const supportedRemotes = [
  {
    pattern: 'https://s3.amazonaws.com',
    class: s3,
  },
  {
    pattern: '/',
    class: fileSystem,
  },
];

module.exports = {
  upload: (packageConfig, fileName, body) => new Promise((resolve, reject) => {
    const remoteUrl = packageConfig.remote;
    const thisRemote = findRemote(remoteUrl);

    if (!thisRemote) {
      reject(`Remote: ${remoteUrl} is not currently supported`);

    } else {
      // call the remote's upload function
      thisRemote.class.upload(packageConfig, fileName, body)
        .then(resolve)
        .catch(reject);
    }
  }),

  download: (remoteUrl, packageConfig) => new Promise((resolve, reject) => {
    const thisRemote = findRemote(remoteUrl);

    if (!thisRemote) {
      reject(`Remote: ${remoteUrl} is not currently supported`);

    } else {
      // call the remote's upload function
      thisRemote.class.download(remoteUrl, packageConfig)
        .then(resolve)
        .catch(reject);
    }
  }),
};

function findRemote(remoteUrl) {
  return supportedRemotes.find(remote => remoteUrl.indexOf(remote.pattern) > -1);
}
