# 40digits Local Wordpress Setup

## Setup/Installation

Included is a build script that sets up your local dev environment faster than you can `$ say -v g "Restart apache"`.

Things it does:

1. Renames the theme folder to whatever the site directory name is, which is typically the repo slug
2. Creates a vhost file
3. Writes an entry in your hosts file
4. Creates a database
5. Creates `wp-config.php`
6. Restarts apache

Again, the site name defaults to the site's root directory, which is typically the repo slug. This site name is used for the theme folder name, url, and database. So just about everything. If you don't like that default, too bad! JK just change it in `build-config.js`.

Inside `build-config.js` you will find a few configuration options to help tailor to your specific dev preferences, because everyone is a snowflake. However, it can build your environment without any messing about, so long as your MySQL user is `root` and your password is empty.

### TL;DR :rooster::dash:

This assumes you have node installed. If you're reading this you probably already do, but I thought I'd mention it.

1. Modify `build-config.js` if you so desire
2. `$ npm install`
3. `$ sudo node build`
4. `$ say -v "Pipe Organ" "CAN YOU DIG IT?"`
5. :feelsgood: