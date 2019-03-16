module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	  
	  // SELECT category.category_name, count(*) FROM product JOIN category WHERE product.category_id=category.id GROUP BY category.category_name
	  
	router.get("/category",function(req,res){
		var sql="SELECT category.id, category.category_name, count(product.product_id) no_of_products FROM category LEFT JOIN product ON product.category_id=category.id GROUP BY category.id Order BY category.created_date ASC";
		con.query(sql,function(error,result){
			if(error) throw error;
			
			res.render("category.ejs",{result:result});
		})
	});
	
	router.get("/get_products_of_specific_category",function(req,res){
		var category_id=req.query.category_id;
		
		var sql="SELECT * FROM product WHERE product.status!=0 AND product.category_id=" + category_id + " ORDER BY product.created_date DESC";
		con.query(sql,function(error,result){
			console.log(result);
			
			var sql="select * from category WHERE id=" +category_id;
			con.query(sql,function(error,category_result){
				res.render("specified_category.ejs",{result:result,category_result:category_result});
			})
			
		});
		
	});
	
	router.post("/add_category",function(req,res){
		var category_name=req.body.category_name;
	    var sql="INSERT INTO category SET ?";
		var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		var values={
			"category_name":category_name,
			"status":1,
			"created_date":time,
		}
		
		con.query(sql,values,function(error,result){
			//console.log(result);
			res.send("1");
		});
		console.log(category_name);
	});
	
	router.get("/get_category_for_edit",function(req,res){
		var category_id=req.query.category_id;
		var sql="Select * FROM category WHERE id=" +category_id;
		con.query(sql,function(error,result){
			
			res.send(result);
		});
	});
	
	router.post("/save_category_edits",function(req,res){
		var category_name=req.body.category_name;
		var category_id  = req.body.category_id;
		
		//console.log(category_name + " " +category_id);
		var sql="UPDATE category SET name='" +category_name + "' WHERE id=" +category_id;
	    con.query(sql,function(error,result){
			//console.log(result);
			res.send("1");
		});
		
	})


  return router;
})();