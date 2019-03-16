module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
	var con    = require("./config.js");
	var excel = require('excel4node');

	
	var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: '587',
    auth: { user: 'hungryjars@outlook.com', pass: '123456789hii' },
    secureConnection: false,
    tls: { ciphers: 'SSLv3' }
});
  
	 router.get("/order",function(req,res){
		 
		 var sql="select * from product order by product.category_id ASC";
		 
		 con.query(sql,function(error,result){
			 if(error) throw error;
			 var sql="SELECT * FROM orders ORDER BY order_id DESC LIMIT 1";
			 con.query(sql,function(error,last_order_id){
				 if(last_order_id.length!=0)
				 var order_no=last_order_id[0].order_id + 1;
			     else
				 var order_no=1;
                 var sql="select * from promo_code where start_date < end_date";
				 con.query(sql,function(error,promo_code){
					 
					 // select combo products
					 
					 var sql="select * from combos WHERE status!=0";
					 con.query(sql,function(error,combo_product){
						 
						 
						 
						 // get all soled jars  from order details
						 
						 var sql="select product.product_id, product.on_order, SUM(order_details.jars) AS sold from product left join order_details on product.product_id=order_details.product_id group by product.product_id order by product.category_id,product.product_id";
						 con.query(sql,function(error,sum_of_order_details){
							 
							 if(error) throw error;
							 
							 // get all sold jars from combo order details
					         var sql="SELECT combo_products.combo_id, combo_products.product_id, combo_order_details.quantity_ordered from combo_products join combo_order_details where combo_products.combo_id = combo_order_details.combo_id";
							 
							 con.query(sql,function(error,combo_products_order_detail){
								 if(error) throw error;
								 
								 // change all null sold values to 0
						          for(var i=0;i<sum_of_order_details.length;i++)
						          {
							        if(sum_of_order_details[i].sold===null)
							        {
								     sum_of_order_details[i].sold = 0;
							        }
						          }
						
						
						          // add order details + combo order details = sold 
						          for(var i=0;i<sum_of_order_details.length;i++)
						          {
							        for(j=0;j<combo_products_order_detail.length;j++)
							        {
								     if(sum_of_order_details[i].product_id==combo_products_order_detail[j].product_id)
								      {
									    sum_of_order_details[i].sold = Number(sum_of_order_details[i].sold) + Number(combo_products_order_detail[j].quantity_ordered);
								      }
							        }
						         }
								 
								 // get stock of all jars
								 var sql="SELECT  product.product_id, SUM(stock.jars) AS jars FROM product LEFT JOIN stock on product.product_id=stock.product_id group by product.product_id order by product.category_id, product.product_id ASC";
								 
								 con.query(sql,function(error,all_stock){
									 if(error) throw error;


									  // get all rejected products
										var sql="select product_id, SUM(rejected) as rejected from product_return where rejected!=0 group by product_id order by product_id";
										con.query(sql,function(error,product_return){
									 if(error) throw error;
	 
														
								 
								 // deduct rejected jars from sold jars
								 for(var i=0;i<sum_of_order_details.length;i++)
								 {
									 for(j=0;j<product_return.length;j++)
									 {
										 if(sum_of_order_details[i].product_id==product_return[j].product_id)
										 {
											 sum_of_order_details[i].sold=Number(sum_of_order_details[i].sold) - Number(product_return[j].rejected);
										 }
									 }
								 }
								 
								 
								 for(var i=0;i<result.length;i++)
								{
									var balance = Number(all_stock[i].jars) - Number(sum_of_order_details[i].sold);
									
									var product_name = result[i].name;
									var stock = balance;
									
								}
									 
									 res.render("order.ejs",{result:result,order_no:order_no,promo_code:promo_code,combo_product:combo_product,sum_of_order_details:sum_of_order_details,all_stock:all_stock});
										})
								 })
							 }) 
						 })
					 }) 
				 })				 
			 })
		 });
	 });
	 
function cal_total_amount(net_amount,tax_percentage)
{
	var tax_amount=(Number(net_amount) * Number(tax_percentage))/100;
	var total_amount=Number(net_amount) + Number(tax_amount);
	return total_amount;
} 

function discount_deduction(amount,discount_percentage)
{
	var discount_amount=(Number(amount) * Number(discount_percentage))/100; 
	amount=Number(amount) - Number(discount_amount);
	return amount;
}

function cal_tax_amount(amount,tax_percentage)
{
	amount=(Number(amount) * Number(tax_percentage))/100;
	return amount;
}

