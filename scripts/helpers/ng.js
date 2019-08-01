// Developed by Softeq Development Corporation
// http://www.softeq.com

const { spawn } = require('child_process');

const ngBuild = (pkg) => spawn('ng', ['build', pkg.libraryName]);

const ngTest = (pkg) => spawn('ng', ['test', pkg.libraryName]);

module.exports = { ngBuild, ngTest };
