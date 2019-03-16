function getCook(cookiename) 
  {
  // Get name followed by anything except a semicolon
  var cookiestring=RegExp(""+cookiename+"[^;]+").exec(document.cookie);
  // Return everything after the equal sign, or an empty string if the cookie name not found
  return unescape(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
  }
	  
user_id=getCook("user_id");


if(user_id=="" || user_id===undefined)
{
	//showToast("You need to login first!",5000);
	window.location.assign("/");
}

var plot_data=new Array(12);
var jars_data=new Array(12);
$(document).ready(function(){
	
	$.ajax({
		type:"GET",
		url:"/get_amount_data",
		success:function(response){
			dates=response.dates;
			jars=response.jars;
			amount=response.amount;
			//var month = response.month // for right display month;
			//document.getElementById('dashboard_month').innerHTML="Data of " +month;
			
			var ctx = document.getElementById('myChart').getContext('2d');
            var chart = new Chart(ctx, {
                                         type: 'line',
                                         data: {
                                         labels:dates,
										 
                                          datasets: [{
                                          label: "Amount",
                                          borderColor: 'rgb(255, 99, 132)',
                                          data:amount,
                                           }]
                                       },

                              options: {}
                      });	
					  
		  var ctx = document.getElementById('myChart2').getContext('2d');
            var chart = new Chart(ctx, {
                                         type: 'line',
                                         data: {
                                         labels:dates,
										 
                                          datasets: [{
                                          label: "Jars",
                                          borderColor: 'rgb(255, 99, 132)',
                                          data:jars,
                                           }]
                                       },

                              options: {}
                      });				  
		}
	})
	
	
	$.ajax({
		type:"GET",
		url:"/get_all_orders_this_month",
		success:function(data){
			document.getElementById('total_orders').innerHTML=data.length;
		}
	})
	
	
	
	$.ajax({
		type:"GET",
		url:"/get_pending_orders_this_month",
		success:function(data){
			document.getElementById('pending_orders').innerHTML=data.length;
		}
	})
	
	$.ajax({
		type:"GET",
		url:"/get_total_payment",
		success:function(data){
			document.getElementById("total_payment").innerHTML=data.total_payment;
		}
	})
	
	$.ajax({
		type:"GET",
		url:"/get_due_payment",
		success:function(data){
			document.getElementById("total_due_payment").innerHTML=data.total_due_payment;
		}
	})
	
	$.ajax({
		type:"GET",
		url:"/get_total_stock",
		success:function(data){
			document.getElementById("total_stock").innerHTML=data.jars;
		}
	})
	
	$.ajax({
		type:"GET",
		url:"/get_total_jars",
		success:function(data){
			
			document.getElementById('total_jars').innerHTML=data.total_jars;
		}
	})


});