function cal_net_amount(amount)
{
	var temp=Number(amount)/1.12;
	//var net_amount=Number(amount) - Number(temp);
	return temp;
}

	 router.get("/show_all_orders",function(req,res){
		 
		 var status=req.query.status;
		 var month=req.query.month;
		 var year =req.query.year;
		 var page =req.query.page;
		 var start=0; 
		 if(page)
		 {
		 
		 if(page!=1)
			 {
				 var temp=Number(page) * 50;
		         start=Number(temp) - 50;
			 }
		 }
		 else
		 {
			 page=1;
		 }
        // console.log(start + " " +end)
		
		 if((status===undefined ||status=="") && (month=="" ||month===undefined) && (year=="" ||year===undefined )){
		 var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received, orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id GROUP BY orders.order_id ORDER BY orders.order_date DESC LIMIT 50 OFFSET " +start;
		 
		 con.query(sql,function(error,result){
			 if(error) throw error;
	
			 for(var i=0;i<result.length;i++)
			{			
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}

			}
			     
			   var filter_data={status:"",year:"",month:""};
			   
			   var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			   
			   con.query(sql,function(error,placed_orders){
				   if(error) throw error;
				   
				   for(var i=0;i<placed_orders.length;i++)
				   {
					     var date_string=placed_orders[i].order_date;
				         date_string=date_string.toString();
				         date_string=date_string.split(' ').slice(0, 5).join(' ');
				         placed_orders[i].time=date_string;
				   }
				   
				   var sql="select * from track";
				   con.query(sql,function(error,track){
					       // count no of orders
						   var sql="select COUNT(orders.order_id) AS all_orders_count from orders";
						   con.query(sql,function(error,all_orders_count){
							   var all_orders_count=all_orders_count[0].all_orders_count;
							   
							  res.render("show_orders.ejs",{result:result,filter_data:filter_data,placed_orders:placed_orders,track:track,all_orders_count:all_orders_count,page:page}); 
						   });
						
				   });

			   })
			   
			   
		 });
		 }
		 else
		 {
			
		 }
		 
		 
	 });
	 
	 router.get("/show_filter_orders",function(req,res){
		 //console.log(req.query);
		 var status=req.query.status;
		 var year  =req.query.year;
		 var month =req.query.month;
		 var order_source = req.query.order_source;
		// console.log("status-> " +status);
		// console.log("Year->" +year);
		// console.log("month->" +month);
		
		 if(status!="" && year=="" && month=="")
		 {
			 if(order_source=="")
			 {
			 var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received, orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE orders.status=" + status+" GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			 
			 con.query(sql,function(error,result){
				  if(error) throw error;
			 
			for(var i=0;i<result.length;i++)
			{
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			}
			var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			con.query(sql,function(error,placed_orders){
				
				var sql="select * from track;"
				con.query(sql,function(error,track){
					var filter_data={status:status,year:"",month:"",order_source:''};	 
			        res.render("show_orders.ejs",{result:result,filter_data:filter_data,placed_orders:placed_orders,track:track});
				})
				
			   })
				
			 })
           }
		   else
		   {
             var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received, orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE orders.status=" + status+" and orders.order_source='" + order_source + "' GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			 
			 con.query(sql,function(error,result){
				  if(error) throw error;
			 
			for(var i=0;i<result.length;i++)
			{
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			}
			var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			con.query(sql,function(error,placed_orders){
				
				var sql="select * from track;"
				con.query(sql,function(error,track){
					var filter_data={status:status,year:"",month:"",order_source:order_source};	 
			        res.render("show_orders.ejs",{result:result,filter_data:filter_data,placed_orders:placed_orders,track:track});
				})
				
			   })
				
			 })
		   }
		 }
		 else if(status=="" && year=="" && month!="")
		 {
			 if(order_source=="")
			 {
			 var time1="2018-" +month + "-1 00:00:00";
             var time2="2018-" +month + "-31 23:59:59";		 
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){
				  var sql="select * from track;"
				  con.query(sql,function(error,track){
					  var filter_data={status:"",year:"",month:month,order_source:''};	 
			          res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track}); 
				  }); 
			  })
				
				
			});
		   }
		   else
		   {
             var time1="2018-" +month + "-1 00:00:00";
             var time2="2018-" +month + "-31 23:59:59";		 
			 var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') and orders.order_source='" + order_source + "' GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){
				  var sql="select * from track;"
				  con.query(sql,function(error,track){
					  var filter_data={status:"",year:"",month:month,order_source:order_source};	 
			          res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track}); 
				  }); 
			  })
				
				
			});
		   }
		 }
		 else if(status=="" && month=="" && year!="")
		 {
			if(order_source=="")
			{
			var time1=year +"-1-1 00:00:00";
            var time2=year +"-12-31 23:59:59";			
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			   var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			   
			   con.query(sql,function(error,placed_orders){
				   
				   var sql="select * from track;"
				   con.query(sql,function(error,track){
				    var filter_data={status:"",year:year,month:"",order_source:''};	 
			       res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track}); 
				   });

			   })

			});
			}
			else
			{
              var time1=year +"-1-1 00:00:00";
            var time2=year +"-12-31 23:59:59";			
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') and orders.order_source='" + order_source + "' GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			   var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			   
			   con.query(sql,function(error,placed_orders){
				   
				   var sql="select * from track;"
				   con.query(sql,function(error,track){
				    var filter_data={status:"",year:year,month:"",order_source:order_source};	 
			       res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track}); 
				   });

			   })

			});
			}
		 }
		 else if(status!="" && month!="" && year!="")
		 {
			 if(order_source=="")
			 {
			 var time1=year +"-" +month + "-1 00:00:00";
             var time2=year +"-" +month + "-31 23:59:59";		 
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') AND status=" + status+" GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){
				  
				  var sql="select * from track";
				  con.query(sql,function(error,track){
					var filter_data={status:status,year:year,month:month,order_source:''};
			        res.render("show_orders.ejs",{result:result,filter_data:filter_data,placed_orders:placed_orders,track:track});
				  });
			  })
					 
			    
				
			});
		   }
		   else
		   {
			var time1=year +"-" +month + "-1 00:00:00";
            var time2=year +"-" +month + "-31 23:59:59";		 
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') AND status=" + status+" and orders.order_source='" + order_source + "' GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){
				  
				  var sql="select * from track";
				  con.query(sql,function(error,track){
					var filter_data={status:status,year:year,month:month,order_source:order_source};
			        res.render("show_orders.ejs",{result:result,filter_data:filter_data,placed_orders:placed_orders,track:track});
				  });
			  })
					 
			    
				
			});
		   }
		 }
		 else if(status=="" && month=="" && year=="")
		 {
			 if(order_source=="")
			 { 
		     var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id GROUP BY orders.order_id ORDER BY orders.order_date DESC";
		 
		      con.query(sql,function(error,result){
			 if(error) throw error;
			 
			 for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){
				  
				  var sql="select * from track";
				  con.query(sql,function(error,track){
					  var filter_data={status:"",year:"",month:"",order_source:''};
			          res.render("show_orders.ejs",{result:result,filter_data:filter_data,placed_orders:placed_orders,track:track}); 
				  });
				 
			  })
		    });
		   }
		   else if(order_source!="" && status=="" && month=="" && year=="")
		   {  console.log("First");
			   var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id where orders.order_source='" + order_source + "'  GROUP BY orders.order_id ORDER BY orders.order_date DESC";
		 
		      con.query(sql,function(error,result){
			 if(error) throw error;
			 
			 for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){
				  
				  var sql="select * from track";
				  con.query(sql,function(error,track){
					  var filter_data={status:"",year:"",month:"",order_source:order_source};
			          res.render("show_orders.ejs",{result:result,filter_data:filter_data,placed_orders:placed_orders,track:track}); 
				  });
				 
			  })
		    });
		   }
		   
		 }
		 else if(status!="" && month!="" && year=="")
		 {
			if(order_source!="")
			{
			var time1="2018-" +month + "-1 00:00:00";
            var time2="2018-" +month + "-31 23:59:59";		 
			var sql="select orders.total_payable, orders.order_id, orders.order_source,orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') AND status=" + status+" GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			     var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
				 con.query(sql,function(error,placed_orders){
					 		
                    var sql="select * from track";
                    con.query(sql,function(error,track){
						var filter_data={status:status,year:"",month:month,order_source:''};	 
			        res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track});
					});					
				    
				 })

				
			});
		   }
		   else
		   {
			var time1="2018-" +month + "-1 00:00:00";
            var time2="2018-" +month + "-31 23:59:59";		 
			var sql="select orders.total_payable, orders.order_id, orders.order_source,orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') AND status=" + status+" and orders.order_source='" + order_source + "' GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			     var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
				 con.query(sql,function(error,placed_orders){
					 		
                    var sql="select * from track";
                    con.query(sql,function(error,track){
						var filter_data={status:status,year:"",month:month,order_source:order_source};	 
			        res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track});
					});					
				    
				 })

				
			});
		   }
		 }
		 else if(status=="" && month!="" && year!="")
		 {
			if(order_source=="")
			{
			var time1= year + "-" +month + "-1 00:00:00";
            var time2= year + "-" +month + "-31 23:59:59";		 
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){		

                 var sql="select * from track";
                 con.query(sql,function(error,track){
					 var filter_data={status:"",year:year,month:month,order_source:''};	 
			         res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track});
				 })				 
				
			  })

				
			});
		   }
		   else
		   {
			   var time1= year + "-" +month + "-1 00:00:00";
            var time2= year + "-" +month + "-31 23:59:59";		 
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') and orders.order_source='" + order_source + "' GROUP BY orders.order_id ORDER BY orders.order_date DESC";
			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){		

                 var sql="select * from track";
                 con.query(sql,function(error,track){
					 var filter_data={status:"",year:year,month:month,order_source:order_source};	 
			         res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track});
				 })				 
				
			  })

				
			});
		   }
		 }
		 else if(status!="" && month=="" && year!="")
		 {
			 if(order_source=="")
			 {
			var time1=year +"-1-1 00:00:00";
            var time2=year +"-12-31 23:59:59";			
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') AND status=" + status+" GROUP BY orders.order_id ORDER BY orders.order_date DESC";

			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			  
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){
				  var sql="select * from track";
				  con.query(sql,function(error,track){
					var filter_data={status:status,year:year,month:"",order_source:""};	 
			    res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track});  
				  }) 
			  })

			});
		   }
		   else
		   {
			 var time1=year +"-1-1 00:00:00";
            var time2=year +"-12-31 23:59:59";			
			var sql="select orders.total_payable, orders.order_id, orders.order_source, orders.shipping_cost, orders.total_discount_in_rs, SUM(order_details.amount) AS amount ,SUM(combo_order_details.amount) AS combo_amount,orders.order_date,orders.payment_received,orders.payment_type, customers.customer_name, customers.phone, orders.status FROM orders LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT JOIN customers ON orders.customer_id=customers.customer_id LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id WHERE (orders.order_date>='" +time1 +"' AND orders.order_date<='"+time2+ "') AND status=" + status+" and orders.order_source='" + order_source + "' GROUP BY orders.order_id ORDER BY orders.order_date DESC";

			con.query(sql,function(error,result){
				
				if(error) throw error;
			 
			   for(var i=0;i<result.length;i++)
			  {
				
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				result[i].time=date_string;
				if(result[i].amount==null) {result[i].amount=0;}
				if(result[i].combo_amount==null) {result[i].combo_amount=0;}
				
			  }
			  
			  
			  var sql="select orders.order_id,orders.order_date, customers.customer_name from orders JOIN customers WHERE orders.customer_id=customers.customer_id AND orders.status=1";
			  con.query(sql,function(error,placed_orders){
				  var sql="select * from track";
				  con.query(sql,function(error,track){
					var filter_data={status:status,year:year,month:"",order_source:order_source};	 
			    res.render("show_orders.ejs",{result:result,filter_data,placed_orders:placed_orders,track:track});  
				  }) 
			  })

			});
		   }
		 }
		 
	 })
	 
	 function send_email_on_status_changed(order_id,status)
	 {
		 var sql="select * from customers  join orders WHERE orders.customer_id=customers.customer_id AND orders.order_id=" +order_id;
		 con.query(sql,function(error,result){
			 var email=result[0].email;
			 var customer_name=result[0].customer_name;
			 
			
			
			  if(status==3)
			 {
				 var sub=" Delivered: Hungry Jars Order -" +order_id;
				 var email_text="<p>Hello " + customer_name + ",<br><br>Your order has been delivered. Hope you enjoy the products. <br> Leave us a review on Facebook, and spread the word <br><br> Best,<br> Hungry Jars Team</p>"
			 }
			 else if(status==4)
			 {
				 var sub="Your order is Cancelled"
				 var email_text="Your order is cancelled!";
			 }
			
			if(!!email)
			{
			   var mailOptions = {
                                                  from: '"Hungry Jars" <hungryjars@outlook.com>',
                                                  to:"hello@hungryjars.com",             //to:email,
                                                   subject:sub,
                                                   html:email_text,
                                 };
								 
								 transporter.sendMail(mailOptions, function(error, info){
                                                   if (error) {
                                                   console.log(error);
                                                   } else {
                                                    console.log('Email sent: ' + info.response);
                                                    }
                                                  });
			}

		 })
	 }
	 
function insert_log(order_id,text,user_id)
{
   //console.log(order_id + " " + text);
   var sql="insert into order_logs SET ?";
   var values={
	   "order_id"   : order_id,
	   "text"       : text,
	   "user_id"    : user_id,
   }
   con.query(sql,values,function(error,result){
	   if(error) throw error;
   })
}

function cancel_order(order_id)
{
	// update orders table
	var sql="update orders SET total_discount_in_rs=0, shipping_cost=0, amount_without_tax=0, tax_amount=0, total_payable=0 WHERE order_id=" +order_id;
	con.query(sql,function(error,update_order){
		if(error) throw error;
		
		
		// update order_details
		var sql="update order_details SET amount=0,sold=0 WHERE order_id=" +order_id;
		con.query(sql,function(error,update_order_details){
		if(error) throw error;
		
	    
	    //update combo order details
        var sql="update combo_order_details SET amount=0 WHERE order_id=" +order_id;
        con.query(sql,function(error,update_combo_order_details){
		if(error) throw error;
		
		// revert jars to the inventry from order_details
		 var sql="select product_id, jars from order_details WHERE order_id=" + order_id;
		 con.query(sql,function(error,order_details){
	          order_details.map(data => {
				 
				  var jars       = data.jars;
				  var product_id = data.product_id;
				  var sql="update product SET jars=jars +" + jars + " WHERE product_id=" + product_id;
				  con.query(sql,function(error,update_product){
					  if(error) throw error;

				  });
		     });
		});
		// revert jars to the inventry from order_details
		
		var sql="select combo_id, quantity_ordered from combo_order_details WHERE order_id=" + order_id;
		con.query(sql,function(error,result){
			if(result.length!=0)
			{
			if(error) throw error;
			var combo_id=result[0].combo_id;
			var quantity_ordered=result[0].quantity_ordered;

			// get product_id from combo_id
			var sql="select product_id from combo_products WHERE combo_id=" + combo_id;
	        con.query(sql,function(error,result){
				
				result.map(data=>{
					var product_id=data.product_id;
					 // update jars in product table
					 var sql="update product SET jars=jars + " + quantity_ordered + " WHERE product_id=" + product_id;
                     con.query(sql,function(error,result){
						 
					 });					 
				});
				
			});
		  }
		})
		
	  });		
	});	
  }) 
}

	 
	 router.post("/change_status",function(req,res){
		 var order_id=req.body.order_id;
		 var status  =req.body.status;
		 var user_id =req.body.user_id;
         
		 var sql="update orders SET status='" +status + "' WHERE order_id=" +order_id;
		 con.query(sql,function(error,result){
			 res.send("1");
			 
			 var text="";
			 if(status==1)
			 text="Order placed";
		     if(status==2)
			 text="Order Dispatched";
		     if(status==3)
			 text="Order Delievered";
		     if(status==4)
			 {text="Order Cancelled";  cancel_order(order_id);}
		     
			 insert_log(order_id,text,user_id);
			 send_email_on_status_changed(order_id,status);
			 
		 }); 
	 });
	 
	 
	 function send_email_on_dispatch(order_id,company_url)
	 {
		 var sql="select * from customers  join orders WHERE orders.customer_id=customers.customer_id AND orders.order_id=" +order_id;
		 con.query(sql,function(error,result){
			 var email=result[0].email;
			 var customer_name=result[0].customer_name;
			 var email_text="<span>Hello " + customer_name +  ",</span><br><br>";
			 if(company_url!="")
			 {
				 var url_text="<p>Your order has been dispatched. It will be delivered to you in the next 24-48 hours. You can track your order here - " + company_url +"</p>" ;
				 email_text= email_text + url_text;
			 }
			 else
			 {
				 var url_text="<span>Your order has been dispatched. It will be delivered to you in the next 24-48 hours</span>";
				 email_text=email_text + url_text;
			 }
			 
			 email_text = email_text + " <br><br><span>Best,<br> Hungry Jars Team</span>";
			var sub="Dispatched: Hungry Jars Order -" +order_id;
			if(!!email)
			{
			   var mailOptions = {
                                                  from: '"Hungry Jars" <hungryjars@outlook.com>',
                                                  to:"hello@hungryjars.com",            //to:email,
                                                   subject:sub,
                                                   html:email_text,
                                 };
								 
								 transporter.sendMail(mailOptions, function(error, info){
                                                   if (error) {
                                                   console.log(error);
                                                   } else {
                                                    console.log('Email sent: ' + info.response);
                                                    }
                                                  });
			}

		 })
	 }
	 
	 router.post("/send_dispatch_email",function(req,res){
		 var order_id=req.body.order_id;
		 var company_url  =req.body.company_url;
		 var user_id     = req.body.user_id;
		 
		 var sql="update orders SET status=2, track_company_url='" + company_url +"' WHERE order_id=" +order_id;
		 con.query(sql,function(error,result){
			 if(error) throw error;
			 res.send("1");
		 
		    insert_log(order_id,"Order Dispatched",user_id);
			send_email_on_dispatch(order_id,company_url);
			 
		 }); 
		 
	 });
	 
	 router.post("/change_payment",function(req,res){
		 var order_id     = req.body.order_id;
		 var user_id      = req.body.user_id;
		 var payment_type = req.body.payment_type;
		 var sql="SELECT * from orders WHERe order_id=" +order_id;
		
		if(payment_type!=0)
		{
			var sql="update orders set payment_type='" + payment_type + "', payment_received=1 WHERE order_id=" +order_id;
			con.query(sql,function(error,result){
				if(error) throw error;
				 
				 // update logs
				 var text="Payment status changed"; 
				 insert_log(order_id,text,user_id);
				 res.json({"data":1});
			})
			
		}
		else
		{
			var sql="update orders set payment_type='', payment_received=0 WHERE order_id=" +order_id;
			con.query(sql,function(error,result){
				if(error) throw error;
				res.json({"data":1});
			})
		}
		
	 });
	 
	 router.get("/check_discount",function(req,res){
		 var order_id=req.query.order_id;
		 var sql="SELECT orders.total_discount_in_rs, promo_code.discount_percentage from orders JOIN promo_code WHERE orders.order_id=" +order_id;
		 con.query(sql,function(error,result){
			 if(result.length!=0)
			 {
				 var discount=result[0].total_discount_in_rs;
				 
				 res.json({"status":1,"discount":discount,"discount_percentage":result[0].discount_percentage});
			 }
			 else
			 {
				 res.json({"status":0});
			 }
		 })
	 })
	 
	 router.get("/get_order_detail",function(req,res){
		 var order_id=req.query.order_id;
		 var sql="select order_details.product_id, order_details.jars, order_details.amount, (select promo_code.discount_percentage from promo_code JOIN orders WHERE orders.promo_code_id=promo_code.id AND orders.order_id=" +order_id + ") AS discount_percentage, product.name, product.price,product.selling_quantity_gms,product.unit_price,product.tax FROM order_details JOIN product WHERE order_details.product_id=product.product_id AND order_details.order_id=" +order_id;
		 con.query(sql,function(error,order_details){
			if(error) throw error;
			 
			 var sql="select combo_order_details.combo_id, combo_order_details.quantity_ordered, combo_order_details.amount, combos.combo_name,(select promo_code.discount_percentage from promo_code JOIN orders WHERE orders.promo_code_id=promo_code.id AND orders.order_id=" +order_id + ") AS discount_percentage, combos.price FROM combo_order_details JOIN combos WHERE combos.combo_id=combo_order_details.combo_id AND combo_order_details.order_id=" +order_id;
		      con.query(sql,function(error,combo_order_details){
			 if(error) throw error;
			 
			   var sql="select order_logs.text,order_logs.updated_at, users.user_name from order_logs JOIN users where order_id=" +order_id + " AND users.user_id=order_logs.user_id";
			   con.query(sql,function(error,order_logs){
				   if(error) throw error;
				    for(var i=0;i<order_logs.length;i++)
				   {
					     var date_string=order_logs[i].updated_at;
				         date_string=date_string.toString();
				         date_string=date_string.split(' ').slice(0, 5).join(' ');
				         order_logs[i].updated_at=date_string;
				   }
				   
				   // get shipping cost from the orders table
				   var sql="select shipping_cost,total_discount_in_rs,tax_amount,total_payable from orders WHERE order_id=" +order_id;
				   con.query(sql,function(error,result){
					      if(error) throw error;
						  
					     var shipping_cost=result[0].shipping_cost;
						 var total_discount_in_rs = result[0].total_discount_in_rs;
						 var total_tax=result[0].tax_amount;
						 var total_payable=result[0].total_payable;
						 
					   res.json({order_details:order_details,combo_order_details:combo_order_details,order_logs:order_logs,shipping_cost:shipping_cost,total_discount_in_rs:total_discount_in_rs,total_tax:total_tax,total_payable:total_payable});
				   });
				   
			   })
			     
		     })
		 })
	 });
	 
	 router.get("/get_combo_order_detail",function(req,res){
		 var order_id=req.query.order_id;
		
	 })
	 
	 router.get("/total",function(req,res){
		 var order_id=req.query.order_id;
		 
	 }) 
	 

	 
	
	 router.get("/get_customer_info",function(req,res){
		 var order_id=req.query.order_id;
		 var sql="select customers.customer_name, customers.customer_address, customers.customer_state, customers.city, customers.pincode, customers.phone, customers.email,orders.order_source,orders.note, orders.order_id, orders.track_company_url, orders.order_date, (select promo_code.code from promo_code join orders WHERE orders.promo_code_id=promo_code.id AND orders.order_id=" + order_id +") AS promo from orders JOIN customers WHERE customers.customer_id=orders.customer_id AND orders.order_id=" +order_id; 
		 con.query(sql,function(error,result){
			 if(error) throw error;
			 //console.log(result);
			 res.send(result);
		 })
	 });

	 
	 
	 router.get("/get_user_info",function(req,res){
		
		 var sql="Select * from customers";
		 con.query(sql,function(error,result){
			 if(error) throw error;
			
			 res.send(result);
		 });
	 });
	 
	 function check_valid_promo(start_date,end_date,total_valid_count,remaning_valid_count)
	 {
		 //console.log(start_date + " " +end_date + " " +total_valid_count + " " +remaning_valid_count);
		 var now=new Date();

		 var dateFrom=Date.parse(start_date);
		 var dateTo=Date.parse(end_date);
		 var dateCheck=now;
		 dateCheck=Date.parse(dateCheck);
		
		 
		 if(dateCheck <= dateTo && dateCheck >= dateFrom && remaning_valid_count>0) {
             return 1; 
          }
		  else
		  {
			 return 0;
		  }
		 
//console.log(check > from && check < to)
		 
	 }
	 
	 router.get("/check_promo_code",function(req,res){
		 var code=req.query.promo_code;
		 var sql="select * from promo_code WHERE id='" +code + "'";
		 con.query(sql,function(error,result){
			 if(result.length!=0)
			 { console.log(result);
				 var valid_status=check_valid_promo(result[0].start_date,result[0].end_date,result[0].total_valid_count,result[0].remaning_valid_count);
				     
                 if(valid_status==1)
				 {					 
				 var discount=result[0].discount_percentage;
				 res.json({"status":1,"discount":discount,"promo_code_id":result[0].id});
				 /*var promo_code_id=result[0].id;
				 var remaning_valid_count=result[0].remaning_valid_count;
				 remaning_valid_count=Number(remaning_valid_count) - 1;
                 
				 var sql="update promo_code SET remaning_valid_count=" +remaning_valid_count +" WHERE id=" +promo_code_id;
				 con.query(sql,function(error,result){
					 
				 }); */
				 }
				 else
				 {
					 res.json({"status":0});
				 }
			 }
			 else
			 {
				 res.json({"status":0});
			 }
				 
		 });
	 });
	 
	 router.get("/cancel_promo",function(req,res){
		 var promo_code_id=req.query.promo_code_id;
		 var sql="update promo_code SET remaning_valid_count=remaning_valid_count + 1   WHERE id=" +promo_code_id;
		 con.query(sql,function(error,result){
			 //console.log(result);
			 res.send("1");
		 })
	 });
	 
	 router.get("/get_customer_info_to_fill",function(req,res){
		 var customer_name=req.query.user_name;
		 //console.log(customer_name);
		 var sql="select * from customers WHERE customer_name='" +customer_name + "'";
		 con.query(sql,function(error,result){
			// console.log(result);
			 res.send(result);
		 });
	 });
	 
	 
