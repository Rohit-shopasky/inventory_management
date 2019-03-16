module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: '587',
    auth: { user: 'hungryjars@outlook.com', pass: '123456789hii' },
    secureConnection: false,
    tls: { ciphers: 'SSLv3' }
});
	  
	router.get("/edit_order",function(req,res){
		var order_id=req.query.order_id;
	    var sql="select order_details.product_id, order_details.jars, order_details.amount, product.name, product.price,product.on_order FROM product LEFT JOIN order_details ON product.product_id=order_details.product_id AND order_details.order_id=" +order_id + " order by product.category_id ASC";
		
		con.query(sql,function(error,result){
			if(error) throw error;
			
			var sql="select customers.customer_name, customers.customer_address, customers.customer_state, customers.city, customers.pincode, customers.phone, customers.email, orders.promo_code_id , orders.payment_type, orders.order_source, orders.note, orders.shipping_cost from customers JOIN orders WHERE orders.customer_id=customers.customer_id AND orders.order_id=" +order_id;
			
			con.query(sql,function(error,customer){
				if(error) throw error;
				
				var sql="select promo_code.id, promo_code.code, orders.promo_code_id from promo_code LEFT join orders ON orders.promo_code_id=promo_code.id AND promo_code.start_date < promo_code.end_date AND orders.order_id=" +order_id;
				con.query(sql,function(error,promo_code){
					if(error) throw error;

					 // all products
					   var sql="select * from product order by product.category_id ASC";
					   con.query(sql,function(error,all_products){
                                
						     var sql="select * from combos";
							 
							 con.query(sql,function(error,combo_products){
								 
								 var sql="select combos.combo_id, combo_order_details.quantity_ordered  from combos left join combo_order_details on combos.combo_id=combo_order_details.combo_id GROUP BY combos.combo_id";
								 
								 con.query(sql,function(error,combo_quantity){
									 
									  // get all soled jars  from order details
						 
						                var sql="select product.product_id, product.on_order, SUM(order_details.jars) AS sold from product left join order_details on product.product_id=order_details.product_id group by product.product_id order by product.category_id,product.product_id";
						                 con.query(sql,function(error,sum_of_order_details){
											 
											  // get all sold jars from combo order details
					                          var sql="SELECT combo_products.combo_id, combo_products.product_id, combo_order_details.quantity_ordered from combo_products join combo_order_details where combo_products.combo_id = combo_order_details.combo_id";
							                   con.query(sql,function(error,combo_products_order_detail){
												   
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
								 
								 
								 for(var i=0;i<all_products.length;i++)
								{
									var balance = Number(all_stock[i].jars) - Number(sum_of_order_details[i].sold);
									
									var product_name = all_products[i].name;
									var stock = balance;
									
								}
									 
						                                 
									res.render("edit_order.ejs",{result:result,order_no:order_id,customer:customer,promo_code:promo_code,all_products:all_products,combo_products:combo_products,combo_quantity:combo_quantity,sum_of_order_details:sum_of_order_details,all_stock:all_stock}); 
										});
								         });
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
	
	router.get("/already_ordered_q",function(req,res){
		var order_id=req.query.order_id;
	     var sql="select * from order_details WHERE order_id=" +order_id;
		 con.query(sql,function(error,result){
			 //console.log(result)
			 res.send(result);
		 })
	});
	
	router.get("/already_ordered_combo_quantity",function(req,res){
		var order_id=req.query.order_id;
		var sql="select * from combo_order_details where order_id=" +order_id;
		con.query(sql,function(error,result){
	
			res.send(result);
		})
	});
	
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
		if((actual_stock<5 || actual_stock<10) && modified_quantity[i].on_order==0 ) 
		{
			stock_alert.push({
				product_id: modified_quantity[i].product_id,
				stock : actual_stock,
				});
        }	
	}
	
	//console.log(stock_alert);
	/*for(var i=0;i<stock_alert;i++)
	{
		console.log(stock_alert[i].product_id + " " + stock_alert[i].stock);
	} */
	
	
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
	
function edit_order(res,con,customer_id,order_id,payment_type,order_source,note,total_discount_in_rs,promo_code_id,modified_quantity,modified_combo_quantity,user_id,shipping_cost,discount_percentage)
{
		// update promo remaning_valid_count
		  // var isokay = verify_stock(modified_quantity);
		//if(isokay.length>0){res.send("-1"); return;}
		
		var sql="select promo_code_id from orders WHERE order_id=" +order_id;
		con.query(sql,function(error,result){
			if(error) throw error;
			var db_promo_code_id=result[0].promo_code_id;
			if(db_promo_code_id != promo_code_id)
			{
				if((promo_code_id==0) && (db_promo_code_id!=0))
				{
					// +1
					console.log("+1" + promo_code_id);
					var sql="update promo_code set remaning_valid_count=remaning_valid_count+1 where id=" +db_promo_code_id;
					con.query(sql,function(error,result){
						if(error) throw error;
					});
				}
				else
				{
					//-1
					console.log("-1");
					var sql="update promo_code set remaning_valid_count=remaning_valid_count - 1 where id=" +promo_code_id;
					con.query(sql,function(error,result){});
				}
			}
		}) 
		
		total_discount_in_rs=0;
		if(discount_percentage!=0)
		{
			if(modified_quantity)
			{
			 for(var i=0;i<modified_quantity.length;i++)
				  {
					  var amount=modified_quantity[i].amount;
					  amount=retrive_net_amount(amount,12);
					  var disc=cal_discount_deduct(amount,discount_percentage);
					  total_discount_in_rs = Number(total_discount_in_rs) + Number(disc); 
					 
				  }
			}
			if(modified_combo_quantity)
			{
				  for(var i=0;i<modified_combo_quantity.length;i++)
				  {
					 var amount= modified_combo_quantity[i].amount;
					 amount=retrive_net_amount(amount,12);
					 var disc=cal_discount_deduct(amount,discount_percentage);
					 total_discount_in_rs = Number(total_discount_in_rs) + Number(disc); 
					 
				  }
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
		  for(var i=0;(i<modified_combo_quantity.length);i++)
		  {
			  var net_amount            = cal_net_amount(modified_combo_quantity[i].amount);
			  var amount_after_discount = discount_deduction(net_amount,discount_percentage);
			  total_amount_without_tax  = Number(total_amount_without_tax) + Number(amount_after_discount);
		  }
		  }
		  
		  var tax_amount=cal_tax_amount(total_amount_without_tax,12);
		  var total_payable=Number(total_amount_without_tax) + Number(tax_amount) + Number(shipping_cost);
		
		 // update only orders table
		var sql="update orders SET payment_type='" + payment_type + "', order_source='" + order_source + "', note='" + note + "', total_discount_in_rs=" +total_discount_in_rs + ", promo_code_id=" +promo_code_id + ", shipping_cost=" + shipping_cost + ", amount_without_tax="+ total_amount_without_tax + ", tax_amount="+ tax_amount +", total_payable="+total_payable + ", customer_id=" + customer_id + " WHERE order_id=" +order_id;
		con.query(sql,function(error,result){
			if(error) throw error;
			
			// update order details table
			if(modified_quantity)
			{
			var sql="delete from order_details WHERE order_id=" +order_id;
			con.query(sql,function(error,result){
				if(error) throw error;
		
			   for(var i=0;i<modified_quantity.length;i++)
			   {
				 if(modified_quantity[i].quantity_ordered!=0)
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
				  }
				   con.query(sql,values,function(error,result){});
			     } 
			   }
			   
			  //update no of jars in products table
			  for(var i=0;i<modified_quantity.length;i++)
			  {
				  var product_id=modified_quantity[i].product_id;
				  var jars=modified_quantity[i].updated_no_of_jars;
				  var sql="update product SET jars=" +jars + " WHERE product_id=" +product_id;
                  con.query(sql,function(error,result){
					  //console.log(result);
					  
				  })				  
			  }	
			})
			
		}
			
			// update combo order details table	
			if(modified_combo_quantity)
			{
             var sql="delete from combo_order_details WHERE order_id=" +order_id;
             con.query(sql,function(error,result){
				 
				    for(var i=0;i<modified_combo_quantity.length;i++)
				    {
						if(modified_combo_quantity[i].quantity_ordered!=0)
						{
						var combo_id=modified_combo_quantity[i].combo_id;
				        var quantity_ordered=modified_combo_quantity[i].quantity_ordered;
				         var amount = modified_combo_quantity[i].amount;
						var sql="insert into combo_order_details set ?";
						var values={
							"order_id":order_id,
							"combo_id":combo_id,
							"quantity_ordered":quantity_ordered,
							"amount":amount
						}
					   con.query(sql,values,function(error,result){
						   if(error) throw error;
					   })
					   
					  }
					}
					
				//update no of jars in products table
				
				for(var i=0;i<modified_combo_quantity.length;i++)
				{
					var combo_id=modified_combo_quantity[i].combo_id;
				    var updated_quantity = modified_combo_quantity[i].updated_quantity;
					if(updated_quantity)
					{
						console.log(updated_quantity);
						if(updated_quantity<0)
						{
							// jars=jars + 1 or something
							updated_quantity=Math.abs(updated_quantity);
							
							var sql="update product set jars=jars+2  WHERE product_id IN(select product_id from combo_products WHERE combo_id=" +  combo_id +")"
						     con.query(sql,function(error,result){
							    if(error) throw error;
							     console.log(result);
						     }) 
						}
						if(updated_quantity==0)
						{
							// jars=jars - 1
							var sql="update product set jars=jars -1  WHERE product_id IN(select product_id from combo_products WHERE combo_id=" +  combo_id +")"
						     con.query(sql,function(error,result){
							if(error) throw error;
						     }) 
						}
						if(updated_quantity>0)
						{
							// jars=jars - updated_quantity
							var sql="update product set jars=jars -" + updated_quantity + " WHERE product_id IN(select product_id from combo_products WHERE combo_id=" +  combo_id +")"
						     con.query(sql,function(error,result){
							if(error) throw error;
						     }) 
						}
						
					}
					else
					{
					}
				}
			 
			 })		
		  }			 

		})
		
		
		
		// insert into order_log
		
		var sql="insert into order_logs SET ?";
		var values={
			"order_id"   : order_id, 
			"text"       : "Order Edited",
			"user_id"    : user_id,
 			
		}
		con.query(sql,values,function(error,result){
			if(error) throw error;
		})
		check_stock(modified_quantity);
		res.send("1");
}
	
	router.get("/cancel_promo_in_edit_order",function(req,res){
		var order_id=req.query.order_id;
		var promo_code_id=req.query.promo_code_id;
		var sql="update promo_code SET remaning_valid_count=remaning_valid_count + 1   WHERE id=" +promo_code_id;
		 con.query(sql,function(error,result){
			 //console.log(result);
			 //res.send("1");
			 var sql="update orders SET promo_code_id=0, total_discount_in_rs=0 WHERE order_id=" +order_id;
			 con.query(sql,function(error,result){
				 //console.log(result);
				 res.send("1");
			 })
		 })
		
	})
	
	
	router.post("/save_edited_order",function(req,res){
		 var user_name    = req.body.user_name;
		 var user_address = req.body.user_address;
		 var user_pincode      = req.body.user_pincode;
		 var user_state   = req.body.user_state;
		 var user_city    = req.body.user_city;
         var user_phone   = req.body.user_phone;
         var modified_quantity = req.body.modified_quantity;
		 var payment_type = req.body.payment_type;
		 var order_source = req.body.order_source;
		 var user_note    = req.body.user_note;
		 var email        = req.body.user_email;
		 var total_discount_in_rs= req.body.total_discount;
		 var promo_code_id = req.body.promo_code_id;
		 var order_id      = req.body.order_id;
		 var modified_combo_quantity=req.body.modified_combo_quantity;
		 var user_id       = req.body.user_id;
		 var shipping_cost = req.body.shipping_cost;
		 var discount_percentage=req.body.discount_percentage;
		
		if(promo_code_id===null || promo_code_id=="" || promo_code_id===undefined) {promo_code_id=0;}
		
		var sql="select * from customers WHERE phone=" +user_phone;
		con.query(sql,function(error,result){
			if(result.length!=0)
			{
				var customer_id=result[0].customer_id;
				var sql="UPDATE customers SET customer_name='" + user_name + "', customer_address='" + user_address + "', customer_state='" + user_state + "', city='" + user_city + "', pincode=" + user_pincode + ", email='" +email + "' WHERE customer_id=" +customer_id;

                con.query(sql,function(error,result){
					if(error) throw error;
					
					edit_order(res,con,customer_id,order_id,payment_type,order_source,user_note,total_discount_in_rs,promo_code_id,modified_quantity,modified_combo_quantity,user_id,shipping_cost,discount_percentage);
					
				})
             				
			}
			else
			{
				var sql="INSERT INTO customers SET ?";
				var values={
					"customer_name"    :user_name,
					"customer_address" :user_address,
					"customer_state"   :user_state,
					"city"             :user_city,
					"pincode"          :user_pincode,
					"phone"            :user_phone,
					"email"            :email,
				};
				con.query(sql,values,function(error,result){
					var customer_id = result[0].insertId;
					edit_order(res,con,customer_id,order_id,payment_type,order_source,user_note,total_discount_in_rs,promo_code_id,modified_quantity,modified_combo_quantity,user_id,shipping_cost,discount_percentage);
					res.send("1");
				})
			}
		});
	});
	
	router.get("/get_total_discount_in_rs",function(req,res){
		var order_id=req.query.order_id;
		var sql="select discount_percentage from promo_code JOIN orders WHERE orders.promo_code_id=promo_code.id AND orders.order_id='" +order_id + "'";
		con.query(sql,function(error,result){
			if(error) throw error;
			//console.log(result);
			res.send(result);
		});
	})
	 
  return router;
})();