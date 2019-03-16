var express       =  require("express");
var app           =  express();
var bodyParser    = require('body-parser');
var ejs           = require("ejs");
var cors          = require("cors");   // for cross origin
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use("/product_images",express.static("product_images"));


var crypto = require('crypto'),   // 
    algorithm = 'aes-256-ctr',    //
    password = 'hungry_jars'; 
	
 function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  try{
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
  }
  catch(ex){
	  console.log('text encrypt nahi hua trying it again');
            encrypt(text);
  }
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  try{
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
  }
  catch(ex){
	  console.log('text decrypt nahi hua trying it again..');
            decrypt(text);
  }
}  

app.use("/views",express.static("views")); // style sheets and css
app.use("/views/js",express.static("js")); // style sheets and css

var home_server=require("./home_server.js");
app.use("/",home_server);

var category_server=require("./category_server.js");
app.use("/",category_server);

var stock_server=require("./stock_server.js");
app.use("/",stock_server);


var order_server=require("./order_server.js");
app.use("/",order_server);

var promo_server=require("./promo_server.js");
app.use("/",promo_server);

var customer_server=require("./customer_server.js");
app.use("/",customer_server);

var edit_order_server = require("./edit_order_server");
app.use("/",edit_order_server);

var dashboard=require("./dashboard_server.js");
app.use("/",dashboard);

var combo = require("./combo_server.js");
app.use("/",combo);

var track = require("./track_server.js");
app.use("/",track);

var show_menu_server = require("./live_server/show_menu_server.js");
app.use("/",show_menu_server);

var outlet = require("./outlet_server.js");
app.use("/",outlet);

var outlet_order_server = require("./outlet_order_server.js");
app.use("/",outlet_order_server); 

var edit_outlet_order_server = require("./edit_outlet_order_server.js");
app.use("/",edit_outlet_order_server);

var return_server = require("./return_server.js");
app.use("/",return_server);

var mysql = require('mysql');
var con    = require("./config.js");

var cron_server = require("./cron_server.js");
app.use("/",cron_server);
	  

app.get("/",function(req,res){
	
	res.render("index.ejs",{});
});


               // ashit->  ce59f0a12a7d  // naina-> c95ef7a62d7a


app.post("/login",function(req,res){
	
	var user_name = req.body.user_name;
	var password  = encrypt(req.body.password);
	//console.log("password-> " +password);
	var sql="Select * FROM users WHERE user_name='" +user_name + "' AND password='" +password + "'; ";
	con.query(sql,function(error,result){
		if(error) throw error;
		if(result.length!=0)
		{
			   if(error) throw error;
		     res.json({"status":"ok","user_id":result[0].user_id});
			
			console.log("okay login");
		}
		else
		{
			res.send("error");
			console.log("Incorrect password");
		}
	});	
})





app.listen(3000);
console.log("Server started on 3000");