function send_order_email(order_id,customer_email,user_name)
{
	var invoice_url="http://localhost:3000/" + "generate_bill_customer?order_id=" +order_id;
		// console.log(invoice_url);
	   //console.log("aya");
	   
		var phantom = require('phantom');   
        phantom.create().then(function(ph) {
         ph.createPage().then(function(page) {
          page.open(invoice_url).then(function(status) {
            page.render('./views/invoice_pdf/invoice' +order_id + '- customer' + '.pdf').then(function() {
                //console.log('Page Rendered');
                ph.exit();
				//res.download('./views/invoice_pdf/invoice' +order_id + '- customer' + '.pdf');
				var invoice_path='./views/invoice_pdf/invoice' +order_id + '- customer' + '.pdf';
				var sub=" Your Hungry Jars order - " +order_id;
				var email_text="<p>Hello " +user_name + ",<br><br><br> Thank you for ordering with Hungry Jars! Your order is being processed now and will be dispatched shortly.<br>  Please find attached your invoice. <br><br><br> Best, <br> Hungry Jars Team</p>"
				var mailOptions = {
                                                  from: '"Hungry Jars" <hungryjars@outlook.com>',
                                                  to:"hello@hungryjars.com",         //to:customer_email,
                                                  subject:sub,
                                                  html:email_text,
												  attachments: [{
                                                  filename: 'Invoice.pdf',
                                                  path:invoice_path,
                                                  contentType: 'application/pdf'
                                                  }]
                                 };
								 
								 transporter.sendMail(mailOptions, function(error, info){
                                                   if (error) {
                                                   console.log(error);
                                                   } else {
                                                    console.log('Email sent: ' + info.response);
                                                    }
                                                  });
				
				
            });
         });
      });
    }); 
	 
}

function verify_stock(modified_quantity)
{
	var stock_alert=new Array();
	for(var i=0;i<modified_quantity.length;i++)
	{
		if(modified_quantity.quantity_ordered!=0)
		{
		var actual_stock = Number(modified_quantity[i].stock) - Number(modified_quantity[i].quantity_ordered);
		if(actual_stock<0 && modified_quantity[i].on_order==0) 
		stock_alert.push(modified_quantity[i].product_id);	
		}
	}
	
	return stock_alert;
}


