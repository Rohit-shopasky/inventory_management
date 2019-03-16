module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	  
	
	router.get("/edit_outlet_order",function(req,res){
		
		var order_id = req.query.order_id;
		
		// all products for show
		var sql="select * from product order by product.category_id ASC";

		con.query(sql,function(error,all_products){
			if(error) throw error;
			
			// populate jars in order products
			var sql="select order_details.product_id, order_details.jars, order_details.amount, product.name, product.on_order, product.price FROM product LEFT JOIN order_details ON product.product_id=order_details.product_id AND order_details.order_id='" +order_id + "' order by product.product_id ASC";
			
			con.query(sql,function(error,result){
				if(error) throw error
				
				// all combos for show
				
				var sql="select * from combos";
				con.query(sql,function(error,combo_products){
					if(error) throw error;
					
					var sql="select combos.combo_id, combo_order_details.quantity_ordered  from combos left join combo_order_details on combos.combo_id=combo_order_details.combo_id GROUP BY combos.combo_id";
					
					con.query(sql,function(error,combo_quantity){
						if(error) throw error;

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
						
						
						var sql="select * from outlet_orders where order_id='" + order_id + "'";
						con.query(sql,function(error,order_details){
							if(error) throw error;
								res.render("edit_outlet_order.ejs",{all_products:all_products,order_no:order_id,result:result,combo_products:combo_products,combo_quantity:combo_quantity,order_details:order_details,all_stock:all_stock,sum_of_order_details:sum_of_order_details});	
						})
						})
						})
						})
						})
					})
				})
				
			
			})
			
			
		})
		
		
		
	});
	
	
	router.get("/already_outlet_ordered_q",function(req,res){
		var order_id=req.query.order_id;
	     var sql="select * from order_details WHERE order_id='" +order_id + "'";
		 con.query(sql,function(error,result){
			 //console.log(result)
			 res.send(result);
		 })
	});
	
	router.get("/already_outlet_ordered_combo_quantity",function(req,res){
		var order_id=req.query.order_id;
		var sql="select * from combo_order_details where order_id='" +order_id + "'";
		con.query(sql,function(error,result){
	
			res.send(result);
		})
	});
	
	router.get("/get_outlet_customer_details",function(req,res){
		var order_id = req.query.order_id;
		var sql= "select outlet_id from outlet_orders where order_id='" + order_id + "'";
		con.query(sql,function(error,result){
			if(error) throw error;
			 var outlet_id = result[0].outlet_id;
			 
			 var sql="select * from outlets where outlet_id='" + outlet_id + "'";
			 con.query(sql,function(error,outlet_details){
				 if(error) throw error;
				 res.send(outlet_details);
			 })
			
		})
	})
	
	
	router.post("/edit_outlet_order",function(req,res){
		var {order_id='',outlet_name='',billing_address='',pincode='',state='',city='',phone='',order_source='',outlet_note='',email='',commision='',shipping_cost='',gst_no='',outlet_id='',modified_quantity='',modified_combo_quantity=''}  = req.body;
		
		// get outlet id from order id sp that we can edit outlet details
		var sql="select outlet_id from outlet_orders where order_id='" + order_id + "'";
		con.query(sql,function(error,result){
			if(error) throw error;
			var outlet_id = result[0].outlet_id;
			// update outlet details 
			var sql="update outlets set outlet_name='" + outlet_name + "', commision=" + commision + ", billing_address='" + billing_address + "', pincode=" + pincode + ", gst_no='" + gst_no + "', state='" + state + "', city='" + city + "',email='" + email + "' where outlet_id=" + outlet_id;
     
            con.query(sql,function(error,result){
				if(error) throw error;
				
				// edit order
				edit_order(res,con,modified_quantity,modified_combo_quantity,order_source,outlet_note,commision,shipping_cost,outlet_id,order_id);
				
			})	 
			
		})
		
	});
	
