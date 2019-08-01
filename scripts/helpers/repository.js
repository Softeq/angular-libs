// Developed by Softeq Development Corporation
// http://www.softeq.com

const { isNil, concat, flatten, compact } = require('lodash');
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
    .then((packageJson) => {
      return {
        libraryName: libName,
        name: packageJson.name,
        version: packageJson.version,
        dependencies: packageJson.dependencies || [],
        peerDependencies: packageJson.peerDependencies || [],
        devDependencies: concat(packageJson.devDependencies, ['test-data-lib']),
        srcPath: getProjectPath(`projects/${libName}`),
        distPath: getProjectPath(`dist/${libName}`),
      }
    });

const loadPackageTreeInternal = (pkgName, registry) =>
  loadPackage(pkgName)
    .then((pkg) => {
      if (isLibraryPackage(pkg)) {
        registry.checkAndMark(pkg.libraryName, pkgName)
      }
      return pkg;
    })
    .then((pkg) =>
      Promise.all([
        Promise.all(pkg.dependencies.map((dependency) => loadPackageTree(dependency))),
        Promise.all(pkg.peerDependencies.map((dependency) => loadPackageTree(dependency))),
        Promise.all(pkg.devDependencies.map((dependency) => loadPackageTree(dependency))),
      ]).then(([dependencies, peerDependencies, devDependencies]) => ({
        ...pkg,
        packages: {
          dependencies, peerDependencies, devDependencies,
        },
      })));

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

const packageRegistry = () => {
  const loadedLibraries = {};
  const checkAndMark = (libName, sourceName) => {
    if (loadedLibraries[libName]) {
      throw new Error(`Circular library reference was detected: "${sourceName} -> ${libName}"`);
    }
    loadedLibraries[libName] = true;
  };
  return { checkAndMark };
};

const isLibraryPackage = (pkg) => !!pkg.libraryName;

const loadPackageTree = (pkgName) => loadPackageTreeInternal(pkgName, packageRegistry());

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
    return libraries.filter(isLibraryPackage).every((pkg) => processedLibraries[pkg.libraryName]);
  };

  const findNonProcessedLibrary = () => {
    const nextLibrary = libraries.find(isAllDependenciesAreProcessed);
    if (isNil(nextLibrary)) {
      throw new Error('Cannot find next library to be processed');
    }
    return nextLibrary;
  };

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
    .then(pkg);

const buildPackageIfChanged = (pkg) =>
  Promise.all([loadPackageSourceLastModifiedDate(pkg), loadPackageDistLastModifiedDate(pkg)])
    .then(([sourceDate, distDate]) => distDate < sourceDate ? ngBuild(pkg) : pkg);

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