function check_stock(modified_quantity)
{
	var stock_alert=new Array();
	for(var i=0;i<modified_quantity.length;i++)
	{
		var actual_stock = Number(modified_quantity[i].stock) - Number(modified_quantity[i].quantity_ordered);
		if((actual_stock==5 || actual_stock==10 || actual_stock==0) && modified_quantity[i].on_order==0 ) 
		{
			stock_alert.push({
				product_id: modified_quantity[i].product_id,
				stock : actual_stock,
				});
        }	
	}
	
	
	
	
	for(var i=0;i<stock_alert.length;i++)
	{    console.log(stock_alert);
		var product_id=stock_alert[i].product_id;
		var actual_stock = stock_alert[i].stock;
		var sql="select name from product where product_id=" + product_id;
        con.query(sql,function(error,result){
			if(error) throw error;
			var product_name = result[0].name;
			var sub = "Stock Alert!";
			var email_text = product_name + " stock is " + actual_stock + ".";
			var mailOptions = {
                                                  from: '"Hungry Jars" <hungryjars@outlook.com>',
                                                  to:"hello@hungryjars.com",         //to:customer_email,
                                                  subject:sub,
                                                  html:email_text,
												  
                                 };
								 
								 transporter.sendMail(mailOptions, function(error, info){
                                                   if (error) {
                                                   console.log(error);
                                                   } else {
                                                    console.log('Email sent: ' + info.response);
                                                    }
                                                  });
			
		})		
	} 
}



function cal_discount_deduct(amount,discount_percentage)
{
	var discount_deduct_amount=(Number(amount)*Number(discount_percentage))/100;
	return discount_deduct_amount;
}

function retrive_net_amount(amount,tax_percentage)
{
	temp=(Number(amount)*Number(tax_percentage))/100;
	amount=Number(amount) - Number(temp);
	return amount;
}
	 
	 
function create_order(res,con,customer_id,modified_quantity,payment_type,order_source,user_note,total_discount,promo_code_id,modified_combo_quantity,customer_email,user_name,shipping_cost,discount_percentage)
{      
           var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
              
          // calculation for discount deduction amount		  
          var total_discount_in_rs=0
          if(promo_code_id!=0)
		  {
			   
				  for(var i=0;i<modified_quantity.length;i++)
				  {
					  var amount=modified_quantity[i].amount;
					  amount=cal_net_amount(amount,12);
					  var disc=cal_discount_deduct(amount,discount_percentage);
					  total_discount_in_rs = Number(total_discount_in_rs) + Number(disc); 
					 
				  }
				  
				  for(var i=0;i<modified_combo_quantity.length;i++)
				  {
					 var amount= modified_combo_quantity[i].amount;
					 amount=cal_net_amount(amount,12);
					 var disc=cal_discount_deduct(amount,discount_percentage);
					 total_discount_in_rs = Number(total_discount_in_rs) + Number(disc); 
					 
				  }

			 
		  } 
		  
		  // calculation for payable amount and tax amount
		  var total_amount_without_tax = 0;
		  if(modified_quantity)
		  {
		  for(var i=0;i<modified_quantity.length;i++)
		  {
			  var net_amount            = cal_net_amount(modified_quantity[i].amount);
			  var amount_after_discount = discount_deduction(net_amount,discount_percentage);
			  total_amount_without_tax  = Number(total_amount_without_tax) + Number(amount_after_discount);
		  }
		  }
		  
		  if(modified_combo_quantity)
		  {
		  for(var i=0;i<modified_combo_quantity.length;i++)
		  {
			  var net_amount            = cal_net_amount(modified_combo_quantity[i].amount);
			  var amount_after_discount = discount_deduction(net_amount,discount_percentage);
			  total_amount_without_tax  = Number(total_amount_without_tax) + Number(amount_after_discount);
		  }
		  }
		  
		  var tax_amount=cal_tax_amount(total_amount_without_tax,12);
		  var total_payable=Number(total_amount_without_tax) + Number(tax_amount) + Number(shipping_cost);
		  
		  
        var isokay = verify_stock(modified_quantity);
		if(isokay.length>0){res.send("-1"); return;}
		
        if(payment_type==="Gift") {var payment_received=1;} else { var payment_received=0;}
	    var sql="insert into orders SET ?";
	    var values={
			"payment_type"  : payment_type,
			"customer_id"   : customer_id,
			"order_source"  :order_source,
			"note"          :user_note,
			"status"        :1,
			"payment_received":payment_received,
			"total_discount_in_rs":total_discount_in_rs,
			"promo_code_id":promo_code_id,
			"order_date"   :time,
			"shipping_cost":shipping_cost,
			"amount_without_tax":total_amount_without_tax,
			"tax_amount"   :tax_amount,
			"total_payable":total_payable,
			"outlet_id"    :0,
		}
		con.query(sql,values,function(error,result){
			if(error) throw error;
			
			var order_id=result.insertId;
			
			// insert into order details table
			for(var i=0;i<modified_quantity.length;i++)
			{
				
				var sql="Insert into order_details SET ?";
				var product_id=modified_quantity[i].product_id;
				var jars      =modified_quantity[i].quantity_ordered;
				var amount    = modified_quantity[i].amount;
			    var values={
					"order_id"   :order_id,
					"product_id" :product_id,
					"jars"       :jars,
					"amount"     :amount,
					"sold"       :1,
				}
				con.query(sql,values,function(error,result){});
			}
			
			// deduct number of jars from the product table
			
			for(var i=0;i<modified_quantity.length;i++)
			{

				var product_id = modified_quantity[i].product_id;
				var jars       = modified_quantity[i].jars;
				var quantity_ordered = modified_quantity[i].quantity_ordered;
				
				var sql="update product set jars=jars-" + quantity_ordered + " WHERE product_id=" +product_id;
				con.query(sql,function(error,result){
				
				});
			}
			
			// insert into combo order details table
			for(var i=0;i<modified_combo_quantity.length;i++)
			{	
				var sql="Insert into combo_order_details SET ?";
				var combo_id=modified_combo_quantity[i].combo_id;
				var quantity_ordered=modified_combo_quantity[i].quantity_ordered;
				var amount    = modified_combo_quantity[i].amount;
			    var values={
					"order_id"   :order_id,
					"combo_id"   :combo_id,
					"quantity_ordered":quantity_ordered,
					"amount"     :amount,
				}
				con.query(sql,values,function(error,result){});
			}
			
			// deduct number of jars from the product table
			
			for(var i=0;i<modified_combo_quantity.length;i++)
			{
				var combo_id         = modified_combo_quantity[i].combo_id;
				var quantity_ordered = modified_combo_quantity[i].quantity_ordered;
				
				var sql="update product set jars=jars-1 WHERE product_id IN (SELECT product_id from combo_products WHERE combo_id=" +combo_id + ")";
				con.query(sql,function(error,result){})
			}
			
			// deduct promo remaning_valid_count by 1 
			var sql="update promo_code set remaning_valid_count= remaning_valid_count - 1 WHERE id=" +promo_code_id;
			con.query(sql,function(error,result){});
			
			res.send("1");
			
		    check_stock(modified_quantity);
		    
		});
}
	 
	 router.post("/post_order",function(req,res){
		 var user_name    = req.body.user_name;
		 var user_address = req.body.user_address;
		 var user_pincode = req.body.user_pincode;
		 var user_state   = req.body.user_state;
		 var user_city    = req.body.user_city;
         var user_phone   = req.body.user_phone;
         var modified_quantity = req.body.modified_quantity;
		 var modified_combo_quantity = req.body.modified_combo_quantity;
		 var payment_type = req.body.payment_type;
		 var order_source = req.body.order_source;
		 var user_note    = req.body.user_note;
		 var email        = req.body.user_email;
		 var total_discount= req.body.total_discount;
		 var promo_code_id = req.body.promo_code_id;
		 var shipping_cost = req.body.shipping_cost;
		 var discount_percentage=req.body.discount_percentage;
		 
		 if(promo_code_id===null || promo_code_id=="" || promo_code_id===undefined) {promo_code_id=0;}
		 //console.log(user_name + " " +user_address + "  " +user_phone + " " +payment_type + " " +order_source + " " +user_note + " " +user_pincode + " " +user_state + " " +user_city);
	   //console.log("promo_code_id" +promo_code_id);
	   if(modified_combo_quantity===undefined){modified_combo_quantity=new Array();}
	   if(modified_quantity===undefined){modified_quantity=new Array()}
		var sql="select * from customers WHERE phone=" +user_phone;
		con.query(sql,function(error,result){
			if(result.length!=0)
			{
				var sql="update customers set customer_name='" + user_name + "', customer_address='" + user_address + "', customer_state='" + user_state + "', city='" + user_city + "', pincode=" + user_pincode + ",phone=" + user_phone + ",email='" + email + "' where customer_id=" + result[0].customer_id;
               
                con.query(sql,function(error,customer_updated){
					if(error) throw error;
					console.log(customer_updated);
				var customer_id=result[0].customer_id;
				create_order(res,con,customer_id,modified_quantity,payment_type,order_source,user_note,total_discount,promo_code_id,modified_combo_quantity,email,user_name,shipping_cost,discount_percentage);
				})
			}
			else
			{
				var values={
					"customer_name"    :user_name,
					"customer_address" :user_address,
					"customer_state"   :user_state,
					"city"             :user_city,
					"pincode"          :user_pincode,
					"phone"            :user_phone,
					"email"            :email,
				}
				
				var sql="Insert into customers SET ?";
				con.query(sql,values,function(error,result){
					
					var customer_id=result.insertId;
					create_order(res,con,customer_id,modified_quantity,payment_type,order_source,user_note,total_discount,promo_code_id,modified_combo_quantity,email,user_name,shipping_cost,discount_percentage);
					
				})
			}
		})
 
	 });
	 
	 router.get("/generate_bill_customer",function(req,res){
		res.sendFile("./views/invoice.html",{root:'./'});
		var url=req.url;
 
	 });
	 
	 router.get("/generate_bill_merchant",function(req,res){
		res.sendFile("./views/invoice.html",{root:'./'});
		 
	 });
	 
	 router.get("/convert_to_pdf_customer",function(req,res){
		 var order_id=req.query.order_id;
		 var invoice_url="http://localhost:3000/" + "generate_bill_customer?order_id=" +order_id;

	   
		var phantom = require('phantom');   
        phantom.create().then(function(ph) {
         ph.createPage().then(function(page) {
          page.open(invoice_url).then(function(status) {
            page.render('./views/invoice_pdf/invoice' +order_id + '- customer' + '.pdf').then(function() {
                console.log('Page Rendered');
                ph.exit();
				res.download('./views/invoice_pdf/invoice' +order_id + '- customer' + '.pdf');
            });
         });
      });
    }); 
	   
		 
   })
 
   router.get("/convert_to_pdf_merchant",function(req,res){
	      
		  
		 var order_id=req.query.order_id;
		 var invoice_url="http://localhost:3000/" + "generate_bill_merchant?order_id=" +order_id;
	
	   
		var phantom = require('phantom');   
        phantom.create().then(function(ph) {
         ph.createPage().then(function(page) {
          page.open(invoice_url).then(function(status) {
            page.render('./views/invoice_pdf/invoice' + order_id +'-merchant' +'.pdf').then(function() {
                console.log('Page Rendered');
                ph.exit();
				res.download('./views/invoice_pdf/invoice' + order_id +'-merchant' +'.pdf');
            });
         });
      });
    }); 
	   
		 
   })


   router.get("/generate_shipping_excel",(req,res)=>{
	   var order_ids = req.query.order_ids;
	   var sql="SELECT orders.order_id as order_no ,customers.customer_name as consignee_name, customers.city, customers.customer_state as state, customers.customer_address as address, customers.pincode, customers.phone as mobile, (SELECT COUNT(product.product_id)*400 as products from product join order_details where order_details.product_id=product.product_id and order_details.order_id=orders.order_id ) as weight, orders.total_payable as package ,(SELECT GROUP_CONCAT(DISTINCT CONCAT (product.name,'(',product.selling_quantity_gms,'g)') SEPARATOR ',') as products from product join order_details where order_details.product_id=product.product_id and order_details.order_id=orders.order_id ) as product_to_be_shipped from orders join customers on customers.customer_id=orders.customer_id join order_details on orders.order_id=order_details.order_id and orders.order_id IN (" + order_ids + ") GROUP by orders.order_id ";
	
	con.query(sql,(error,result)=>{
		if(error) throw error;
		
			var sql="SELECT orders.order_id as order_no ,customers.customer_name as consignee_name, customers.city, customers.customer_state as state, customers.customer_address as address, customers.pincode, customers.phone as mobile, (SELECT COUNT(combo_products.product_id)*400 as products from combo_products join combos where combos.combo_id=combo_products.combo_id and combos.combo_id=combo_order_details.combo_id and combo_order_details.order_id=orders.order_id ) as weight, orders.total_payable as package , (SELECT GROUP_CONCAT(combos.combo_name SEPARATOR ',') as products from combos join combo_order_details where combo_order_details.combo_id=combos.combo_id and combo_order_details.order_id=orders.order_id ) as product_to_be_shipped from orders join customers on customers.customer_id=orders.customer_id join combo_order_details on orders.order_id=combo_order_details.order_id and orders.order_id IN (" + order_ids  +") GROUP by orders.order_id";
			
			con.query(sql,(error,combo_result)=>{
				if(error) throw error;
				Array.prototype.push.apply(result,combo_result); 
				generate_shipping_excel(result,res);
			}) 
	})

})
   
   
 router.get("/generate_sl",function(req,res){
	 var order_ids=req.query.order_ids;
	 var sql="select customers.customer_name, customers.customer_address, customers.customer_state, customers.city, customers.pincode, customers.phone, customers.email from customers JOIN orders WHERE orders.customer_id=customers.customer_id AND orders.order_id IN (" + order_ids + ")";
	 
	 con.query(sql,function(error,result){
		 if(error) throw error;
	  generate_word_sl(result,res);
	 })
	 
	 
	 
 }); 
 
