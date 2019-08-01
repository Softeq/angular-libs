// Developed by Softeq Development Corporation
// http://www.softeq.com

const { isPromise } = require('lodash');

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

module.exports = { getTargetLibraryName, getCommandArgs, sandbox };

