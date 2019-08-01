// Developed by Softeq Development Corporation
// http://www.softeq.com

const { run } = require('./cli');

const ngBuild = (pkg) => run('ng', ['build', pkg.libraryName]);

const ngTest = (pkg) => run('ng', ['test', pkg.libraryName]);

module.exports = { ngBuild, ngTest };