function generate_word_sl(result,res)
{
     
    var fs        = require("fs")
    var officegen = require('officegen');
	var docx      = officegen ( 'docx' );
   
   var pObj = docx.createP ();
   var table = [];
if(result.length>1)
{
for(var i=0;i<result.length;i+=2)
{    
    if(typeof result[i]!=="undefined")
	{
	var data1=result[i].customer_name +  "                                                                               " + result[i].customer_address + "                                                                                " +result[i].city + "," +result[i].customer_state +  " - " +result[i].pincode + "                                                      " +result[i].phone;
	}
	else
	{
		var data1="";
	}
	
   if(typeof result[i+1]!=="undefined")
   {
   var data2 = result[i+1].customer_name +  "                                                                            " + result[i+1].customer_address + "                                                                               " +result[i+1].city + "," +result[i+1].customer_state +  " - " +result[i+1].pincode + "                                                              " +result[i+1].phone; 
   }
   else
   {
	   var data2="";
   }
	table.push([
	             {
					val:data1,
                    opts:{
						cellColWidth: 8261,
                        fontFamily: "Verdana",
						fontSize:12,
						sz:'18',
					}					
				 },
			     {
					val:data2,
                    opts:{
						cellColWidth: 8261,
                        fontFamily: "Verdana",
						fontSize:12,
						sz:'18',
					}				
				 } 
	           ]);
			   
}
}
else
{
	var data1=result[0].customer_name +  "                                                                                                                          " + result[0].customer_address + "                                                                                                   " +result[0].city + "," +result[0].customer_state +  " - " +result[0].pincode + "                                                                                                               " +result[0].phone;
	
	table.push([
	             {
					val:data1,
                    opts:{
						cellColWidth: 8261,
                        fontFamily: "Verdana",
						fontSize:12,
						sz:'18',
					}					
				 },
			
	           ]);
	
}
//table.push(["3","This is a sdfjsdfksjdf"]);
 
var tableStyle = {
  tableColWidth: 8261,
  tableColHeight:8261,
  tableSize: 54,
  tableAlign: "left",
  tableFontFamily: "Verdana",
  tableFontSize:10,
  borders: false
}
 
    docx.createTable (table, tableStyle);
 
 
   
 
   var out = fs.createWriteStream ( 'slip_label.docx' );

     docx.generate ( out );
     out.on ( 'close', function () {
     console.log ( 'Finished to create the DOCX file!' );
	 res.download("slip_label.docx");
     });
   
 }
 
 
 router.get("/print_excel_of_filtered_data",function(req,res){
	 var month=req.query.month;
	 var year=req.query.year;
	 var order_source = req.query.order_source;
	 
	 if(month!="" && year=="")
	 {
		  var time1="2018-" +month + "-1 00:00:00";
          var time2="2018-" +month + "-31 23:59:59";
		  create_excel_accoring_to_time(time1,time2,con,req,res,order_source);
	 }
	 else if(month=="" && year!="")        // 
	 {
		 var time1=year +"-1-1 00:00:00";
         var time2=year +"-12-31 23:59:59";
         create_excel_accoring_to_time(time1,time2,con,req,res,order_source);
	 }
	 else if(month!="" && year!="")
	 {
		 var time1= year + "-" +month + "-1 00:00:00";
         var time2= year + "-" +month + "-31 23:59:59";	
		 create_excel_accoring_to_time(time1,time2,con,req,res,order_source);
	 }
	 else if(month=="" && year=="")
	 {
		 var time1= "2017-1-1 00:00:00";
         var time2= "2080-12-31 23:59:59";	
		 create_excel_accoring_to_time(time1,time2,con,req,res,order_source);
	 }
	 
	 
 });
 
