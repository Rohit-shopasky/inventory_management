module.exports=(function(){
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql  = require('mysql');
    var moment = require('moment');
       var con = require('./config.js');

	  
router.get("/home",function(req,res){
	
// all not 'on order' products
var sql="SELECT category.category_name,product.category_id,  product.product_id, product.name,product.on_order, product.shown_on_website, product.selling_quantity_gms, product.price, product.sku_id,product.jars,product.unit_price,product.tax,product.status FROM product JOIN category WHERE product.category_id=category.id ORDER BY product.category_id,product.product_id ASC";
		con.query(sql,function(error,result){
			if(error) throw error;
			console.log(result);
			var sql="select * from category";
			con.query(sql,function(error,category_result){

			    // get all soled jars which have on order 0 from order details
				
				var sql="select product.product_id, product.category_id, product.on_order, IFNULL(SUM(order_details.jars),0) AS sold from product left join order_details on product.product_id=order_details.product_id and order_details.sold!=0 group by product.product_id order by product.category_id,product.product_id"
				
				con.query(sql,function(error,sum_of_order_details){
					if(error) throw error;
					//console.log(sum_of_order_details);
					
					// get all sold jars from combo order details
					var sql="SELECT combo_products.combo_id, combo_products.product_id, combo_order_details.quantity_ordered from combo_products join combo_order_details where combo_products.combo_id = combo_order_details.combo_id ";
					
					con.query(sql,function(error,combo_products_order_detail){
						if(error) throw error;
						
                        
						
						
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
						
						
						
						// get stock of jars 
						
						     var sql="SELECT product.product_id, product.category_id, IFNULL(SUM(stock.jars),0) AS jars FROM product LEFT JOIN stock on product.product_id=stock.product_id group by product.product_id order by product.category_id, product.product_id ASC";
							 
							 con.query(sql,function(error,all_stock){
								 if(error) throw error;
								 console.log("------All STOCK --------");
								 console.log(all_stock);
								 console.log("-----All STOCK ENDS --------");
								 
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
									
		 
								    res.render("home.ejs",{result:result,category_result:category_result,sum_of_order_details:sum_of_order_details,all_stock:all_stock});
 
						       });
	
						  });   
					});
					
					
				})
				
				
			});
	});
});



router.post("/add_product",function(req,res){
	var product_name          = req.body.product_name;
	var selling_quantity_gms  = req.body.selling_quantity_gms;
	var price                 = req.body.price;
	var ingredients           = req.body.ingredients;
	var instructions          = req.body.instructions;
	var category              = req.body.category;
	var unit_price            = req.body.unit_price;
	var tax                   = req.body.tax;
	
	
	var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	
	
	category=category.toLowerCase();
	
   // for auto update sku_id
   
   var sql="select sku_id from product order by product_id DESC LIMIT 1";
   con.query(sql,function(error,product){
	   if(error) throw error;
	   
	   var sku_id = product[0].sku_id;
	   var sku_id = sku_id.replace("HJ","");
	   var new_sku_id = Number(sku_id);
	   new_sku_id ++;
	   console.log(new_sku_id);
	   new_sku_id = "HJ00" + new_sku_id; 
	   
	   var sql="SELECT * FROM category WHERE id='" +category + "'";
	   con.query(sql,function(error,result){
		
		if(result.length!=0)  // if category is found
		{
			var values={                                                  // set default value...Server mysql will throw err otherwise
		                   "name"         : product_name,
		                   "created_date" : time,
		                   "price"        : price,
		                   "ingredients"  : ingredients,
		                   "instructions" : instructions,
		                   "selling_quantity_gms" :selling_quantity_gms,
		                   "status"       :1,
		                   "jars"         :0,
		                   "sku_id"       :new_sku_id,
		                   "unit_price"   :unit_price,
		                   "tax"          :tax,
		                   "shown_on_website" : 0,
		                   "order_url"    :"",
		                   "on_order"     :0,        
                           "hsn"          :"",		
	                   }
			// insert product with already category
			var category_id=result[0].id;
			values.category_id=category_id;
			console.log(values);
			var sql="INSERT INTO product SET ?";
			con.query(sql,values,function(error,result){
				if(error) throw error;
				//console.log(result);
				res.send("1");
			});
		}
		else  // if category not found
		{
		}
		
	  }); 
	   
   })	
});

router.post("/save_product_edits",function(req,res){
	
	var product_id            = req.body.product_id;
	var product_name          = req.body.product_name;
	var selling_quantity_gms  = req.body.selling_quantity_gms;
	var price                 = req.body.price;
	var ingredients           = req.body.ingredients;
	var instructions          = req.body.instructions;	
	var unit_price            = req.body.unit_price;
	var tax                   = req.body.tax;
	var fpath                 = req.body.fpath;
	var order_url             = req.body.order_url;
	var on_order              = req.body.on_order;
	var hsn                   = req.body.hsn;

	//console.log("fpath-> " + fpath);
	
	var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	
	var sql="UPDATE product SET name= '" +product_name + "', created_date= '" +time + "', ingredients= '" +ingredients+ "', instructions= '" +instructions + "'  , selling_quantity_gms= " +selling_quantity_gms + ",price=" + price + ", unit_price = " + unit_price + ", tax=" + tax +", icon_url='" + fpath + "', order_url='" + order_url +"', on_order=" + on_order + ", hsn='" + hsn + "' 	WHERE product_id=" +product_id;
	
	con.query(sql,function(error,result){
		if(error) throw error;
			res.send("1");
	
	})
});


router.get("/get_row_data_for_edit",function(req,res){
	var product_id=req.query.product_id;
	var sql="SELECT * from product WHERE product.product_id=" +product_id;
	con.query(sql,function(error,result){
		
		res.send(result);
		
	});
});

router.post("/delete_product",function(req,res){
	var product_id=req.body.product_id;
	var sql="UPDATE product SET status=0 WHERE product_id=" +product_id;
	con.query(sql,function(error,result){
		if(error) throw error;
		
		var sql="UPDATE stock SET status=0 WHERE product_id=" +product_id;
		con.query(sql,function(error,result){
			res.send("1");
		});
		
	});
});

var fileUpload = require('express-fileupload');
var path=require('path');
// default options
router.use(fileUpload({
    limits: { fileSize: 1024*1024*5},
}));
router.post("/upload_product_pic",function(req,res){
	
	var sampleFile = req.files.sampleFile;
	//console.log(req.files.sampleFile);
	  var extname=path.extname(sampleFile.name);
	
	if(sampleFile.name=="")
	{
	  res.send("Empty");
	}
	
	else if(extname!==".jpg" && extname!==".JPG" && extname!==".PNG" && extname!==".png" && extname!==".GIF" && extname!==".gif")
	{
	   res.send("-1");
	}
	else
	{
	  var fs=require("fs");
	   var num=Math.random();
	   num=num*10000000000000000000;
	   var fpath="./product_images/"  + num + ".jpg";
	   sampleFile.mv(fpath, function(err) {
        if (err) {
            res.status(500).send(err);
			console.log(err);
			console.log("nahi hui upload");
        }
        else {
		      
		var	send_fpath="http://localhost:3000/product_images/" + num + ".jpg";
			 console.log("upload ho gai");
			 
            res.send(send_fpath);
        }
	  });
	}
	
});






  return router;
})();