var gulp = require('gulp'),
    build = require('wp-local-build-script');

gulp.task('build', build({
  localUrl: '<%= siteName %>.dev',
  mysqlUser: 'admin',
  mysqlPw: '1234'
}));