function cal_tax_amount(amount,tax_percentage)
{
	var tax_amount=(Number(amount) * Number(tax_percentage))/100;

	return tax_amount;
}

function cal_tax_amount_for_excel(amount,tax_percentage)
{
	var tax_amount=(Number(amount) * Number(tax_percentage))/100;
   // tax_amount=Number(amount) - Number(tax_amount);
	return tax_amount;
}


function cal_total_amount(net_amount,tax_percentage)
{
	var tax_amount=(Number(net_amount) * Number(tax_percentage))/100;
	var total_amount=Number(net_amount) + Number(tax_amount);
	return total_amount;
}

function discount_deduct(amount,discount_percentage)
{
	var net=amount;
	if(Number(discount_percentage)!=0)
	{
	net=(Number(amount) * Number(discount_percentage))/100; 
	net=Number(amount) - Number(net);
	return net;
	}
	else
	{
		return net;
	}
}
 
 function create_excel_accoring_to_time(time1,time2,con,req,res,order_source)
 {   
      var t=new Date(time1);
      var t=moment(t).format("MMM Do YY");
	  var filename="./views/excel_sheets/Sales - " + t +".xlsx";
		 
	  if(order_source=="")
	  {
	  var sql="select orders.amount_without_tax, orders.tax_amount, orders.total_payable, orders.order_id, orders.order_date, orders.total_discount_in_rs, orders.shipping_cost,  customers.customer_name, customers.phone, customers.customer_address,product.name, SUM(order_details.jars) total_quantity, SUM(order_details.amount) amount, SUM(combo_order_details.quantity_ordered) total_combo_quantity, SUM(combo_order_details.amount) combo_amount, orders.payment_type, orders.note, orders.order_source, orders.status, (SELECT GROUP_CONCAT(combos.combo_name SEPARATOR ',')  combos) AS combo_name, (SELECT GROUP_CONCAT(DISTINCT CONCAT(product.name,'(',product.selling_quantity_gms,'g)')  SEPARATOR ',')  product) AS name  from orders LEFT JOIN customers ON orders.customer_id=customers.customer_id  LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT join product ON product.product_id=order_details.product_id LEFT JOIN combos ON combos.combo_id=combo_order_details.combo_id  WHERE (orders.order_date>='" + time1 +"' AND orders.order_date<='" +time2+"')  GROUP BY orders.order_id ORDER BY orders.order_date ASC";
	  }
	  else
	  {
		  var sql="select orders.amount_without_tax, orders.tax_amount, orders.total_payable, orders.order_id, orders.order_date, orders.total_discount_in_rs, orders.shipping_cost,  customers.customer_name, customers.phone, customers.customer_address,product.name, SUM(order_details.jars) total_quantity, SUM(order_details.amount) amount, SUM(combo_order_details.quantity_ordered) total_combo_quantity, SUM(combo_order_details.amount) combo_amount, orders.payment_type, orders.note, orders.order_source, orders.status, (SELECT GROUP_CONCAT(combos.combo_name SEPARATOR ',')  combos) AS combo_name, (SELECT GROUP_CONCAT(DISTINCT CONCAT(product.name,'(',product.selling_quantity_gms,'g)')  SEPARATOR ',')  product) AS name  from orders LEFT JOIN customers ON orders.customer_id=customers.customer_id  LEFT JOIN combo_order_details ON orders.order_id=combo_order_details.order_id LEFT JOIN order_details ON orders.order_id=order_details.order_id LEFT join product ON product.product_id=order_details.product_id LEFT JOIN combos ON combos.combo_id=combo_order_details.combo_id  WHERE (orders.order_date>='" + time1 +"' AND orders.order_date<='" +time2+"') and orders.order_source ='" + order_source + "'  GROUP BY orders.order_id ORDER BY orders.order_date ASC";
	  }
		  
		  con.query(sql,function(error,result){
			  if(error) throw error;
			  
			  
			  
			  var excel = require('excel4node');
              var workbook = new excel.Workbook();
              var worksheet = workbook.addWorksheet('Sheet 1');

              var style = workbook.createStyle({
              font: {
                color: 'black',
                size: 12,
	            fontWeight:'bold',
              },
             });
           worksheet.cell(1,1).string('Order ID').style(style);
           worksheet.cell(1,2).string('Order Date').style(style);
           worksheet.cell(1,3).string('Name').style(style);
           worksheet.cell(1,4).string('Phone').style(style);
           worksheet.cell(1,5).string('Address').style(style);
           worksheet.cell(1,6).string('Items').style(style);
           worksheet.cell(1,7).string('Total Quantity').style(style); 
		   worksheet.cell(1,8).string('Net Amount').style(style);
		   worksheet.cell(1,9).string('Shipping Amount').style(style);
		   worksheet.cell(1,10).string('Tax Amount').style(style);
		   worksheet.cell(1,11).string('Total Cost').style(style);
           worksheet.cell(1,12).string('Payment Method').style(style);
		   worksheet.cell(1,13).string('Notes').style(style);
		   worksheet.cell(1,14).string('Order Source').style(style);
		   worksheet.cell(1,15).string('Payment Status').style(style);
           var row=2;
           var col=1;
		  
		  
          for(var i=0;i<result.length;i++)
           {
               if(!!result[i].total_quantity)	
			   {				   
	           var sno=Number(i)+1;
			   var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 4).join(' ');
				var product_name="";
				if(result[i].name===null) {product_name=""} else { product_name=result[i].name;}
				
				var net = result[i].amount_without_tax;
				var tax_amount=result[i].tax_amount;
				var total_cost=result[i].total_payable;
				
				net       =Math.round(net);
				tax_amount=Math.round(tax_amount);
				total_cost=Math.round(total_cost);
				
				var status="";
				if(result[i].status==1){status="Order Placed"}
				if(result[i].status==2){status="Dispatched"}
				if(result[i].status==3){status="Delievered"}
			    if(result[i].status==4){status="Cancelled"}
				if(result[i].status==5){status="Payment Received"}
			   
	         worksheet.cell(row,1).number(Number(result[i].order_id)).style(style);
			 worksheet.cell(row,2).string(date_string).style(style);
			 worksheet.cell(row,3).string(result[i].customer_name).style(style);
			 worksheet.cell(row,4).number(Number(result[i].phone)).style(style);
			 worksheet.cell(row,5).string(result[i].customer_address).style(style);
			 worksheet.cell(row,6).string(product_name).style(style);
			 worksheet.cell(row,7).number(Number(result[i].total_quantity)).style(style);
			 worksheet.cell(row,8).number(Number(net)).style(style);
			 worksheet.cell(row,9).number(Number(result[i].shipping_cost)).style(style);
			 worksheet.cell(row,10).number(Number(tax_amount)).style(style);
			 worksheet.cell(row,11).number(Number(total_cost)).style(style);
			 worksheet.cell(row,12).string(result[i].payment_type).style(style);
			 worksheet.cell(row,13).string(result[i].note).style(style);
			 worksheet.cell(row,14).string(result[i].order_source).style(style);
			 worksheet.cell(row,15).string(status).style(style);
	           
			 }
			 else
			 {
				//console.log("Row in first->" +row); 
				var date_string=result[i].order_date;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 4).join(' ');
				var product_name="";
				if(result[i].name===null) {product_name=result[i].combo_name;} 
				
				var net = result[i].amount_without_tax;
				var tax_amount=result[i].tax_amount;
				var total_cost=result[i].total_payable;
				
				net       =Math.round(net);
				tax_amount=Math.round(tax_amount);
				total_cost=Math.round(total_cost);
				
				var status="";
				if(result[i].status==1){status="Order Placed"}
				if(result[i].status==2){status="Dispatched"}
				if(result[i].status==3){status="Delievered"}
			    if(result[i].status==4){status="Cancelled"}
			   
	         worksheet.cell(row,1).number(Number(result[i].order_id)).style(style);
			 worksheet.cell(row,2).string(date_string).style(style);
			 worksheet.cell(row,3).string(result[i].customer_name).style(style);
			 worksheet.cell(row,4).number(Number(result[i].phone)).style(style);
			 worksheet.cell(row,5).string(result[i].customer_address).style(style);
			 worksheet.cell(row,6).string(product_name).style(style);
			 worksheet.cell(row,7).number(Number(result[i].total_combo_quantity)).style(style);
			 worksheet.cell(row,8).number(Number(net)).style(style);
			 worksheet.cell(row,9).number(Number(result[i].shipping_cost)).style(style);
			 worksheet.cell(row,10).number(Number(tax_amount)).style(style);
			 worksheet.cell(row,11).number(Number(total_cost)).style(style);
			 worksheet.cell(row,12).string(result[i].payment_type).style(style);
			 worksheet.cell(row,13).string(result[i].note).style(style);
			 worksheet.cell(row,14).string(result[i].order_source).style(style);
			 worksheet.cell(row,15).string(status).style(style);
	           
				
			 }
			 row++;
           } 
	
	  
	     
       workbook.write(filename,function(){
		   res.download(filename);
	   }); 
	 
	})
      
 }

 function generate_shipping_excel(result,res)
 {
	var workbook = new excel.Workbook();
	var worksheet = workbook.addWorksheet('Sheet 1');

	var style = workbook.createStyle({
	font: {
	  color: 'black',
	  size: 12,
	  fontWeight:'bold',
	},
   });
   
   worksheet.cell(1,1).string('Waybill').style(style);
   worksheet.cell(1,2).string('Order No').style(style);
   worksheet.cell(1,3).string('Consignee Name').style(style);
   worksheet.cell(1,4).string('City').style(style);
   worksheet.cell(1,5).string('State').style(style);
   worksheet.cell(1,6).string('Country').style(style);
   worksheet.cell(1,7).string('Address').style(style);
   worksheet.cell(1,8).string('Pincode').style(style);
   worksheet.cell(1,9).string('Phone').style(style);
   worksheet.cell(1,10).string('Mobile').style(style);
   worksheet.cell(1,11).string('Weight').style(style);
   worksheet.cell(1,12).string('Payment Mode').style(style);
   worksheet.cell(1,13).string('Package Amount').style(style);
   worksheet.cell(1,14).string('Cod Amount').style(style);
   worksheet.cell(1,15).string('Product to be Shipped').style(style);
   worksheet.cell(1,16).string('Return Address').style(style);
   worksheet.cell(1,17).string('Return Pin').style(style);
   worksheet.cell(1,18).string('Seller Name').style(style);
   worksheet.cell(1,19).string('Seller Address').style(style);
   worksheet.cell(1,20).string('Seller CST No').style(style);
   worksheet.cell(1,21).string('Seller TIN').style(style);
   worksheet.cell(1,22).string('Invoice No').style(style);
   worksheet.cell(1,23).string('Invoice Date').style(style);
   worksheet.cell(1,24).string('Length').style(style);
   worksheet.cell(1,25).string('Breadth').style(style);
   worksheet.cell(1,26).string('Height').style(style);
   worksheet.cell(1,27).string('Quality').style(style);
   worksheet.cell(1,28).string('Commodity Value').style(style);
   worksheet.cell(1,29).string('Tax Value').style(style);
   worksheet.cell(1,30).string('Category of Goods').style(style);
   worksheet.cell(1,31).string('Sales Tax Form ack no').style(style);
   worksheet.cell(1,32).string('Consignee TIN').style(style);
   worksheet.cell(1,33).string('Shipping Client').style(style);
   worksheet.cell(1,34).string('Seller_GST_TIN').style(style);
   worksheet.cell(1,35).string('Client_GST_TIN').style(style);
   worksheet.cell(1,36).string('Consignee_GST_TIN').style(style);
   worksheet.cell(1,37).string('Invoice_Reference').style(style);
   worksheet.cell(1,38).string('HSN_Code').style(style);
   worksheet.cell(1,39).string('Return Reason').style(style);
   worksheet.cell(1,40).string('Vendor Pickup Location').style(style);
   worksheet.cell(1,41).string('EWBN').style(style);
   worksheet.cell(1,42).string('Supply_Sub_Type').style(style);
   worksheet.cell(1,43).string('Document_Type').style(style);
   worksheet.cell(1,44).string('Document_Number').style(style);
   worksheet.cell(1,45).string('Document_Date').style(style);
   worksheet.cell(1,46).string('OD_Distance').style(style);

   var row=2;
   for(var i=0;i<result.length;i++)
   {
    worksheet.cell(row,1).string("").style(style);
	worksheet.cell(row,2).number(result[i].order_no).style(style);
	worksheet.cell(row,3).string(result[i].consignee_name).style(style);
	worksheet.cell(row,4).string(result[i].city).style(style);
	worksheet.cell(row,5).string(result[i].state).style(style);
	worksheet.cell(row,6).string("").style(style);
	worksheet.cell(row,7).string(result[i].address).style(style);
	worksheet.cell(row,8).number(result[i].pincode).style(style);
	worksheet.cell(row,9).string("").style(style);
	worksheet.cell(row,10).number(result[i].mobile).style(style);
	worksheet.cell(row,11).number(result[i].weight).style(style);
	worksheet.cell(row,12).string('prepaid').style(style);
	worksheet.cell(row,13).number(result[i].package).style(style);
	worksheet.cell(row,14).number(0).style(style);
	worksheet.cell(row,15).string(result[i].product_to_be_shipped).style(style);
	worksheet.cell(row,16).string('122, 4th Floor, Shahpur Jat, New Delhi').style(style);
	worksheet.cell(row,17).number(110049).style(style);
	worksheet.cell(row,18).string('Hungry Jars').style(style);
	worksheet.cell(row,19).string("").style(style);
	worksheet.cell(row,20).string("").style(style);
	worksheet.cell(row,21).string("").style(style);
	worksheet.cell(row,22).string("").style(style);
	worksheet.cell(row,23).string("").style(style);
	worksheet.cell(row,24).string("").style(style);
	worksheet.cell(row,25).string("").style(style);
	worksheet.cell(row,26).string("").style(style);
	worksheet.cell(row,27).string("").style(style);
	worksheet.cell(row,28).string("").style(style);
	worksheet.cell(row,29).string("").style(style);
	worksheet.cell(row,30).string("").style(style);
	worksheet.cell(row,31).string("").style(style);
	worksheet.cell(row,32).string("").style(style);
	worksheet.cell(row,33).string("").style(style);
	worksheet.cell(row,34).string("").style(style);
	worksheet.cell(row,35).string("").style(style);
	worksheet.cell(row,36).string("").style(style);
	worksheet.cell(row,37).string("").style(style);
	worksheet.cell(row,38).string("").style(style);
	worksheet.cell(row,39).string("").style(style);
	worksheet.cell(row,40).string("").style(style);
	worksheet.cell(row,41).string("").style(style);
	worksheet.cell(row,42).string("").style(style);
	worksheet.cell(row,43).string("").style(style);
	worksheet.cell(row,44).string("").style(style);
	worksheet.cell(row,45).string("").style(style);
	worksheet.cell(row,46
	).string("").style(style);


    row++
   }
 
   var filename="./views/excel_sheets/Shipping_excel.xlsx";
   workbook.write(filename,function(){
	res.download(filename);
    }); 

 }
 

router.get("/get_location_from_pincode",function(req,res){
	 
var pincode_no = req.query.pincode;

var pin = require("pincode");
console.log(pincode_no);
var response=0;
pin.seachByPin(pincode_no, function (response){

    var l=response.length;
   var city  = response[l-1].DistrictName;
   var state = response[l-1].StateName;
   res.json({'city':city,'state':state})
 });
});
	 
	 
  return router;
})();