'use strict';

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist').argv;

azbn.mdl('db/mysql', {
	host : argv.host || 'localhost',
	user : argv.user || 'user',
	password : argv.password || 'password',
	database : argv.database || 'database',
}).connect(function(err){
	
	if(err) {
		
		azbn.echo('Could not connect to mysql: ' + err);
		
	} else {
		
		azbn.echo('DB is connected');
		
		azbn.mdl('db/mysql').end();
		
	}
	
});

//app.saveJSON('dbname', struct);
