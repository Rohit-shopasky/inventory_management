var mysql = require('mysql');
var db_config = {
      host     :'localhost',
      user     : 'root',
      password : '',
      database : 'hungary_jars',
      port     : 3306
};
var pool  = mysql.createPool(db_config);

pool.getConnection(function(err, connection) {
  if(err) throw err;
});

pool.on('error', function(err) {
  console.log(err.code); 
});

module.exports = pool;