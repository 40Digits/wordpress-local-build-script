var path = require('path');

module.exports = {

  // Your local dev url, which will be built with ejs
  localUrl: 'l.<%= siteName %>',

  // Create the site name based on the repo directory name/repo slug
  siteName: path.basename(__dirname.toString()),

  // File paths
  vhostsDir: '/etc/apache2/extra/vhosts/',
  hostsFile: '/etc/hosts',

  // Log paths, also built with ejs
  customLog: '/http-logs/<%= siteName %>.log',
  errorLog: '/http-logs/<%= siteName %>.error.log',

  // Mysql credentials
  mysqlUser: 'root',
  mysqlPw: ''

}