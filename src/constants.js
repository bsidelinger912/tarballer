/**
 * @description shared application constants
 */

module.exports = {
  bucketName: 'npm-tarballs',
  defaultConfig: {
    // just send npm packages to s3 by default
    /* packages: [
      {
        local: './node_modules',
        remote: 'https://s3.amazonaws.com/npm-tarballs/',
      },
    ],*/

    defaults: {
      remote: 'https://s3.amazonaws.com/npm-tarballs/',
      exclusions: [],
    },
    packages: [
      './node_modules',
    ],
  },
};