function edit_order(res,con,modified_quantity,modified_combo_quantity,order_source,outlet_note,commision,shipping_cost,outlet_id,order_id)
{
		 // calculation of deduction of commision Here discount is treated as comminsion
	              var total_discount_in_rs=0
	              for(var i=0;i<modified_quantity.length;i++)
				  {
					  var amount=modified_quantity[i].amount;
					  commision_deduct=cal_commision_deduct(amount,commision);
					  total_discount_in_rs = Number(total_discount_in_rs) + Number(commision_deduct);
					  // set amount after deducting commision
					  modified_quantity[i].change_amount = Number(amount) - Number(commision_deduct);
				  }
				  
				  for(var i=0;i<modified_combo_quantity.length;i++)
				  {
					 var amount     = modified_combo_quantity[i].amount;
					 commision_deduct=cal_commision_deduct(amount,commision);
					 total_discount_in_rs = Number(total_discount_in_rs) + Number(commision_deduct);
					  // set amount after deducting commision
					  modified_combo_quantity[i].change_amount = Number(amount) - Number(commision_deduct);
				  }
				  
				  
				  // calculation of tax deduction
				  var total_amount_without_tax = 0;
				  var total_payable = 0;
				  var tax_amount = 0;
				  for(var i=0;i<modified_quantity.length;i++)
				  {
					  var amount=modified_quantity[i].change_amount;
					  total_payable = Number(total_payable) + Number(amount);
					  var net_amount = cal_net_amount(amount);
					  total_amount_without_tax = Number(total_amount_without_tax) + Number(net_amount);
					  tax_amount = Number(tax_amount) + (Number(amount) - Number(net_amount));
				  }
				  
				  for(var i=0;i<modified_combo_quantity.length;i++)
				  {
					 var amount = modified_combo_quantity[i].change_amount;
					 total_payable = Number(total_payable) + Number(amount);
					  var net_amount = cal_net_amount(amount);
					  total_amount_without_tax = Number(total_amount_without_tax) + Number(net_amount);
					  tax_amount = Number(tax_amount) + (Number(amount) - Number(net_amount));
				  }

				  
   // update outlet order details table
   var sql="update outlet_orders set order_source='" + order_source + "', note='" + outlet_note + "',shipping_cost=" + shipping_cost + ", amount_without_tax=" + total_amount_without_tax +", tax_amount=" + tax_amount + ", total_payable=" + total_payable + " where order_id='" + order_id + "'";
   
   con.query(sql,function(error,result){
	   if(error) throw error;
	  
	  
	  
	     // update order details table
			if(modified_quantity)
			{
			var sql="delete from order_details WHERE order_id='" +order_id + "'";
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
			
		} // modified_quantity ends
		
		
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
		  } // modified_combo_quantity ends
	  
	  update_balance(outlet_id);
	  
	  res.send("1");
   })   

}

function update_balance(outlet_id)
{
	// total_payable - total_payments
	
	var sql="select sum(total_payable) as total_payable from outlet_orders where outlet_id=" + outlet_id;
	con.query(sql,function(error,result){
		if(error) throw error;
		var total_payable= result[0].total_payable;

		var total_payment=0
		var sql="select SUM(payment_amount) as total_payment from outlet_payments where outlet_id=" + outlet_id;
        con.query(sql,function(error,result){
			if(result.length!=0)
			{total_payment = result[0].total_payment}
            else		
			{ total_payment = 0;}
		
		   // obtain balance
		   var balance = Number(total_payable) - Number(total_payment);
		   var sql = "update outlets set balance=" + balance + " where outlet_id=" + outlet_id;
		   con.query(sql,function(error,result){
			   if(error) throw error;
			   //console.log(result);
		   })
		})		
	})
}

function cal_net_amount(amount)
{
	var temp=Number(amount)/1.12;
	//var net_amount=Number(amount) - Number(temp);
	return temp;
}

function cal_commision_deduct(amount,discount_percentage)
{
	var discount_deduct_amount=(Number(amount)*Number(discount_percentage))/100;
	return discount_deduct_amount;
}
	
	 
  return router;
})();