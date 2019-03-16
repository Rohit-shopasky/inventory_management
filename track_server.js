module.exports=(function(){
	
	var router = require('express').Router();
	var ejs    = require("ejs");
	var mysql = require('mysql');
    var moment = require('moment');
    var con    = require("./config.js");
	 

router.get("/track",function(req,res){
	var sql="select * from track";
	con.query(sql,function(error,result){
		
		for(var i=0;i<result.length;i++)
		  {
			var date_string=result[i].create_date;
		    date_string=date_string.toString();
		    date_string=date_string.split(' ').slice(0, 5).join(' ');
		    result[i].time=date_string;
		 }
		
		res.render("track.ejs",{result:result});
	});
	
})	


function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

router.post("/save_new_company",function(req,res){
	var company_name = req.body.company_name;
	var track_url    = req.body.track_url;
	var order_no=0;

   if(order_no=== undefined){order_no=0}
   
	var sql="insert into track set ?";
	var values={
		"company_name" : company_name,
		"track_url"    : track_url,
		"order_no"     : order_no,
	} 
	
	con.query(sql,values,function(error,result){
		if(error) throw error;
		res.send("1");
	})
	
	
}); 
   
 
return router;
})();