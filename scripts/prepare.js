// Developed by Softeq Development Corporation
// http://www.softeq.com

const { buildPackageTreeIfChanged, loadPackageTree, validateLibraryPackage } = require('./helpers/repository');
const { getTargetLibraryName, sandbox } = require('./helpers/cli');
const { getPackageDistPath, getProjectPath } = require('./helpers/path');
const { copyFile } = require('./helpers/fs');

sandbox(() => {
  const libName = getTargetLibraryName();

  return loadPackageTree(libName)
    .then(validateLibraryPackage)
    .then((pkg) =>
      Promise.all([
        buildPackageTreeIfChanged(pkg),
        copyFile(getProjectPath('LICENSE'), getPackageDistPath(pkg)),
      ]));
});
