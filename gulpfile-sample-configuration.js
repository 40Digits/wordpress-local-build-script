var gulp = require('gulp'),
    build = require('wp-local-build-script');

gulp.task('build', build({
  localUrl: '<%= siteName %>.dev',
  vhostsDir: '/etc/apache2/2.4/extra/vhosts',
  open: true
}));