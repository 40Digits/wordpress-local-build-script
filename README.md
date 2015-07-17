# 40digits Local Wordpress Setup

> A build script that sets up your local dev environment faster than you can `$ say -v g "Restart apache"`.

Things it does:

1. Renames the theme folder to whatever the site name is, which is typically the repo slug and/or base directory name
2. Creates a vhost file
3. Writes an entry in your hosts file
4. Creates a database
5. Creates `wp-config.php`
6. Restarts apache

## Options

Since everyone is a snowflake, here are available options for configuration and their defaults.

- `siteName: path.basename(path.join(__dirname.toString(), '..', '..'))`: The name of the site/repo. Defaults to the project directory name, which is normalized based on being at `repo-name/node_modules/wp-local-build-script/`. Adjust as needed. No spaces, please.

- `localUrl: 'l.<%= siteName %>'`: The url you want. This is rendered with ejs based on `siteName`.

- `vhostsDir: '/etc/apache2/extra/vhosts/'`: The directory in which to keep your vhost `.conf` files.

- `hostsFile: '/etc/hosts'`: The location of your hosts file.

- `customLog: '/http-logs/<%= siteName %>.log'`: Log path. This is for the vhost configuration. Rendered with ejs using `siteName`.

- `errorLog: '/http-logs/<%= siteName %>.error.log'`: The path for the apache error logs. Also rendered with ejs using the `siteName`.

- `mysqlUser: 'root'`: Your MySQL username.

- `mysqlPw: ''`: Your MySQL password.

## Instructions :rooster::dash:

1. Create `gulpfile.js` in the project root

  ```
  var gulp = require('gulp'),
      build = require('wp-local-build-script');

  gulp.task('build', build);
  ```

  Or using custom configuration. See above for a complete list of available options.

  ```
  var gulp = require('gulp'),
      build = require('wp-local-build-script');

  gulp.task('build', build({
    localUrl: '<%= siteName %>.dev',
    mysqlUser: 'admin',
    mysqlPw: '1234'
  }));
  ```

2. `$ sudo gulp build`
3. `$ say -v "Pipe Organ" "CAN YOU DIG IT?"`
4. :feelsgood:

## Considerations

I've noticed that if the apache log paths don't exist, you'll get weird behavior. So make sure those are valid paths.
