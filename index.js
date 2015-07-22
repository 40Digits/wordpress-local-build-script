module.exports = function (options) {
	var fs = require('fs'),
		ejs = require('ejs'),
		exec = require('child_process').exec,
		merge = require('./merge'),
		config = merge(require('./build-config'), options),
		bark = require('whoof'),
		colors = require('colors'),
		path = require('path'),
		open = require('open'),
		siteName = config.siteName.replace(' ', '-').toLowerCase(),

		// Vhost vars
		apacheDirective = [
			'<Directory "<%= directory %>">',
				'\tOrder allow,deny',
				'\tAllow from all',
				'\tRequire all granted',
			'</Directory>\n\n',
		].join('\n'),

		vhostTemplate = [
			'<VirtualHost *:<%= port %>>',
				'\tServerAlias ' + config.localUrl,
				'\tDocumentRoot <%= directory %>',
				'\tCustomLog ' + config.customLog + ' combined',
				'\tErrorLog ' + config.errorLog,
			'</VirtualHost>'
		].join('\n'),

		vhostFile = path.join(config.vhostsDir, siteName + '.conf'),

		// Hosts vars
		currentHostFile = fs.readFileSync(config.hostsFile),
		renderedLocalUrl = ejs.render(config.localUrl, { siteName: siteName }),

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

		// Console logging helpers
		log = function (message) {
			console.log('[' + 'build'.cyan + '] ' + message.yellow);
		},

		error = function (message) {
			console.log('[' + 'build'.cyan + '] ' + message.red);
		};


	// Rename the theme directory
	try {
		fs.renameSync('./wp-content/themes/wp-theme', './wp-content/themes/' + siteName);
		log('Theme folder named to ' + siteName);
	} catch (e) {
		log('Theme folder already renamed as ' + siteName);
	}

	// Write vhosts
	try {
		var vhostContents = config.apache24 ? apacheDirective + vhostTemplate : vhostTemplate;

		fs.writeFileSync(vhostFile, ejs.render(vhostContents, {
			siteName: siteName,
			directory: path.join(__dirname.toString(), '..', '..'),
			port: config.httpPort
		}));
		log(siteName + '.conf created');
	} catch (e) {
		error('ERROR CREATING VHOST: ' + e.message);
	}


	// Write hosts
	if (currentHostFile.toString().indexOf(renderedLocalUrl) === -1) {
		fs.writeFileSync(config.hostsFile, currentHostFile + '\n' + '127.0.0.1\t' + renderedLocalUrl);
		log(renderedLocalUrl + ' has been added to your hosts file');
	} else {
		log(renderedLocalUrl + ' is already in your hosts file')
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
		if (config.open) {
			var url = renderedLocalUrl.indexOf('http://') === -1 ? 'http://' + renderedLocalUrl : renderedLocalUrl;
			open(url);
		}

		bark();
	});
};
