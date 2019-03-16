module.exports = (function () {

	var router = require('express').Router();
	var ejs = require("ejs");
	var mysql = require('mysql');
	var moment = require('moment');
	var con = require("./config.js");
	var cron = require('node-cron');
	var nodemailer = require('nodemailer');
	var transporter = nodemailer.createTransport({
		host: 'smtp-mail.outlook.com',
		port: '587',
		auth: { user: 'hungryjars@outlook.com', pass: '123456789hii' },
		secureConnection: false,
		tls: { ciphers: 'SSLv3' }
	});



	cron.schedule('0 0 21 * * *', () => {

		// all not 'on order' products
		var sql = "SELECT category.category_name,  product.product_id, product.name,product.on_order, product.shown_on_website, product.selling_quantity_gms, product.price, product.sku_id,product.jars,product.unit_price,product.tax,product.status FROM product JOIN category WHERE product.category_id=category.id ORDER BY product.category_id,product.product_id ASC";
		con.query(sql, function (error, result) {
			if (error) throw error;

			var sql = "select * from category";
			con.query(sql, function (error, category_result) {

				// get all soled jars which have on order 0 from order details

				var sql = "select product.product_id, product.on_order, SUM(order_details.jars) AS sold from product left join order_details on product.product_id=order_details.product_id and order_details.sold!=0 group by product.product_id order by  product.category_id,product.product_id"

				con.query(sql, function (error, sum_of_order_details) {
					if (error) throw error;
					//console.log(sum_of_order_details);

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



						// get stock of jars 

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

								// get today's sold jars

								var sql = "SELECT product.product_id, product.name, order_details.jars, (select group_concat(order_details.order_id separator ',')) as order_ids from product join order_details where order_details.product_id=product.product_id and DATE(Now()) = DATE(order_details.created_date)group by product.product_id order by product.category_id, product.product_id ASC";

								con.query(sql, function (error, todays_order) {
									if (error) throw error;


									var tr = "";

									for (var i = 0; i < result.length; i++) {


										var balance = Number(all_stock[i].jars) - Number(sum_of_order_details[i].sold);

										var product_name = result[i].name;
										var sold_jars = "";
										var order_ids = "";
										if (result[i].on_order == 0) {
											var stock = balance;
										}
										else {
											var stock = "On Order";
										}

										for (j = 0; j < todays_order.length; j++) {
											if (result[i].product_id == todays_order[j].product_id) {
												sold_jars = todays_order[j].jars;
												order_ids = todays_order[j].order_ids;
											}
										}
										var td = "<td style='border:1px solid gray;'>" + product_name + " </td><td style='border:1px solid gray;'>" + stock + " </td><td style='border:1px solid gray;'>" + sold_jars + "</td><td style='border:1px solid gray;'>" + order_ids + "</td>";
										tr = tr + "<tr style='border:1px solid gray;'>" + td + "</tr>";
									}

									console.log("Cron fired");



									var email_text = "<html><body><center><h1>Inventory</h1></center></h1><table style='border:1px solid gray;border-collapse: collapse;'><thead><th style='border:1px solid gray;'>Product Name</th><th style='border:1px solid gray;'>Stock</th><th style='border:1px solid gray;'>Sold Today</th><th style='border:1px solid gray;'>Order Ids</th></thead><tbody>" + tr + "</tbody></table></body></html>"




									var mailOptions = {
										from: '"Hungry Jars" <hungryjars@outlook.com>',
										to: "hello@hungryjars.com",         //to:customer_email,
										subject: "Daily HJ Stock Info",
										html: email_text,

									};

									transporter.sendMail(mailOptions, function (error, info) {
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


				})


			});
		});


	});






	router.get('/send_stock_email', (req, res) => {

		// all not 'on order' products
		var sql = "SELECT category.category_name,  product.product_id, product.name,product.on_order, product.shown_on_website, product.selling_quantity_gms, product.price, product.sku_id,product.jars,product.unit_price,product.tax,product.status FROM product JOIN category WHERE product.category_id=category.id ORDER BY product.category_id,product.product_id ASC";
		con.query(sql, function (error, result) {
			if (error) throw error;

			var sql = "select * from category";
			con.query(sql, function (error, category_result) {

				// get all soled jars which have on order 0 from order details

				var sql = "select product.product_id, product.on_order, SUM(order_details.jars) AS sold from product left join order_details on product.product_id=order_details.product_id and order_details.sold!=0 group by product.product_id order by  product.category_id,product.product_id"

				con.query(sql, function (error, sum_of_order_details) {
					if (error) throw error;
					//console.log(sum_of_order_details);

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



						// get stock of jars 

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

								// get today's sold jars

								var sql = "SELECT product.product_id, product.name, order_details.jars, (select group_concat(order_details.order_id separator ',')) as order_ids from product join order_details where order_details.product_id=product.product_id and DATE(Now()) = DATE(order_details.created_date)group by product.product_id order by product.category_id, product.product_id ASC";

								con.query(sql, function (error, todays_order) {
									if (error) throw error;


									var tr = "";

									for (var i = 0; i < result.length; i++) {


										var balance = Number(all_stock[i].jars) - Number(sum_of_order_details[i].sold);

										var product_name = result[i].name;
										var sold_jars = "";
										var order_ids = "";
										if (result[i].on_order == 0) {
											var stock = balance;
										}
										else {
											var stock = "On Order";
										}

										for (j = 0; j < todays_order.length; j++) {
											if (result[i].product_id == todays_order[j].product_id) {
												sold_jars = todays_order[j].jars;
												order_ids = todays_order[j].order_ids;
											}
										}
										var td = "<td style='border:1px solid gray;'>" + product_name + " </td><td style='border:1px solid gray;'>" + stock + " </td><td style='border:1px solid gray;'>" + sold_jars + "</td><td style='border:1px solid gray;'>" + order_ids + "</td>";
										tr = tr + "<tr style='border:1px solid gray;'>" + td + "</tr>";
									}

									console.log("Cron fired");



									var email_text = "<html><body><center><h1>Inventory</h1></center></h1><table style='border:1px solid gray;border-collapse: collapse;'><thead><th style='border:1px solid gray;'>Product Name</th><th style='border:1px solid gray;'>Stock</th><th style='border:1px solid gray;'>Sold Today</th><th style='border:1px solid gray;'>Order Ids</th></thead><tbody>" + tr + "</tbody></table></body></html>"




									var mailOptions = {
										from: '"Hungry Jars" <hungryjars@outlook.com>',
										to: "rohit@bowstringstudio.in",         //to:customer_email,
										subject: "Daily HJ Stock Info",
										html: email_text,

									};

									transporter.sendMail(mailOptions, function (error, info) {
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


				})


			});
		});

	});





	return router;
})();