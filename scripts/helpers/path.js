// Developed by Softeq Development Corporation
// http://www.softeq.com

const path = require('path');
const findRoot = require('find-root');

const rootDir = findRoot(__dirname);

const getProjectPath = (relative) => path.relative(rootDir, relative);
const getPackageSrcPath = (pkg) => pkg.srcPath;
const getPackageDistPath = (pkg) => pkg.distPath;

module.exports = { getProjectPath, getPackageSrcPath, getPackageDistPath };
