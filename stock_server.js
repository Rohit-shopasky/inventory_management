module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	  
	
	
	router.get("/get_stock_of_specific_product",function(req,res){
		var product_id=req.query.product_id;
		
		var sql="select * from stock WHERE product_id=" +product_id;
		con.query(sql,function(error,result){
			if(error) throw error;
			var jars_count=0;
			var quantity_gms_count=0;
			
			
			for(var i=0;i<result.length;i++)
			{
				jars_count=jars_count + result[i].jars;
				quantity_gms_count=quantity_gms_count+ result[i].quantity_gms;
				var date_string=result[i].created_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				
				var date_string=result[i].manufacture_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].manufacture_date=date_string;
			}
			
			//console.log(result);
			
			//console.log(jars_count + " " +quantity_gms_count);
			var sql="select SUM(jars) as jars from stock WHERE product_id=" +product_id;
			con.query(sql,function(error,product_result){
				   var jars_count=product_result[0].jars;
				res.render("specified_stock.ejs",{result:result,product_result:product_result,jars_count:jars_count,quantity_gms_count:quantity_gms_count});
			});
			
		})
		
	});
	
	router.post("/add_stock",function(req,res){
		var jars=req.body.jars;
		var quantity_gms=req.body.quantity_gms;
		var product_id=req.body.product_id;
		var manufacture_date = req.body.manufacture_date;
		//console.log(manufacture_date);
		manufacture_date=new Date(manufacture_date);
		var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		var sql="INSERT INTO stock SET ? ";
		var values={
			"product_id"      :product_id,
			"quantity_gms"    :quantity_gms,
			"jars"            :jars,
			"created_date"    :time,
			"manufacture_date":manufacture_date,
			"status"          :1,
		}
		
	     con.query(sql,values,function(error,result){
		     var sql="update product SET jars=jars +" +jars + " WHERE product_id=" +product_id;
             con.query(sql,function(error,result){
				 
				 res.send("1");
			 })			 
			 
	    });
	});
	
	
	router.get("/get_stock_for_edit",function(req,res){
		var stock_id = req.query.stock_id;
		var sql="select * from stock WHERE stock_id=" +stock_id;
		con.query(sql,function(error,result){
			if(error) throw error;
			res.send(result);
		});
	});
	
	
	router.post("/save_stock_edits",function(req,res){
		var product_id = req.body.product_id;
		var jars       = req.body.jars;
		var stock_id   = req.body.stock_id;
		var manufacture_date = req.body.manufacture_date;
		//console.log(manufacture_date);
		manufacture_date=moment(manufacture_date).format('YYYY-MM-DD HH:mm:ss');
		
		//console.log(product_id + " " +jars + " " +stock_id);
		
		var sql="update stock SET jars=" +jars + ",manufacture_date='"+ manufacture_date +"' WHERE stock_id=" +stock_id;
		con.query(sql,function(error,result){
			if(error) throw error;
			var sql="update product SET jars=" +jars + " WHERE product_id=" +product_id;
			con.query(sql,function(error,result){
				if(error) throw error;
				res.send("1");
			});
			
		});
		
	});
	  

  return router;
})();