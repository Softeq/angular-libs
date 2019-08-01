// Developed by Softeq Development Corporation
// http://www.softeq.com

const { isNil, concat, constant, flatten, keys, compact } = require('lodash');
const { fsLastModifiedDate, fsReadFile } = require('./fs');
const { getProjectPath } = require('./path');
const { ngBuild } = require('./ng');

const validateLibraryPackage = (pkg) => Promise.resolve(pkg);

const loadPackage = (pkgName) => {
  if (isLibraryName(pkgName)) {
    return loadLibraryPackage(pkgName);
  } else if (isSofteqPackageName(pkgName)) {
    return loadLibraryPackage(getLibraryNameBySofteqPackageName(pkgName));
  } else {
    return loadDependencyPackage(pkgName);
  }
};

const isLibraryName = (pkgName) => pkgName.endsWith('-lib');
const isSofteqPackageName = (pkgName) => pkgName.startsWith('@softeq/');
const getLibraryNameBySofteqPackageName = (pkgName) => {
  const match = /^@softeq\/(.+)$/.exec(pkgName);
  if (isNil(match)) {
    throw new Error('Only "@softeq/.*" names are supported');
  }

  return `${match[1]}-lib`;
};

const loadDependencyPackage = (pkgName) => Promise.resolve({ name: pkgName });

const loadLibraryPackage = (libName) =>
  fsReadFile(getProjectPath(`projects/${libName}/package.json`))
    .then(JSON.parse)
    .then((packageJson) => ({
        libraryName: libName,
        name: packageJson.name,
        version: packageJson.version,
        dependencies: keys(packageJson.dependencies) || [],
        peerDependencies: keys(packageJson.peerDependencies) || [],
        devDependencies: keys(packageJson.devDependencies) || [],
        srcPath: getProjectPath(`projects/${libName}`),
        distPath: getProjectPath(`dist/${libName}`),
        changed: false,
      }
    ));

const loadPackageTree = (pkgName) =>
  loadPackage(pkgName)
    .then((pkg) => {
      if (isLibraryPackage(pkg)) {
        return Promise.all([
          Promise.all(pkg.dependencies.map(loadPackageTree)),
          Promise.all(pkg.peerDependencies.map(loadPackageTree)),
          Promise.all(pkg.devDependencies.map(loadPackageTree)),
        ]).then(([dependencies, peerDependencies, devDependencies]) => ({
          ...pkg,
          packages: {
            dependencies, peerDependencies, devDependencies,
          },
        }));
      } else {
        return pkg;
      }
    });

const findAllLibrariesInTree = (pkg, options) => {
  const stack = [pkg];
  const libraries = [];

  while (stack.length) {
    const currentPkg = stack.pop();

    if (isLibraryPackage(currentPkg)) {
      libraries.push(currentPkg);

      currentPkg.packages.dependencies.forEach((dep) => stack.push(dep));
      if (options.peer) {
        currentPkg.packages.peerDependencies.forEach((dep) => stack.push(dep));
      }
      if (options.dev) {
        currentPkg.packages.devDependencies.forEach((dep) => stack.push(dep));
      }
    }
  }

  return libraries;
};

const isLibraryPackage = (pkg) => !!pkg.libraryName;

const traversePackageBottomUp = (tree, process, options) => {
  const libraries = findAllLibrariesInTree(tree, options);
  const processedLibraries = {};
  let complete;
  let error;

  const promise = new Promise((resolve, reject) => {
    complete = resolve;
    error = reject;
  });

  const isAllDependenciesAreProcessed = (pkg) => {
    const libraries = flatten(compact([
      pkg.packages.dependencies,
      options.peer ? pkg.packages.peerDependencies : void 0,
      options.dev ? pkg.packages.devDependencies : void 0,
    ]));
    return libraries.filter(isLibraryPackage).every(isLibraryProcessed);
  };

  const isLibraryProcessed = (pkg) => !!processedLibraries[pkg.libraryName];

  const findNonProcessedLibrary = () =>
    libraries.find((lib) => !isLibraryProcessed(lib) && isAllDependenciesAreProcessed(lib));

  const next = () => {
    const library = findNonProcessedLibrary();
    if (library) {
      process(library)
        .then(() => {
          processedLibraries[library.libraryName] = true;
          next();
        })
        .catch(error);
    } else {
      complete();
    }
  };

  next();

  return promise;
};

const loadPackageSourceLastModifiedDate = (pkg) => fsLastModifiedDate(pkg.srcPath);
const loadPackageDistLastModifiedDate = (pkg) => fsLastModifiedDate(pkg.distPath);

const buildPackageTreeIfChanged = (pkg, options = { peer: true, dev: false }) =>
  traversePackageBottomUp(pkg, buildPackageIfChanged, options)
    .then(constant(pkg));

const isPackageWasModified = (pkg) => pkg.changed;
const isPackageDependencyWasModified = (pkg) =>
  concat(pkg.packages.dependencies, pkg.packages.peerDependencies, pkg.packages.devDependencies)
    .filter(isLibraryPackage).some(isPackageWasModified);

const buildPackageIfChanged = (pkg) => {
  const promise = isPackageDependencyWasModified(pkg) ? Promise.resolve('dependency') : Promise.all([
    loadPackageSourceLastModifiedDate(pkg),
    loadPackageDistLastModifiedDate(pkg),
  ]).then(([sourceDate, distDate]) => !distDate || distDate < sourceDate ? 'time' : void 0);
  return promise.then((changed) => {
    if (changed) {
      if (changed === 'dependency') {
        console.log(`"${pkg.name}": will be rebuild, because its dependency was changed`);
      } else if (changed === 'time') {
        console.log(`"${pkg.name}": will be rebuild, because it has changes`);
      }
      pkg.changed = true;
      return ngBuild(pkg);
    } else {
      console.log(`"${pkg.name}": will not be rebuild, because there are no changes `);
      return pkg;
    }
  });
};

module.exports = {
  validateLibraryPackage,
  loadPackage,
  isLibraryPackage,
  loadPackageTree,
  traversePackageBottomUp,
  loadPackageSourceLastModifiedDate,
  loadPackageDistLastModifiedDate,
  buildPackageTreeIfChanged
};
