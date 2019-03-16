module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
    

	router.get("/outlet",function(req,res){
		
		
		var sql="select * from outlets";
		con.query(sql,function(error,result){
			if(error) throw error;
			res.render("outlet.ejs",{result:result});
		})
	});
	
	
   router.post("/save_outlet", (req,res)=>{
	   var outlet_name = req.body.outlet_name;
	   var outlet_type = req.body.outlet_type;
	   var commision   = req.body.commision;
	   var contact_person = req.body.contact_person;
	   var phone       = req.body.phone;
	   var billing_address = req.body.billing_address;
	   var shipping_address= req.body.shipping_address; 
	   var gst_no      = req.body.gst_no;
	   var state       = req.body.state;
	   var city        = req.body.city;
	   var branch_name = req.body.branch_name;
	   var pincode     = req.body.pincode;
	   
	   var sql="select phone from outlets where phone=" + phone;
	   con.query(sql,function(error,result){
		   if(error) throw error;
		   if(result.length==0)
		   {
			   // insert outlet
			   var sql="insert into outlets SET ?";
			   var values = {
				   outlet_name  : outlet_name,
				   outlet_type  : outlet_type,
				   commision    : commision,
				   contact_person: contact_person,
				   phone        : phone,
				   billing_address: billing_address,
				   shipping_address:shipping_address,
				   gst_no       : gst_no,
				   email        :"",
				   balance      :0,
				   state        :state,
				   city         :city,
				   brand_name  :branch_name,
				   pincode      :pincode,
			   }
			   
			   con.query(sql,values,function(error,result){
				   if(error) throw error;
				   res.send("1");
			   })
			   
		   }
		   else
		   {
			   // outlet already exsist
			   console.log("Already exsist");
			   res.send("0");
		   }
	   })
	   
   })
   
   router.get("/get_outlet_details",function(req,res){
	   var outlet_id = req.query.outlet_id;
	   var sql="select * from outlets where outlet_id=" + outlet_id;
	   con.query(sql,function(error,result){
		   if(error) throw error;
		   res.send(result);
	   });
   });
   
   router.post("/save_outlet_edits",(req,res)=>{
	   
	   var outlet_name = req.body.outlet_name;
	   var outlet_type = req.body.outlet_type;
	   var commision   = req.body.commision;
	   var contact_person = req.body.contact_person;
	   var phone       = req.body.phone;
	   var billing_address = req.body.billing_address;
	   var shipping_address= req.body.shipping_address;
	   var gst_no      = req.body.gst_no;
	   var outlet_id   = req.body.outlet_id;
	   var branch_name = req.body.branch_name;
	   var pincode     = req.body.pincode;
	   var state       = req.body.state;
	   var city        = req.body.city;
	   console.log(req.body);
	   
	   var sql="update outlets set outlet_name='" + outlet_name + "', outlet_type='" + outlet_type + "', commision=" + commision + ", contact_person='" + contact_person + "', phone=" + phone + ", billing_address='" + billing_address + "', shipping_address='" + shipping_address + "', gst_no='" + gst_no + "', brand_name='" + branch_name + "',pincode=" +pincode + ",state='" + state + "', city='" + city + "'  where outlet_id=" + outlet_id + "";
	    
	   con.query(sql,function(error,result){
		   if(error) throw error;
		   res.send("1");
	   })
	  
   })

  return router;
})();