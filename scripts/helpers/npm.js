// Developed by Softeq Development Corporation
// http://www.softeq.com

const { run } = require('./cli');

const npmVersion = (pkg, args) => run('npm', ['version'].concat(args), { cwd: pkg.srcPath });

module.exports = { npmVersion };
