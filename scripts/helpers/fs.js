// Developed by Softeq Development Corporation
// http://www.softeq.com

const fs = require('fs');
const path = require('path');
const util = require('util');

const { isNil, max } = require('lodash');

const fsReadFile = util.promisify(fs.readFile);
const fsAccess = util.promisify(fs.access);
const fsStat = util.promisify(fs.stat);
const fsReaddir = util.promisify(fs.readdir);
const fsCopyFile = util.promisify(fs.copyFile);

const copyFile = (filePath, dirPath) => fsCopyFile(filePath, path.join(dirPath, path.basename(filePath)));

const statLastModifiedDateMs = (stat) => max([stat.birthtimeMs, stat.atimeMs, stat.mtimeMs, stat.ctimeMs]);

const fsLastModifiedDate = (startDir) => {
  const queue = [startDir];
  let minDateMs = 0;

  let complete;
  let error;

  const promise = new Promise((resolve, reject) => {
    complete = resolve;
    error = reject;
  });

  const readNext = () => {
    const path = queue.pop();

    if (isNil(path)) {
      complete(minDateMs || void 0);
      return;
    }

    fsAccess(path)
      .then(() =>
        fsStat(path)
          .then((stat) => {
            if (stat.isFile()) {
              const lastModifiedDateMs = statLastModifiedDateMs(stat);
              if (lastModifiedDateMs > minDateMs) {
                minDateMs = lastModifiedDateMs;
              }

              readNext();
            } else if (stat.isDirectory()) {
              readDirectory(path);
            }
          })
          .catch(error))
      .catch(() => readNext());
  };

  const readDirectory = (dirPath) => {
    fsReaddir(dirPath)
      .then((names) => {
        names.forEach((name) => queue.push(path.join(dirPath, name)));
        readNext();
      })
      .catch(error)
  };

  readNext();

  return promise;
};

module.exports = { copyFile, fsReadFile, fsLastModifiedDate };
