module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	  
	
router.get("/show_all_customers",function(req,res){
	
	var page=req.query.page;
	var start=0; 
		 if(page)
		 {
		 
		 if(page!=1)
			 {
				 var temp=Number(page) * 20;
		         start=Number(temp) - 20;
			 }
		 }
		 else
		 {
			 page=1;
		 }
	var sql="select * from customers order by customer_id DESC LIMIT 20 OFFSET " +start;
	con.query(sql,function(error,result){
		//console.log(result);
		//all customers count
		var sql="select COUNT(customer_id) AS customers_count FROM customers order by customer_id DESC";
		con.query(sql,function(error,customers_count){
			customers_count=customers_count[0].customers_count;
           res.render("customers.ejs",{result:result,customers_count:customers_count,page:page});
		});
		
	});
	
});	

router.post("/add_new_customer",function(req,res){
	
	var customer_name      = req.body.customer_name;
	var customer_address   = req.body.customer_address;
	var customer_state     = req.body.customer_state;
	var city               = req.body.city;
	var pincode            = req.body.pincode;
	var phone              = req.body.phone;
	var email              = req.body.email;
	
	
	var values={
	"customer_name"     : customer_name,
	"customer_address"  : customer_address,
	"customer_state"    : customer_state,
	"city"              : city,
	"pincode"           : pincode,
	"phone"             : phone,
	"email"             : email,
	};
	var sql="insert into customers SET ?";
	con.query(sql,values,function(error,result){
		res.send("1");
	});
})

router.post("/edit_new_customer",function(req,res){
	
	var customer_name      = req.body.customer_name;
	var customer_address   = req.body.customer_address;
	var customer_state     = req.body.customer_state;
	var city               = req.body.city;
	var pincode            = req.body.pincode;
	var phone              = req.body.phone;
	var email              = req.body.email;
	var customer_id        = req.body.customer_id;
	
	var sql="update customers SET customer_name='" +customer_name + "', customer_address='" + customer_address +"', customer_state='" +customer_state + "', city='" +city + "', pincode=" +pincode + ", phone=" +phone + ", email='" +email + "' WHERE customer_id=" +customer_id;
	con.query(sql,function(error,result){
		if(error) throw error;
		console.log(result);
		res.send("1");
	})
})

router.get("/customer_details",function(req,res){
	var customer_id=req.query.customer_id;
    
	var sql="select * from customers WHERE customer_id=" +customer_id;
    con.query(sql,function(error,result){
		res.send(result);
	})
	
})

router.get("/search",function(req,res){
	var customer_name = req.query.customer_name;
	var sql = "select * from customers WHERE customer_name LIKE '%" +customer_name + "%' LIMIT 5";
    con.query(sql,function(error,result){
		if(error) throw error;
		res.send(result);
	});	
});

router.get("/all_customers_excel_export",function(req,res){
	
	var sql="select * from customers";
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
			 
		   worksheet.cell(1,1).string('Customer ID').style(style);
           worksheet.cell(1,2).string('Name').style(style);
           worksheet.cell(1,3).string('Address').style(style);
           worksheet.cell(1,4).string('State').style(style);
           worksheet.cell(1,5).string('City').style(style);
           worksheet.cell(1,6).string('Pincode').style(style);
           worksheet.cell(1,7).string('Phone').style(style); 
		   worksheet.cell(1,8).string('Email').style(style);
		   
           var row=2;		   
		
		for(var i=0;i<result.length;i++)
		{
			 worksheet.cell(row,1).number(Number(result[i].customer_id)).style(style);
			 worksheet.cell(row,2).string(result[i].customer_name).style(style);
			 worksheet.cell(row,3).string(result[i].customer_address).style(style);
			 worksheet.cell(row,4).string(result[i].customer_state).style(style);
			 worksheet.cell(row,5).string(result[i].city).style(style);
			 worksheet.cell(row,6).number(Number(result[i].pincode)).style(style);
			 worksheet.cell(row,7).number(Number(result[i].phone)).style(style);
			 worksheet.cell(row,8).string(result[i].email).style(style);
			 row++;
		}
		
		workbook.write("./views/excel_sheets/Customers.xlsx",function(){
		   res.download("./views/excel_sheets/Customers.xlsx");
	   });
	});
	
});

router.get("/get_all_orders_of_customer",(req,res)=>{
	let customer_id = req.query.customer_id;
	let customer_name = req.query.customer_name;
	var sql ="select * from orders where customer_id=" + customer_id;
	con.query(sql,(error,result)=>{
		if(error) throw error;
		res.render("specified_orders.ejs",{result:result,customer_name:customer_name});
	})
});
	 
  return router;
})();