/**
 * @function writeLock
 * @description writese the tarballer.lock.json file that is read to download tarballs
 */

const fs = require('fs');

module.exports = (packages) => new Promise((resolve, reject) => {
  // map the packages to object
  const fileObj = packages.reduce((obj, [name, value]) => {
    const returnObj = Object.assign({}, obj);
    returnObj[name] = value;
    return returnObj;
  }, {});

  // now write the tarball info to the lock file
  fs.writeFile('tarballer.lock.json', JSON.stringify(fileObj, null, 2), (fileErr) => {
    if (fileErr) {
      reject(fileErr);
    } else {
      resolve();
    }
  });
});
