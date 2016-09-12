#! /usr/bin/env node

/**
 * @description the main tarballer cli file
 */

/* eslint-disable strict, new-cap */
'use strict';

const fs = require('fs');
const Spinner = require('cli-spinner').Spinner;

const upload = require('./upload');
const download = require('./download');
const writeLock = require('./writeLock');
const constants = require('./constants');
const readConfig = require('./readConfig');

const functionName = process.argv[2] || 'defaultMethod';

const methods = {
  /**
   * The default method run by cmd "tarballer"
   */
  defaultMethod: () => {
    const spinner = new Spinner('deploying tarballs.. %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();

    // get the config data
    readConfig().then(config => {
      // make an array of promises that is all the uploads
      const promises = config.packages.map(pkg => {
        // if it's just a string, it's the local path
        const packageConfig = (typeof pkg === 'string')
          ? Object.assign({}, config.defaults, { local: pkg })
          : Object.assign({}, config.defaults, pkg);
        console.log('about to call upload');
        console.log(packageConfig);
        // upload returns a promise
        return upload(packageConfig);
      });

      Promise.all(promises)
        // write the lock file
        .then(writeLock)
        .then(() => {
          spinner.stop(true);
          console.log('Tarballs deployed.');
        })
        .catch(error => {
          spinner.stop(true);
          throw error;
        });
    }).catch(err => {
      spinner.stop(true);
      console.error(err);
    });
  },


  /**
   * Initialize a tarballer.json file with the default settings
   */
  init: () => {
    // check if there is already a file?
    fs.stat('tarballer.json', (err) => {
      if (err === null) {
        console.log('It looks like you already have a tarballer.json file, run just "tarballer" to deploy your packages');
      } else if (err.code === 'ENOENT') {
        // file does not exist, create
        fs.writeFile('tarballer.json', JSON.stringify(constants.defaultConfig, null, 2), (fileErr) => {
          if (fileErr) {
            console.error(fileErr);
          } else {
            console.log('Default tarballer.json written, open up the file and customize as needed.');
          }
        });
      } else {
        console.error(err);
      }
    });
  },


  /**
   * The extract method run by cmd "tarballer extract"
   */
  extract: () => {
    const spinner = new Spinner('downloading tarballs.. %s');
    spinner.setSpinnerString('|/-\\');
    spinner.start();

    readConfig().then(config => {
      // get the file name
      fs.readFile(`${process.cwd()}/tarballer.lock.json`, 'utf8', (err, data) => {
        if (err) {
          spinner.stop(true);
          throw err;
        }

        // Make sure they have a valid tarballer file
        try {
          const tarballs = JSON.parse(data);

          // extract all the tarballs
          const promises = Object.keys(tarballs).map(local => {
            // find the config for this tarball
            let packageConfig = config.packages.find(pack => ((typeof pack === 'string') ? pack : pack.local) === local);

            // the config can be just a string that represents the remotes
            if (typeof packageConfig === 'string') {
              packageConfig = Object.assign({}, config.defaults, { local: packageConfig });
            } else {
              packageConfig = Object.assign({}, config.defaults, packageConfig);
            }

            return download(tarballs[local], local, packageConfig);
          });

          Promise.all(promises).then(() => {
            spinner.stop(true);
            console.log('Tarballs downloaded and unpacked');
          }).catch(error => {
            spinner.stop(true);
            console.error(error);
          });
        } catch (e) {
          spinner.stop(true);
          console.error('there was a problem reading your tarballer.json file');
        }
      });
    }).catch(err => {
      spinner.stop(true);
      console.error(err);
    });
  },
};

methods[functionName]();
