// Developed by Softeq Development Corporation
// http://www.softeq.com

const { compact } = require('lodash');
const { spawn } = require('child_process');
const { promisify } = require('util');

const isPromise = (value) => value ? typeof value.then === 'function' : false;

const getTargetLibraryName = () => {
  const libName = process.argv[2];
  if (!libName) {
    throw new CliError('Cannot determine target library');
  }
  return libName;
};
const getCommandArgs = () => process.argv.slice(2);

class CliError extends Error {
}

const sandbox = (fn) => {
  const promise = new Promise((resolve, reject) => {
    const result = fn();
    if (isPromise(result)) {
      result.then(resolve, reject);
    } else {
      resolve(result);
    }
  });

  promise.catch((err) => {
    if (handleError(err)) {
      return;
    }
    setTimeout(() => {
      throw err;
    });
  });
};

const handleError = (err) => {
  if (err instanceof CliError) {
    console.error(err.message);
    return true;
  }
  return false;
};

const run = (cmd, args, options) => {
  console.log('run command: ', cmd, ...args);
  const startDate = new Date();
  const success = () => {
    console.log(`command completed successfully "${wholeTime()}": `, cmd, ...args);
  };
  const error = (code) => {
    console.log(`command completed with error "${wholeTime()}": `, cmd, ...args, `code = ${code}`);
  };
  const wholeTime = () => {
    const endDate = new Date();
    const wholeTimeInMs = endDate - startDate;
    const ms = wholeTimeInMs % 1000;
    const s = ((wholeTimeInMs - ms) / 1000) % 1000;
    const m = ((wholeTimeInMs - s * 1000 - ms) / 1000 / 1000) % 1000;

    return compact([
      m ? `${m} minutes` : '',
      s ? `${s} seconds` : '',
      ms ? `${ms} milliseconds` : '',
    ]).join(', ');
  };
  return new Promise((resolve, reject) => {
    const runningCmd = spawn(cmd, args, { stdio: 'inherit', shell: true });

    runningCmd.on('close', (code) => {
      if (code === 0) {
        success();
        resolve();
      } else {
        error(code);
        reject();
      }
    })
  });
};

module.exports = { getTargetLibraryName, getCommandArgs, sandbox, run };
