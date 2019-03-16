module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("../config.js");
	var cors   = require("cors");   // for cross origin
	
	
	
	
router.get("/show_menu",cors(),function(req,res){

var sql="select product.product_id,product.name,product.selling_quantity_gms, product.price,product.order_url,product.icon_url,product.order_url,product.category_id,category.category_name from product join category WHERE product.category_id = category.id AND product.shown_on_website=1 order by product.category_id";
     con.query(sql,function(error,result){
		 if(error) throw error;
		 
		 var sql="select category.id, category.category_name from category join product where product.category_id=category.id AND product.shown_on_website=1 GROUP by category.id order by category.id";
		 con.query(sql,function(error,all_category){
			 if(error) throw error;
			 console.log(result);
			 res.json({result:result,category:all_category});
		 })
		 
		 
		 
	 });
		
});

router.post("/change_visibility",function(req,res){
	var status      = req.body.status;
	var product_id  = req.body.product_id;
	
	var sql="update product SET shown_on_website=" + status + " WHERE product_id=" +product_id;
	con.query(sql,function(error,result){
		console.log(result);
	});
	
});
	 
  return router;
})();