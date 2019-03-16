module.exports = (function () {

	var router = require('express').Router();
	var ejs = require("ejs");
	var mysql = require('mysql');
	var moment = require('moment');
	var con = require("./config.js");


	router.get("/create_outlet_order", function (req, res) {
		var outlet_id = req.query.outlet_id;
		var sql = "select * from product  order by product.category_id ASC";

		con.query(sql, function (error, result) {
			if (error) throw error;
			var sql = "SELECT * FROM outlet_orders ORDER BY order_id DESC LIMIT 1";
			con.query(sql, function (error, last_order_id) {
				if (last_order_id.length != 0) {
					var last_order_id = last_order_id[0].order_id;
					last_outlet_order_id = last_order_id.substring(3, last_order_id.length);
					// order_no = Number(last_order_id) + 1;
					//console.log(order_no);
					last_outlet_order_id = Number(last_outlet_order_id);
					order_no = Number(last_outlet_order_id) + 1;
					order_no = "OUT" + order_no;

				}
				else { var order_no = "OUT" + 1; }
				var sql = "select * from promo_code where start_date < end_date";
				con.query(sql, function (error, promo_code) {

					// select combo products

					var sql = "select * from combos WHERE status!=0";
					con.query(sql, function (error, combo_product) {

						// get all soled jars  from order details

						var sql = "select product.product_id, product.on_order, SUM(order_details.jars) AS sold from product left join order_details on product.product_id=order_details.product_id group by product.product_id order by product.category_id,product.product_id";
						con.query(sql, function (error, sum_of_order_details) {
		
							if(error) throw error;
               // get all sold jars from combo order details
							var sql = "SELECT combo_products.combo_id, combo_products.product_id, combo_order_details.quantity_ordered from combo_products join combo_order_details where combo_products.combo_id = combo_order_details.combo_id";

							con.query(sql, function (error, combo_products_order_detail) {
								if (error) throw error;


								// change all null sold values to 0
								for (var i = 0; i < sum_of_order_details.length; i++) {
									if (sum_of_order_details[i].sold === null) {
										sum_of_order_details[i].sold = 0;
									}
								}


								// add order details + combo order details = sold 
								for (var i = 0; i < sum_of_order_details.length; i++) {
									for (j = 0; j < combo_products_order_detail.length; j++) {
										if (sum_of_order_details[i].product_id == combo_products_order_detail[j].product_id) {
											sum_of_order_details[i].sold = Number(sum_of_order_details[i].sold) + Number(combo_products_order_detail[j].quantity_ordered);
										}
									}
								}

								// get stock of all jars
								var sql = "SELECT  product.product_id, SUM(stock.jars) AS jars FROM product LEFT JOIN stock on product.product_id=stock.product_id group by product.product_id order by product.category_id, product.product_id ASC";

								con.query(sql, function (error, all_stock) {
									if (error) throw error;


									// get all rejected products
									var sql = "select product_id, SUM(rejected) as rejected from product_return where rejected!=0 group by product_id order by product_id";
									con.query(sql, function (error, product_return) {
										if (error) throw error;

										// deduct rejected jars from sold jars
										for (var i = 0; i < sum_of_order_details.length; i++) {
											for (j = 0; j < product_return.length; j++) {
												if (sum_of_order_details[i].product_id == product_return[j].product_id) {
													sum_of_order_details[i].sold = Number(sum_of_order_details[i].sold) - Number(product_return[j].rejected);
												}
											}
										}


										for (var i = 0; i < result.length; i++) {
											var balance = Number(all_stock[i].jars) - Number(sum_of_order_details[i].sold);

											var product_name = result[i].name;
											var stock = balance;

										}

										var sql = "select * from outlets where outlet_id=" + outlet_id;
										con.query(sql, function (error, outlet_details) {
											if (error) throw error;





											res.render("outlet_order.ejs", { result: result, order_no: order_no, promo_code: promo_code, combo_product: combo_product, outlet_details: outlet_details, all_stock: all_stock ,sum_of_order_details:sum_of_order_details});
										})
									})
								})
							})
						})
					})

				})
			})
		});
	});

	router.get("/print_retail_bill_customer",function(req,res){
		var order_id=req.query.order_id;
		var invoice_url="http://localhost:3000/" + "generate_outlet_bill_customer?order_id=" +order_id;

	  
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

  router.get("/print_retail_bill_merchant",function(req,res){
	var order_id=req.query.order_id;
	var invoice_url="http://localhost:3000/" + "generate_outlet_bill_merchant?order_id=" +order_id;

  
   var phantom = require('phantom');   
   phantom.create().then(function(ph) {
	ph.createPage().then(function(page) {
	 page.open(invoice_url).then(function(status) {
	   page.render('./views/invoice_pdf/invoice' +order_id + '- merchant' + '.pdf').then(function() {
		   console.log('Page Rendered');
		   ph.exit();
		   res.download('./views/invoice_pdf/invoice' +order_id + '- merchant' + '.pdf');
	   });
	});
 });
}); 
  
	
})


	router.get("/show_outlet_order", function (req, res) {

		var outlet_id = req.query.outlet_id;

		var sql = "select * from outlet_orders where outlet_id=" + outlet_id + " order by order_date desc";
		con.query(sql, function (error, all_orders) {
			if (error) throw error;

			for (var i = 0; i < all_orders.length; i++) {
				all_orders[i].order_date = moment(all_orders[i].order_date).format('MMMM Do YYYY')

			}

			var sql = "select * from outlets where outlet_id=" + outlet_id;
			con.query(sql, function (error, outlet_details) {
				if (error) throw error;

				// select all outlet payments
				var sql = "select * from outlet_payments where outlet_id=" + outlet_id + " order by payment_id desc";
				con.query(sql, function (error, outlet_payments) {
					if (error) throw error;

					for (var i = 0; i < outlet_payments.length; i++) {
						outlet_payments[i].created_date = moment(outlet_payments[i].created_date).format('MMMM Do YYYY');
					}

					var sql = "select count(order_id) as total_orders, SUM(total_payable) as total_payable from outlet_orders where outlet_id=" + outlet_id;

					con.query(sql, function (error, outlet_label_details) {
						if (error) throw error;

						var sql = "select order_id, SUM(broken) as broken, SUM(expired) as expired, SUM(defected) as defected, SUM(rejected) as rejected from product_return group by order_id order by created_date desc";

						con.query(sql, function (error, product_return) {


							for (var i = 0; i < product_return.length; i++) {
								product_return[i].created_date = moment(product_return[i].created_date).format('MMMM Do YYYY')
							}



							res.render("show_outlet_order.ejs", { all_orders: all_orders, outlet_details: outlet_details, outlet_payments: outlet_payments, outlet_label_details: outlet_label_details, product_return: product_return });
						});
					});
				});
			});
		});
	});

	router.get("/generate_outlet_bill_customer", function (req, res) {
		res.sendFile("./views/invoice_outlet.html", { root: './' });
		var url = req.url;
	});

	router.get("/generate_outlet_bill_merchant", function (req, res) {
		res.sendFile("./views/invoice_outlet.html", { root: './' });
		var url = req.url;
	});

	router.get("/get_outlet_info_for_invoice", function (req, res) {
		var order_id = req.query.order_id;
		var sql = "select * from outlet_orders where order_id='" + order_id + "'";
		con.query(sql, function (error, orders) {
			if (error) throw error;
			var outlet_id = orders[0].outlet_id

			// select details of outlet 
			var sql = "select * from outlets where outlet_id=" + outlet_id;
			con.query(sql, function (error, result) {
				if (error) throw error;
				res.json({ order_details: orders, outlet_details: result });
			})
		})
	});


	router.get("/get_order_detail_for_invoice", function (req, res) {
		var order_id = req.query.order_id;
		// select from orders table 
		var sql = "select * from outlet_orders where order_id='" + order_id + "'";
		con.query(sql, function (error, order) {
			if (error) throw error;

			var sql = "select order_details.product_id,order_details.jars,order_details.amount,product.name,product.selling_quantity_gms, product.sku_id,product.hsn,product.unit_price from order_details join product where order_details.product_id=product.product_id and order_details.order_id='" + order_id + "'";
			con.query(sql, function (error, order_details) {
				if (error) throw error;

				var sql = "select combo_order_details.combo_id, combo_order_details.quantity_ordered,combo_order_details.amount,combos.combo_name,combos.unit_price,combos.sku_id from combo_order_details join combos where combo_order_details.combo_id=combos.combo_id and combo_order_details.order_id='" + order_id + "'";
				con.query(sql, function (error, combo_order_details) {
					if (error) throw error;

					// get outlet commision
					var outlet_id = order[0].outlet_id;

					var sql = "select commision,state from outlets where outlet_id=" + outlet_id;
					con.query(sql, function (error, outlet_details) {
						if (error) throw error;
						res.json({ order: order, order_details: order_details, combo_order_details: combo_order_details, commision: outlet_details[0].commision, state: outlet_details[0].state });
					})


				})

			})

		})
	})

	router.get("/get_return_data", function (req, res) {
		var order_id = req.query.order_id;
		var sql = "select product.name, product_return.broken,product_return.expired,product_return.defected,product_return.rejected from product_return JOIN product WHERE product_return.product_id=product.product_id AND product_return.order_id='" + order_id + "'";

		con.query(sql, function (error, result) {
			if (error) throw error;
			res.send(result);
		})

	});


	router.post("/add_outlet_payment", function (req, res) {
		var outlet_id = req.body.outlet_id;
		var payment_amount = req.body.payment_amount;

		var sql = "select balance from outlets where outlet_id=" + outlet_id;
		con.query(sql, function (error, result) {
			if (error) throw error;
			var updated_balance = Number(result[0].balance) - Number(payment_amount);
			if (updated_balance < 0) {
				// balance cannot be negative;
				res.send("0");
			}
			else {
				// insert in outlet payments table
				var sql = "insert into outlet_payments set ?";
				var values = {
					"outlet_id": outlet_id,
					"payment_amount": payment_amount,
				}
				con.query(sql, values, function (error, result) {
					if (error) throw error;

					// update balance
					var sql = "update outlets set balance=" + updated_balance + " where outlet_id=" + outlet_id;
					con.query(sql, function (error, result) {
						if (error) throw error;
						console.log(result);
						res.send("1");
					})
				})
			}
		})
	})


	router.get("/get_outlet_payment_details", function (req, res) {
		var payment_id = req.query.payment_id;

		var sql = "select * from outlet_payments where payment_id=" + payment_id;
		con.query(sql, function (error, result) {
			if (error) throw error;
			res.send(result);
		})

	})

	router.post("/edit_outlet_payment", function (req, res) {
		var outlet_id = req.body.outlet_id;
		var payment_amount = req.body.payment_amount;
		var payment_id = req.body.payment_id;
		console.log(req.body);
		var sql = "update outlet_payments set payment_amount=" + payment_amount + " where payment_id=" + payment_id;
		con.query(sql, function (error, result) {
			if (error) throw error;
			update_balance(outlet_id);
			res.send("1");
		})

	});

	router.get("/outlet_excel_export", function (req, res) {
		var month = req.query.month;
		var year = req.query.year;
		if (month != "" && year == "") {
			var time1 = "2018-" + month + "-1 00:00:00";
			var time2 = "2018-" + month + "-31 23:59:59";
			create_excel_accoring_to_time(time1, time2, con, req, res);
		}
		else if (month == "" && year != "")        // 
		{
			var time1 = year + "-1-1 00:00:00";
			var time2 = year + "-12-31 23:59:59";
			create_excel_accoring_to_time(time1, time2, con, req, res);
		}
		else if (month != "" && year != "") {
			var time1 = year + "-" + month + "-1 00:00:00";
			var time2 = year + "-" + month + "-31 23:59:59";
			create_excel_accoring_to_time(time1, time2, con, req, res);
		}
		else if (month == "" && year == "") {
			var time1 = "2017-1-1 00:00:00";
			var time2 = "2080-12-31 23:59:59";
			create_excel_accoring_to_time(time1, time2, con, req, res);
		}
	})



	router.post("/post_outlet_order", function (req, res) {
		var { outlet_name = '', billing_address = '', pincode = '', state = '', city = '', phone = '', order_source = '', outlet_note = '', email = '', commision = '', shipping_cost = '', gst_no = '', outlet_id = '', modified_quantity = '', modified_combo_quantity = '', new_outlet_order_id = '' } = req.body;


		// update outlet details in outlets table
		var sql = "update outlets set outlet_name='" + outlet_name + "',billing_address='" + billing_address + "', pincode=" + pincode + ",state='" + state + "',city='" + city + "', phone=" + phone + ", commision=" + commision + ",gst_no='" + gst_no + "' where outlet_id=" + outlet_id;

		con.query(sql, function (error, result) {
			if (error) throw error;
			// now create the order
			create_order(res, modified_quantity, modified_combo_quantity, order_source, outlet_note, commision, shipping_cost, outlet_id, new_outlet_order_id);
		})

	});

	function create_excel_accoring_to_time(time1, time2, con, req, res) {
		var t = new Date(time1);
		var t = moment(t).format("MMM Do YY");
		var filename = "./views/excel_sheets/Retail Sales - " + t + ".xlsx";
		//console.log(time1 + " " + time2 + " " + con + " " + req + " " + res);
		var sql = "select DISTINCT outlet_orders.order_id,outlet_orders.order_date,outlets.outlet_name,outlets.phone,outlets.shipping_address,outlets.billing_address,(SELECT GROUP_CONCAT(product.name SEPARATOR ',')  product) AS name,(SELECT GROUP_CONCAT(combos.combo_name SEPARATOR ',')  combos) AS combo_name,SUM(order_details.jars) total_quantity,outlet_orders.amount_without_tax,outlet_orders.shipping_cost,outlet_orders.tax_amount,outlet_orders.total_payable from outlet_orders LEFT JOIN outlets ON outlet_orders.outlet_id=outlets.outlet_id  LEFT JOIN combo_order_details ON outlet_orders.order_id=combo_order_details.order_id LEFT JOIN order_details ON outlet_orders.order_id=order_details.order_id LEFT join product ON product.product_id=order_details.product_id LEFT JOIN combos ON combos.combo_id=combo_order_details.combo_id  WHERE (outlet_orders.order_date>='" + time1 + "' AND outlet_orders.order_date<='" + time2 + "') GROUP BY outlet_orders.order_id,order_details.order_id ORDER BY outlet_orders.order_date ASC"

		con.query(sql, function (error, result) {
			if (error) throw error;

			var sql = "select order_id, SUM(broken) AS broken, SUM(expired) AS expired, SUM(defected) as defected, SUM(rejected) AS rejected, (SUM(broken) + SUM(defected) + SUM(rejected) + SUM(expired)) as return_jars from product_return group by order_id ";
			con.query(sql, function (error, product_return) {
				if (error) throw error;
				//console.log(product_return)

				for (var i = 0; i < result.length; i++) {
					for (var j = 0; j < product_return.length; j++) {
						var all_oid = result[i].order_id;
						var product_ret_oid = product_return[j].order_id;
						all_oid.trim();
						product_ret_oid.trim();
						if (all_oid.search(product_ret_oid) != -1) {
							result[i].product_return = product_return[j].return_jars
						}
						else {
							console.log("nahi");
							//result[i].product_return=0;
						}
						//console.log(all_oid + " " + product_ret_oid);


					}
				}


				var excel = require('excel4node');
				var workbook = new excel.Workbook();
				var worksheet = workbook.addWorksheet('Sheet 1');

				var style = workbook.createStyle({
					font: {
						color: 'black',
						size: 12,
						fontWeight: 'bold',
					},
				});
				worksheet.cell(1, 1).string('Order ID').style(style);
				worksheet.cell(1, 2).string('Order Date').style(style);
				worksheet.cell(1, 3).string('Outlet Name').style(style);
				worksheet.cell(1, 4).string('Phone').style(style);
				worksheet.cell(1, 5).string('Shipping Address').style(style);
				worksheet.cell(1, 6).string('Billing Address').style(style);
				worksheet.cell(1, 7).string('Items').style(style);
				worksheet.cell(1, 8).string('Total Quantity').style(style);
				worksheet.cell(1, 9).string('Net Amount').style(style);
				worksheet.cell(1, 10).string('Shipping Amount').style(style);
				worksheet.cell(1, 11).string('Tax Amount').style(style);
				worksheet.cell(1, 12).string('Total Cost').style(style);
				worksheet.cell(1, 13).string('Returned').style(style);

				var row = 2;
				var col = 1;

				for (var i = 0; i < result.length; i++) {
					if (result[i].product_return === undefined) { result[i].product_return = 0 }
					worksheet.cell(row, 1).string(result[i].order_id).style(style);
					worksheet.cell(row, 2).string(moment(result[i].order_date).format("DD MMM YYYY")).style(style);
					worksheet.cell(row, 3).string(result[i].outlet_name).style(style);
					worksheet.cell(row, 4).number(Number(result[i].phone)).style(style);
					worksheet.cell(row, 5).string(result[i].shipping_address).style(style);
					worksheet.cell(row, 6).string(result[i].billing_address).style(style);
					worksheet.cell(row, 7).string(result[i].name).style(style);
					worksheet.cell(row, 8).number(Number(result[i].total_quantity)).style(style);
					worksheet.cell(row, 9).number(Number(result[i].amount_without_tax)).style(style);
					worksheet.cell(row, 10).number(Number(result[i].shipping_cost)).style(style);
					worksheet.cell(row, 11).number(Number(result[i].tax_amount)).style(style);
					worksheet.cell(row, 12).number(Number(result[i].total_payable)).style(style);
					worksheet.cell(row, 13).number(Number(result[i].product_return)).style(style);
					row++;
				}

				workbook.write(filename, function () {
					res.download(filename);
				});

			})

		})

	}



	function create_order(res, modified_quantity, modified_combo_quantity, order_source, outlet_note, commision, shipping_cost, outlet_id, new_outlet_order_id) {

		var total_discount_in_rs = 0


		for (var i = 0; i < modified_quantity.length; i++) {
			var amount = modified_quantity[i].amount;
			amount = cal_net_amount(amount, 12);
			var disc = cal_discount_deduct(amount, commision);
			total_discount_in_rs = Number(total_discount_in_rs) + Number(disc);

		}

		for (var i = 0; i < modified_combo_quantity.length; i++) {
			var amount = modified_combo_quantity[i].amount;
			amount = cal_net_amount(amount, 12);
			var disc = cal_discount_deduct(amount, commision);
			total_discount_in_rs = Number(total_discount_in_rs) + Number(disc);

		}




		// calculation for payable amount and tax amount
		var total_amount_without_tax = 0;
		if (modified_quantity) {
			for (var i = 0; i < modified_quantity.length; i++) {
				var net_amount = cal_net_amount(modified_quantity[i].amount);
				var amount_after_discount = discount_deduction(net_amount, commision);
				total_amount_without_tax = Number(total_amount_without_tax) + Number(amount_after_discount);
			}
		}

		if (modified_combo_quantity) {
			for (var i = 0; i < modified_combo_quantity.length; i++) {
				var net_amount = cal_net_amount(modified_combo_quantity[i].amount);
				var amount_after_discount = discount_deduction(net_amount, commision);
				total_amount_without_tax = Number(total_amount_without_tax) + Number(amount_after_discount);
			}
		}

		var tax_amount = cal_tax_amount(total_amount_without_tax, 12);
		var total_payable = Number(total_amount_without_tax) + Number(tax_amount) + Number(shipping_cost);




		var sql = "insert into outlet_orders SET ?";
		var values = {

			"order_id": new_outlet_order_id,
			"order_source": order_source,
			"note": outlet_note,
			"status": 1,
			"payment_received": 0,
			"shipping_cost": shipping_cost,
			"amount_without_tax": total_amount_without_tax,
			"tax_amount": tax_amount,
			"total_payable": total_payable,
			"outlet_id": outlet_id,
		}
		con.query(sql, values, function (error, result) {
			if (error) throw error;

			var order_id = result.insertId;

			// insert into order details table
			for (var i = 0; i < modified_quantity.length; i++) {

				var sql = "Insert into order_details SET ?";
				var product_id = modified_quantity[i].product_id;
				var jars = modified_quantity[i].quantity_ordered;
				var amount = modified_quantity[i].amount;
				var values = {
					"order_id": new_outlet_order_id,
					"product_id": product_id,
					"jars": jars,
					"amount": amount,
				}
				con.query(sql, values, function (error, result) { });
			}

			// deduct number of jars from the product table

			for (var i = 0; i < modified_quantity.length; i++) {

				var product_id = modified_quantity[i].product_id;
				var jars = modified_quantity[i].jars;
				var quantity_ordered = modified_quantity[i].quantity_ordered;

				var sql = "update product set jars=jars-" + quantity_ordered + " WHERE product_id=" + product_id;
				con.query(sql, function (error, result) {

				});
			}

			// insert into combo order details table
			for (var i = 0; i < modified_combo_quantity.length; i++) {
				var sql = "Insert into combo_order_details SET ?";
				var combo_id = modified_combo_quantity[i].combo_id;
				var quantity_ordered = modified_combo_quantity[i].quantity_ordered;
				var amount = modified_combo_quantity[i].amount;
				var values = {
					"order_id": new_outlet_order_id,
					"combo_id": combo_id,
					"quantity_ordered": quantity_ordered,
					"amount": amount,
				}
				con.query(sql, values, function (error, result) { });
			}

			// deduct number of jars from the product table

			for (var i = 0; i < modified_combo_quantity.length; i++) {
				var combo_id = modified_combo_quantity[i].combo_id;
				var quantity_ordered = modified_combo_quantity[i].quantity_ordered;

				var sql = "update product set jars=jars-1 WHERE product_id IN (SELECT product_id from combo_products WHERE combo_id=" + combo_id + ")";
				con.query(sql, function (error, result) { })
			}

			update_balance(outlet_id);


			res.send("1");

		});

	}



	function update_balance(outlet_id) {
		// total_payable - total_payments

		var sql = "select sum(total_payable) as total_payable from outlet_orders where outlet_id=" + outlet_id;
		con.query(sql, function (error, result) {
			if (error) throw error;
			var total_payable = result[0].total_payable;

			var total_payment = 0
			var sql = "select SUM(payment_amount) as total_payment from outlet_payments where outlet_id=" + outlet_id;
			con.query(sql, function (error, result) {
				if (result.length != 0) { total_payment = result[0].total_payment }
				else { total_payment = 0; }

				// obtain balance
				var balance = Number(total_payable) - Number(total_payment);
				var sql = "update outlets set balance=" + balance + " where outlet_id=" + outlet_id;
				con.query(sql, function (error, result) {
					if (error) throw error;
					console.log(result);
				})
			})
		})
	}




	function cal_net_amount(amount) {
		var temp = Number(amount) / 1.12;
		//var net_amount=Number(amount) - Number(temp);
		return temp;
	}

	function add_tax(amount) {
		var temp = Number(amount) / 1.12;
		//var net_amount=Number(amount) - Number(temp);
		return temp;
	}

	function remove_commision(amount, commision) {
		var temp = (Number(amount) * Number(commision)) / 100;
		var new_amount = Number(amount) - Number(temp);

		return new_amount;
	}

	function cal_commision_deduct(amount, discount_percentage) {
		var discount_deduct_amount = (Number(amount) * Number(discount_percentage)) / 100;
		return discount_deduct_amount;
	}

	function cal_discount_deduct(amount, discount_percentage) {
		var discount_deduct_amount = (Number(amount) * Number(discount_percentage)) / 100;
		return discount_deduct_amount;
	}

	function discount_deduction(amount, discount_percentage) {
		var discount_amount = (Number(amount) * Number(discount_percentage)) / 100;
		amount = Number(amount) - Number(discount_amount);
		return amount;
	}

	function cal_tax_amount(amount, tax_percentage) {
		amount = (Number(amount) * Number(tax_percentage)) / 100;
		return amount;
	}

	return router;
})();