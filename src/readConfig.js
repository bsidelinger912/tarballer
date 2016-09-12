/**
 * @function readConfig
 * @description reads the local tarballer.json file and uses default config if not found
 */

const fs = require('fs');
const constants = require('./constants');

module.exports = () => new Promise((resolve, reject) => {
  fs.readFile(`${process.cwd()}/tarballer.json`, 'utf8', (err, data) => {
    // some logic to detirmine configuration
    if (err) {
      // if we don't have a tarballer.json, we'll just use default npm tarballing
      resolve(constants.defaultConfig);
    } else {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject('could not read tarballer.json file!');
      }
    }
  });
});
