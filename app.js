'use strict';

var azbn = new require(__dirname + '/../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist').argv;

var db_conf = {
	host : argv.host || 'localhost',
	user : argv.user || 'user',
	password : argv.password || 'password',
	database : argv.database || 'database',
}

var result = {
	tables : {
		
	},
};

azbn.setMdl('async', require('async'));

azbn.mdl('db/mysql', db_conf).connect(function(err){
	
	if(err) {
		
		azbn.echo('Could not connect to mysql: ' + err);
		
	} else {
		
		azbn.echo('DB is connected');
		
		azbn.mdl('db/mysql').query('SHOW TABLES', function(query_err, table_arr, fields) {
			
			if(query_err) {
				
				azbn.echo('MySQL Query Error: ' + query_err);
				
			} else {
				
				/*
				azbn.echo('rows: ' + JSON.stringify(rows));
				azbn.echo('fields: ' + JSON.stringify(fields));
				*/
				
				if(table_arr.length) {
					
					var async_arr = [];
					
					for(var i = 0; i < table_arr.length; i++) {
						
						for(var j in table_arr[i]) {
							
							(function(table_name){
								
								result.tables[table_name] = {
									row_count : 0,
									fields : {},
								};
								
								async_arr.push(function(callback){
									
									//var _t = result.tables[table_name];
									
									azbn.mdl('db/mysql').query('SELECT COUNT(*) as row_count FROM `' + table_name + '` WHERE 1', function(_query_err, _rows, _fields) {
										
										if(query_err) {
											
											azbn.echo('MySQL Query Error: ' + _query_err);
											
										} else if(_rows.length > 0) {
											
											for(var _i = 0; _i < _rows.length; _i++) {
												
												var res = _rows[_i];
												
												result.tables[table_name].row_count = res.row_count;
												
												//azbn.echo('Число записей в ' + table_name + ': ' + res.row_count);
												
											}
											
										}
										
										callback(_query_err, null);
										
									});
									
								});
								
								async_arr.push(function(callback){
									
									azbn.mdl('db/mysql').query('SHOW COLUMNS FROM `' + table_name + '`', function(_query_err, _rows, _fields) {
										
										if(query_err) {
											
											azbn.echo('MySQL Query Error: ' + _query_err);
											
										} else if(_rows.length > 0) {
											
											for(var _i = 0; _i < _rows.length; _i++) {
												
												var res = _rows[_i];
												
												//result.tables[table_name].fields.push(res);
												
												result.tables[table_name].fields[res.Field] = res;
												
												/*
												result.tables[table_name].fields.push({
													name : res.Field,
													type : res.Type,
												});
												*/
												
											}
											
										}
										
										callback(_query_err, null);
										
									});
									
								});
								
							})(table_arr[i][j]);
							
						}
						
					}
					
					azbn.mdl('async').series(async_arr, function (__err, __results) {
						
						app.saveJSON(db_conf.database, result);
						
						azbn.mdl('db/mysql').end();
						
					});
					
				}
				
			}
			
			//azbn.mdl('db/mysql').end();
			
		});
		
		//azbn.mdl('db/mysql').end();
		
	}
	
});
