module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
	var con    = require("./config.js");
	
	  
	router.get("/show_promo_codes",function(req,res){
		var sql="select * from promo_code";
		con.query(sql,function(error,result){
			
			for(var i=0;i<result.length;i++)
			{
				
				var date_string=result[i].start_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 4).join(' ');
				result[i].start_date_string=date_string;
				
				var date_string=result[i].end_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 4).join(' ');
				result[i].end_date_string=date_string;
				
			}

			res.render("promo.ejs",{result:result});
		})
	})
	
	router.post("/save_promo_code",function(req,res){
		var code                   = req.body.code;
		var start_date             = req.body.start_date;
		var end_date               = req.body.end_date;
		var total_valid_count      = req.body.total_valid_count;
		var remaning_valid_count   = req.body.remaning_valid_count;
		var discount_percentage    = req.body.discount_percentage;
		var description            = req.body.description;
		start_date=moment(start_date).format("YYYY-MM-DD hh:mm:ss");
	    end_date  =moment(end_date).format("YYYY-MM-DD hh:mm:ss");
		
		if(discount_percentage=="" || discount_percentage===undefined) {discount_percentage=0;}
		var values={
			"code"        : code,
			"description" : description,
			"start_date"  : start_date,
			"end_date"    : end_date,
			"total_valid_count" : total_valid_count,
			"remaning_valid_count" : remaning_valid_count,
			"discount_percentage" : discount_percentage
		}
		var sql="insert into promo_code SET ?";
		con.query(sql,values,function(error,result){
			//console.log(result);
			if(error) throw error;
			res.send("1");
		})
	});
	
	
	router.post("/edit_promo_code",function(req,res){
		var code                   = req.body.code;
		var start_date             = req.body.start_date;
		var end_date               = req.body.end_date;
		var total_valid_count      = req.body.total_valid_count;
		var remaning_valid_count   = req.body.remaning_valid_count;
		var discount_percentage    = req.body.discount_percentage;
		var description            = req.body.description;
		var promo_code_id          = req.body.promo_code_id;
		
		start_date=moment(start_date).format('YYYY-MM-DD hh:mm:ss');
		end_date  =moment(end_date).format('YYYY-MM-DD hh:mm:ss');
		
		var sql="update promo_code SET code='" + code + "', start_date='" +start_date + "', end_date='" +end_date + "', total_valid_count=" +total_valid_count + ", remaning_valid_count=" +remaning_valid_count + ", discount_percentage=" +discount_percentage + ", description='" + description +"' WHERE id=" +promo_code_id;
        con.query(sql,function(error,result){
			if(error) throw error;
			console.log(result);
			res.send("1");
		})		
	});
	
	
	router.get("/delete_code",function(req,res){
		var id=req.query.id;
		var sql="update orders SET promo_code_id=0 WHERE promo_code_id=" +id;
		con.query(sql,function(error,result){
			var sql="update promo_code SET end_date=start_date WHERE id=" +id;
			con.query(sql,function(error,re){
				if(error) throw error;
				res.send("1");
			})
			
		})
	})
	
	router.get("/get_promo_code",function(req,res){
		var id=req.query.promo_code_id;
		var sql="select * from promo_code WHERE id=" +id;
		con.query(sql,function(error,result){
			//console.log(result);
			res.send(result);
		})
	});
	
	router.get("/order_related_to_promo",function(req,res){
		var promo_code_id=req.query.promo_id;
		var sql="select orders.order_id, customers.customer_name, orders.total_discount_in_rs from orders join customers where orders.customer_id=customers.customer_id AND orders.promo_code_id=" +promo_code_id;
		con.query(sql,function(error,result){
			if(error) throw error;
			console.log(result);
			res.send(result);
		})
	});
	
	router.get("/get_promo_desc",function(req,res){
		  var promo_id=req.query.promo_id;
		  var sql="select * from promo_code WHERE id=" +promo_id;
		con.query(sql,function(error,result){
			//console.log(result);
			res.send(result);
		})
		  
	});
	 
  return router;
})();