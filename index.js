module.exports = function (options) {
	var fs = require('fs'),
		ejs = require('ejs'),
		exec = require('child_process').exec,
		config = merge(require('./build-config'), options),
		bark = require('whoof'),
		colors = require('colors'),
		path = require('path'),
		siteName = config.siteName.replace(' ', '-'),

		// Vhost vars
		vhostTemplate = [
			'<VirtualHost *:80>',
				'\tServerAlias ' + config.localUrl,
				'\tDocumentRoot <%= directory %>',
				'\tCustomLog ' + config.customLog + ' combined',
				'\tErrorLog ' + config.errorLog,
			'</VirtualHost>'
		].join('\n'),
		hostTemplate = '127.0.0.1 ' + config.localUrl,

		vhostFile = path.join(config.vhostsDir, siteName + '.conf'),

		// Hosts vars
		currentHostFile = fs.readFileSync(config.hostsFile),
		renderedLocalUrl = ejs.render(hostTemplate, { siteName: siteName }),

		// db vars
		database = siteName.replace(/-/g, '_'),
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


	// Rename the theme directory
	try {
		fs.renameSync('./wp-content/themes/wp-theme', './wp-content/themes/' + siteName);
		log('Theme folder named to ' + siteName);
	} catch (e) {
		log('Theme folder already renamed.');
	}

	// // Write vhosts
	fs.writeFileSync(vhostFile, ejs.render(vhostTemplate, {
		siteName: siteName,
		directory: path.join(__dirname.toString(), '..', '..')
	}));
	log(siteName + '.conf created');


	// Write hosts
	if (currentHostFile.toString().indexOf(renderedLocalUrl) === -1) {
		fs.writeFileSync(config.hostsFile, currentHostFile + '\n' + renderedLocalUrl);
		log('Hosts file updated');
	} else {
		log('Hosts file already up-to-date')
	}

	// Create mysql database
	exec(mysql, function (error, stdout, stderr) {
		if (error !== null) {
		  log('MySQL error: ' + error);
		} else {
			log('MySQL database "' + database + '" has been created');
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
};

function merge(target, source) {

		/* Merges two (or more) objects,
			 giving the last one precedence */

	if ( typeof target !== 'object' ) {
		target = {};
	}

	for (var property in source) {

		if ( source.hasOwnProperty(property) ) {

			var sourceProperty = source[ property ];

			if ( typeof sourceProperty === 'object' ) {
				target[ property ] = merge( target[ property ], sourceProperty );
				continue;
			}

			target[ property ] = sourceProperty;
		}
	}

	for (var a = 2, l = arguments.length; a < l; a++) {
		merge(target, arguments[a]);
	}

	return target;
};
