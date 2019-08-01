// Developed by Softeq Development Corporation
// http://www.softeq.com

const { buildPackageTreeIfChanged, loadPackageTree, validateLibraryPackage } = require('./helpers/repository');
const { getTargetLibraryName, sandbox } = require('./helpers/cli');
const { ngTest } = require('./helpers/ng');

sandbox(() => {
  const libName = getTargetLibraryName();

  return loadPackageTree(libName)
    .then(validateLibraryPackage)
    .then((pkg) => buildPackageTreeIfChanged(pkg, { peer: true, dev: true }))
    .then(ngTest);
});
