module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	  
router.get("/combo_products",function(req,res){
	
	var sql="select * from combos ORDER BY combo_id ASC";
	con.query(sql,function(error,result){
		  for(var i=0;i<result.length;i++)
		  {
			var date_string=result[i].created_date;
		    date_string=date_string.toString();
		    date_string=date_string.split(' ').slice(0, 5).join(' ');
		    result[i].time=date_string;
		 }
		    var sql="select * from product";
	        con.query(sql,function(error,products){
		    res.render("combo.ejs",{result:result,products:products});
	        })
		
	});
})

	
router.post("/add_combo_product",function(req,res){

	var combo_name = req.body.combo_name;
	var sku_id     = req.body.sku_id;
	var price      = req.body.price;
	var product_ids= req.body.product_ids;
	var unit_price = req.body.unit_price;
	var tax        = req.body.tax;
	//console.log(combo_name + " " +sku_id + " " + price + " " +product_ids);

	 var sql="select sku_id from combos order by combo_id DESC LIMIT 1";
	 con.query(sql,(error,result)=>{

		var sku_id = result[0].sku_id;
		var sku_id = sku_id.replace("HJCOMBO","");
		var new_sku_id = Number(sku_id);
		new_sku_id ++;
		console.log(new_sku_id);
		new_sku_id = "HJCOMBO00" + new_sku_id; 

	var sql="INSERT INTO combos SET ?";
	var values={
		combo_name  :combo_name,
		sku_id      :new_sku_id,
		price       :price,
		unit_price  :unit_price,
		tax         :tax,
	}
	con.query(sql,values,function(error,result){
		if(error) throw error;
		// insert into combo_products
	    var combo_id=result.insertId;
		
		for(var i=0;i<product_ids.length;i++)
		{   var product_id=product_ids[i];
	         console.log(product_id);
			var sql="insert into combo_products SET ?";
			var values = {
				combo_id   : combo_id,
				product_id : product_id,
			}
			con.query(sql,values,function(error,result){})
		}
		
		res.send("1");
	})	
})
})


router.get("/get_combo",function(req,res){
	var combo_id = req.query.combo_id;
	var sql="select * from combos where combo_id=" +combo_id;
	con.query(sql,function(error,result){
		if(error) throw error;
		res.send(result);
	})
});


router.post("/edit_combo",function(req,res){
	var combo_name = req.body.combo_name;
	var sku_id     = req.body.sku_id;
	var unit_price = req.body.unit_price;
	var tax        = req.body.tax;
	var price      = req.body.price;
	var combo_id   = req.body.combo_id;
	
	var sql="update combos SET combo_name='" +combo_name + "', sku_id='" +sku_id + "', unit_price=" + unit_price + ",tax=" +tax+ ", price=" +price + " WHERE combo_id=" +combo_id;
	con.query(sql,function(error,result){
		if(error) throw error;
		res.send("1");
	})
});

router.post("/disable_combo",function(req,res){
	
	var combo_id = req.body.combo_id;
	var sql="update combos SET status=0 WHERE combo_id=" +combo_id;
    con.query(sql,function(error,result){
		if(error) throw error;
		console.log(result);
		res.send("1");
	});	
	
});

router.get("/get_products_in_combo",function(req,res){
	var combo_id = req.query.combo_id;
	var sql="select product.name,product.price from product JOIN combo_products WHERE combo_products.product_id=product.product_id AND combo_products.combo_id=" +combo_id;
	con.query(sql,function(error,result){
		if(error) throw error;
		res.send(result);
	})
});
	
	


  return router;
})();