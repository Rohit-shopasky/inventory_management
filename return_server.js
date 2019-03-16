module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	  
	  // SELECT category.category_name, count(*) FROM product JOIN category WHERE product.category_id=category.id GROUP BY category.category_name
	  
router.get("/return",function(req,res){

   var order_id = req.query.order_id;
   
   var sql="select * from product where status!=0";
   con.query(sql,function(error,all_products){
	   if(error) throw error;
	   
	   var sql="select * from combos where status!=0";
	   con.query(sql,function(error,all_combos){
		   if(error) throw error;
		   res.render("return.ejs",{all_products:all_products,all_combos:all_combos,order_no:order_id});    
	   }) 
   })
   
});

router.post("/submit_return",function(req,res){
	var order_id = req.body.order_id;
	var modified_quantity = req.body.modified_quantity;
	//var modified_combo_quantity = req.body.modified_combo_quantity;
	
	for(var i=0;i<modified_quantity.length;i++)
	{
		var data={
			order_id    :order_id,
			product_id  :modified_quantity[i].product_id,
            broken      :modified_quantity[i].broken,
            expired     :modified_quantity[i].expired,
            defected    :modified_quantity[i].defected,
            rejected    :modified_quantity[i].rejected,			
		}
		
		var sql="insert into product_return set ?";
		con.query(sql,data,function(error,result){
			if(error) throw error;
			
		})
	}
	res.send("1");
	
	/*for(var i=0;i<modified_combo_quantity.length;i++)
	{
		var data={
			order_id    :order_id,
			combo_id    :modified_combo_quantity[i].combo_id,
            broken      :modified_combo_quantity[i].broken,
            expired     :modified_combo_quantity[i].expired,
            defected    :modified_combo_quantity[i].defected,
            rejected    :modified_combo_quantity[i].rejected,			
		}
		
		var sql="insert into combo_product_return set ?";
		con.query(sql,data,function(error,result){
			if(error) throw error;
			
		})
	} */
})


  return router;
})();