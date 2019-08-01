// Developed by Softeq Development Corporation
// http://www.softeq.com

const { spawn } = require('child_process');

const npmVersion = (pkg, args) => spawn('npm', ['version'].concat(args), { cwd: pkg.srcPath });

module.exports = { npmVersion };
