// Developed by Softeq Development Corporation
// http://www.softeq.com

const { loadPackage, validateLibraryPackage } = require('./helpers/repository');
const { getCommandArgs, getTargetLibraryName, sandbox } = require('./helpers/cli');
const { npmVersion } = require('./helpers/npm');

sandbox(() => {
  const libName = getTargetLibraryName();

  return loadPackage(libName)
    .then(validateLibraryPackage)
    .then((pkg) => npmVersion(pkg, getCommandArgs()));
});
