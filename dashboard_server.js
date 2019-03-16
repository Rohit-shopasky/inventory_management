module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	  
	 router.get("/dashboard",function(req,res){
		 res.render("dashboard.ejs",{});
	 });
	 
	/* router.get("/get_amount_data",function(req,res){
		 
		 var sql="select MONTH(created_date) month, SUM(jars) jars from order_details GROUP BY created_date";
		 con.query(sql,function(error,result){
			 if(error) throw error;
			 var plot_data=[0,0,0,0,0,0,0,0,0,0,0,0];
			 var jars_data=[0,0,0,0,0,0,0,0,0,0,0,0];
			 for(var i=0;i<result.length;i++)
			 {
				 var m=result[i].month;
				 if(m==1)
				 {
					 //plot_data[0]=Number(plot_data[0]) + Number(result[i].amount);
					 jars_data[0]=Number(jars_data[0]) + Number(result[i].jars);
				 }
				 else if(m==2)
				 {
					 //plot_data[1]=Number(plot_data[1]) + Number(result[i].amount);
					 jars_data[1]=Number(jars_data[1]) + Number(result[i].jars);
				 }
				 
				 else if(m==3)
				 {
					 //plot_data[2]=Number(plot_data[2]) + Number(result[i].amount);
					 jars_data[2]=Number(jars_data[2]) + Number(result[i].jars);
				 }
				 
				 else if(m==4)
				 {
					 //plot_data[3]=Number(plot_data[3]) + Number(result[i].amount);
					 jars_data[3]=Number(jars_data[3]) + Number(result[i].jars);
				 }
				 
				 else if(m==5)
				 {
					 //plot_data[4]=Number(plot_data[4]) + Number(result[i].amount);
					 jars_data[4]=Number(jars_data[4]) + Number(result[i].jars);
				 }
				 
				 else if(m==6)
				 {
					 //plot_data[5]=Number(plot_data[5]) + Number(result[i].amount);
					 jars_data[5]=Number(jars_data[5]) + Number(result[i].jars);
				 }
				 
				 else if(m==7)
				 {
					 //plot_data[6]=Number(plot_data[6]) + Number(result[i].amount);
					 jars_data[6]=Number(jars_data[6]) + Number(result[i].jars);
				 }
				 
				 else if(m==8)
				 {
					//plot_data[7]=Number(plot_data[7]) + Number(result[i].amount); 
					jars_data[7]=Number(jars_data[7]) + Number(result[i].jars);
				 } 
				 
				 else if(m==9)
				 {
					//plot_data[8]=Number(plot_data[8]) + Number(result[i].amount); 
					jars_data[8]=Number(jars_data[8]) + Number(result[i].jars);
				 } 
				 
				 else if(m==10)
				 {
					//plot_data[9]=Number(plot_data[9]) + Number(result[i].amount); 
					jars_data[9]=Number(jars_data[9]) + Number(result[i].jars);
				 } 
				 
				 else if(m==11)
				 {
					//plot_data[10]=Number(plot_data[10]) + Number(result[i].amount);
                    jars_data[10]=Number(jars_data[10]) + Number(result[i].jars);					
				 } 
				 
				 else if(m==12)
				 {
					//plot_data[11]=Number(plot_data[11]) + Number(result[i].amount); 
					jars_data[11]=Number(jars_data[11]) + Number(result[i].jars);
				 } 
				 
			 } 
			 //console.log(plot_data + " " +jars_data);
			 
			 
			 var sql="select SUM(orders.total_payable) as amount, MONTH(orders.order_date) as month from orders group by MONTH(orders.order_date)";
			 con.query(sql,function(error,result){
				 for(var i=0;i<result.length;i++)
			 {
				 var m=result[i].month;
				 if(m==1)
				 {
					 plot_data[0]=Number(plot_data[0]) + Number(result[i].amount);
					 //jars_data[0]=Number(jars_data[0]) + Number(result[i].jars);
				 }
				 else if(m==2)
				 {
					 plot_data[1]=Number(plot_data[1]) + Number(result[i].amount);
					 //jars_data[1]=Number(jars_data[1]) + Number(result[i].jars);
				 }
				 
				 else if(m==3)
				 {
					 plot_data[2]=Number(plot_data[2]) + Number(result[i].amount);
					// jars_data[2]=Number(jars_data[2]) + Number(result[i].jars);
				 }
				 
				 else if(m==4)
				 {
					 plot_data[3]=Number(plot_data[3]) + Number(result[i].amount);
					 //jars_data[3]=Number(jars_data[3]) + Number(result[i].jars);
				 }
				 
				 else if(m==5)
				 {
					 plot_data[4]=Number(plot_data[4]) + Number(result[i].amount);
					 //jars_data[4]=Number(jars_data[4]) + Number(result[i].jars);
				 }
				 
				 else if(m==6)
				 {
					 plot_data[5]=Number(plot_data[5]) + Number(result[i].amount);
					 //jars_data[5]=Number(jars_data[5]) + Number(result[i].jars);
				 }
				 
				 else if(m==7)
				 {
					 plot_data[6]=Number(plot_data[6]) + Number(result[i].amount);
					 //jars_data[6]=Number(jars_data[6]) + Number(result[i].jars);
				 }
				 
				 else if(m==8)
				 {
					plot_data[7]=Number(plot_data[7]) + Number(result[i].amount); 
					//jars_data[7]=Number(jars_data[7]) + Number(result[i].jars);
				 } 
				 
				 else if(m==9)
				 {
					plot_data[8]=Number(plot_data[8]) + Number(result[i].amount); 
					//jars_data[8]=Number(jars_data[8]) + Number(result[i].jars);
				 } 
				 
				 else if(m==10)
				 {
					plot_data[9]=Number(plot_data[9]) + Number(result[i].amount); 
					//jars_data[9]=Number(jars_data[9]) + Number(result[i].jars);
				 } 
				 
				 else if(m==11)
				 {
					plot_data[10]=Number(plot_data[10]) + Number(result[i].amount);
                    //jars_data[10]=Number(jars_data[10]) + Number(result[i].jars);					
				 } 
				 
				 else if(m==12)
				 {
					plot_data[11]=Number(plot_data[11]) + Number(result[i].amount); 
					//jars_data[11]=Number(jars_data[11]) + Number(result[i].jars);
				 } 
				 
			 } 
			    var month = moment().format('MMMM YYYY');       // current month			 
			    res.json({"amount_data":plot_data,"jars_data":jars_data,"month":month});
			 })
			 
			 
		 })
		 
	 })*/
	 
	 router.get("/get_amount_data",function(req,res){
		 var sql="select created_date, SUM(jars) jars from order_details GROUP BY MONTH(created_date), YEAR(created_date) order by created_date ASC";
		 con.query(sql,function(error,result){
			 var dates = new Array();
			 var jars  = new Array();
			 for(var i=0;i<result.length;i++)
			 {
				 var date = moment(result[i].created_date).format("MMMM YYYY");
				 dates.push(date);
				 jars.push(result[i].jars);
			 }
			 
              var sql="select SUM(orders.total_payable) as amount, orders.order_date from orders group by MONTH(orders.order_date), YEAR(orders.order_date) order by order_date ASC";
			  con.query(sql,function(error,result){
				   var amount_dates = new Array();
			       var amount  = new Array();
				   for(var i=0;i<result.length;i++)
			      {
				 var date = moment(result[i].order_date).format("MMMM YYYY");
				 amount_dates.push(date);
				 amount.push(result[i].amount);
			     }
				 console.log(dates);
			    res.json({dates:dates,jars:jars,amount:amount,amount_dates})
			  })
			 
		 })
	 })
	 
	 
	 
	
	router.get("/get_all_orders_this_month",function(req,res){
		var sql="select * from orders WHERE MONTH(order_date)=MONTH(CURRENT_DATE()) AND YEAR(order_date) = YEAR(CURRENT_DATE()) ";
		
		con.query(sql,function(error,result){
			if(error) throw error;
			res.send(result)
		})
		
	});
	
	router.get("/get_pending_orders_this_month",function(req,res){
		var sql="select * from orders WHERE (MONTH(order_date)=MONTH(CURRENT_DATE()) AND YEAR(order_date) = YEAR(CURRENT_DATE())) AND (status=1) ";
		
		con.query(sql,function(error,result){
			if(error) throw error;
			res.send(result);
		});
		
	});
	
	router.get("/get_total_payment",function(req,res){
		
		// total of order_details
		var sql="select SUM(amount) as amount from order_details WHERE MONTH(created_date)=MONTH(CURRENT_DATE()) AND YEAR(created_date) = YEAR(CURRENT_DATE())"
		con.query(sql,function(error,result){
			    if(error) throw error;
			   var total_orders_amount=result[0].amount;
			  //console.log("total_orders_amount->" +total_orders_amount);
			  
			  
			// total of combo order_details
			var sql="select SUM(amount) as amount from combo_order_details WHERE MONTH(created_date)=MONTH(CURRENT_DATE()) AND YEAR(created_date) = YEAR(CURRENT_DATE())";
			con.query(sql,function(error,combo_amount){
				if(error) throw error;
				var total_combo_amount=combo_amount[0].amount;
				//console.log("total_combo_amount->" +total_combo_amount);
				
				
				var sql="select SUM(total_discount_in_rs) as discount from orders WHERE MONTH(order_date)=MONTH(CURRENT_DATE()) AND YEAR(order_date) = YEAR(CURRENT_DATE())";
				
				con.query(sql,function(error,discount){
					var total_discount=discount[0].discount
					//console.log("total_discount->" +total_discount);
					
					var total_payment=Number(total_orders_amount) + Number(total_combo_amount);
					total_payment=Number(total_payment) - Number(total_discount);
					//console.log("Total_payment->" +total_payment);
					res.json({total_payment:total_payment});
				});
				
				
			});
			
		})
		
	});
	
	
	router.get("/get_due_payment",function(req,res){
		// total of order_details of whoose payment is due
		var sql="select SUM(order_details.amount) as amount from orders JOIN order_details WHERE (MONTH(order_details.created_date)=MONTH(CURRENT_DATE()) AND YEAR(order_details.created_date) = YEAR(CURRENT_DATE())) AND (orders.payment_received=0) AND orders.order_id=order_details.order_id";
		
		con.query(sql,function(error,result){
			var due_order_detail_amount=result[0].amount;
			
			
			// total_of combo_order_details whoose payment is due
			var sql="select SUM(amount) as amount from combo_order_details  JOIN orders WHERE (MONTH(combo_order_details.created_date)=MONTH(CURRENT_DATE()) AND YEAR(combo_order_details.created_date) = YEAR(CURRENT_DATE())) AND (orders.payment_received=0) AND orders.order_id=combo_order_details.order_id";
			
			con.query(sql,function(error,combo_amount){
				if(error) throw error;
				var due_combo_order_detail=combo_amount[0].amount;
				
				var sql="select SUM(total_discount_in_rs) as discount from orders WHERE (MONTH(order_date)=MONTH(CURRENT_DATE()) AND YEAR(order_date) = YEAR(CURRENT_DATE())) AND orders.payment_received=0";
				
				con.query(sql,function(error,discount){
				    var discount=discount[0].discount;
					
					var total_due_payment=Number(due_order_detail_amount) + Number(due_combo_order_detail);
					total_due_payment = Number(total_due_payment) - Number(discount);
					//console.log(total_due_payment);
					res.json({total_due_payment:total_due_payment});
				})
				
				
			})
			
		})
	});
	
	
	router.get("/get_total_stock",function(req,res){
		var sql="select SUM(jars) AS jars from product WHERE on_order=0 AND status=1";
		con.query(sql,function(error,result){
			var jars=result[0].jars;
			
			res.json({jars:jars});
		})
	});
	
	
	router.get("/get_total_jars",function(req,res){
		var sql="select SUM(jars) as jars from stock";
		con.query(sql,function(error,result){
			if(error) throw error;
			var total_jars = result[0].jars;
		    res.json({total_jars:total_jars});
		});
	});

  return router;
})();