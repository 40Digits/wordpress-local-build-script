var fs = require('fs'),
	ejs = require('ejs'),
	exec = require('child_process').exec,
	config = require('./build-config'),
	bark = require('whoof'),
	colors = require('colors'),

	// Vhost vars
	vhostTemplate = [
		'<VirtualHost *:80>',
			'ServerAlias ' + config.localUrl,
			'DocumentRoot <%= directory %>',
			'CustomLog ' + config.customLog + ' combined',
			'ErrorLog ' + config.errorLog,
		'</VirtualHost>'
	].join('\n\n'),
	hostTemplate = '127.0.0.1 ' + config.localUrl,

	vhostFile = config.vhostsDir + config.siteName + '.conf',

	// Hosts vars
	hostsFile = config.hostsFile,
	currentHostFile = fs.readFileSync(hostsFile),
	newHostsFile = currentHostFile + '\n' + ejs.render(hostTemplate, { siteName: config.siteName }),

	// db vars
	database = config.siteName.replace(/-/g, '_'),
	mysql = ejs.render('mysql --user="<%= user %>" --password="<%= pw %>" -e "CREATE DATABASE IF NOT EXISTS <%= database %>"', {
		user: config.mysqlUser,
		pw: config.mysqlPw,
		database: database
	}),

	// wp config vars
	wpConfigSample = fs.readFileSync('wp-config.sample').toString(),
	wpConfig = wpConfigSample.replace('database_name_here', database)
		.replace('username_here', config.mysqlUser)
		.replace('password_here', config.mysqlPw),

	// Console logging helper
	log = function (message) {
		console.log('[' + 'build'.cyan + '] ' + message.yellow);
	};


module.exports = function () {

	// Rename the theme directory
	try {
		fs.renameSync('./wp-content/themes/wp-theme', './wp-content/themes/' + config.siteName);
		log('Theme folder named to ' + config.siteName);
	} catch (e) {
		log('Theme folder already renamed.');
	}

	// Write vhosts
	fs.writeFileSync(vhostFile, ejs.render(vhostTemplate, {
		siteName: config.siteName,
		directory: __dirname.toString()
	}));
	log('Vhost created');

	// Write hosts
	if (currentHostFile.toString().indexOf(config.localUrl) === -1) {
		fs.writeFileSync(hostsFile, newHostsFile);
		log('Hosts file updated');
	} else {
		log('Hosts file already up-to-date')
	}

	// Create mysql database
	exec(mysql, function (error, stdout, stderr) {
		log('MySQL database "' + database + '" has been created');

		if (error !== null) {
		  log('MySQL error: ' + error);
		}
	});

	// Write wp-config.php
	fs.writeFile('wp-config.php', wpConfig);
	log('wp-config.php created');

	// Restart apache
	exec('sudo apachectl -e info -k restart', function () {
		log('Apache restarted');

		// All done
		bark();
	});
}