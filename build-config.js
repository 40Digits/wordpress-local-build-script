var path = require('path');

module.exports = {

  // Your local dev url, which will be built with ejs
  localUrl: 'l.<%= siteName %>',

  // Create the site name based on the repo directory name/repo slug
  // It's normalized based on being at: repo-name/node_modules/wp-local-build-script/
  // Adjust the ../.. accordingly
  siteName: path.basename(path.join(__dirname.toString(), '..', '..')),

  // File paths
  vhostsDir: '/etc/apache2/extra/vhosts/',
  hostsFile: '/etc/hosts',

  // Log paths, also built with ejs
  customLog: '/http-logs/<%= siteName %>.log',
  errorLog: '/http-logs/<%= siteName %>.error.log',

  // Mysql credentials
  mysqlUser: 'root',
  mysqlPw: '',

  // Open url in a browser
  open: false,

  // Using apache 2.4 for adding the directive to vhost file
  apache24: true

}