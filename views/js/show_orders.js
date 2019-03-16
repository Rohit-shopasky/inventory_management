
// status 1 -> order_placed
// status 2 -> Dispatched
// status 3 -> Delievered
// status 4 -> Cancelled
var sl_order_ids=new Array();
$(document).ready(function(){
  function showToast(message, duration){
         Materialize.toast(message, duration);
      }

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
	showToast("You need to login first!",5000);
	window.location.assign("/");
}


$('#open_modal').leanModal();
$('.edit_link').leanModal();
$('.modal-trigger').leanModal();

//$('#sl').leanModal();

 $('.datepicker').datepicker({
   dateFormat: 'MM yy',                    
});





$('#filter').click(function(){
	var status= $('#status_filter').val();
	var year  = $('#year_filter').val();
	var month= $('#month_filter').val();
	var order_source = $('#source_filter').val();
	//alert(status + " " +month + " " +year);

	window.location.assign("/show_filter_orders?status=" +status + "&month=" +month + "&year=" +year + "&order_source=" +order_source);
})

$('#print_excel').click(function(){
	var year  = $('#year_filter').val();
	var month= $('#month_filter').val();
	var order_source = $('#source_filter').val();
	window.location.assign("/print_excel_of_filtered_data?month=" +month + "&year=" +year + "&order_source=" + order_source);
})

$('#print_label').click(function(){

 window.location.assign("/generate_sl?order_ids=" +sl_order_ids);

})

$('#shipping_excel').click(function(){
	window.location.assign("/generate_shipping_excel?order_ids=" + sl_order_ids);
})


$('#done').click(function(){

    var company_url = $('#company_url').val();
    var order_no     = $('#order_no').val();	
	var hidden_order_id = document.getElementById('hidden_order_id').innerHTML;
	
	
	if(company_url!="self" || company_url!="amazon")
	{
	    var company_url=company_url.replace("<trackingnumber>",order_no);
	}
	else
	{
		company_url="";
	}
	
	$.ajax({
		type:"POST",
		url:"/send_dispatch_email",
		data:{company_url:company_url,order_id:hidden_order_id,user_id:user_id},
		success:function(data){
			
			    //alert(data);
				window.location.assign("/show_all_orders");
				
				//location.reload();
			
		}
	})
	
 })

});



function sl_print_value(checkbox,val)
{
	if(checkbox.checked==true)
	{
		sl_order_ids.push(val);
		console.log(sl_order_ids);
	}
	else
	{
		var index = sl_order_ids.indexOf(val);
        if (index > -1) 
		{
          sl_order_ids.splice(index, 1);
        }
		console.log(sl_order_ids)
	}
}

function payment_change(order_id,type)
{
	$.ajax({
		type:"POST",
		url:"/change_payment",
		data:{order_id:order_id,user_id:user_id,payment_type:type},
		success:function(data){
			//alert("Payment status changed successfully!");
			//window.location.assign("/show_all_orders");
			location.reload();
		}
	}) 
	//alert(order_id + " " +type);
}



function show_order_detail(val)
{
  var order_id=val;
  $.ajax({
	  "type":"GET",
	  url:"/get_order_detail",
	  data:{order_id:order_id},
	  success:function(resp){
		  
		  var data=resp.order_details;
		  var logs=resp.order_logs;
		  var combo=resp.combo_order_details;
		  var shipping_cost = resp.shipping_cost;
		  var total_discount_in_rs=resp.total_discount_in_rs;
		  var total_payable = resp.total_payable
		  
		  var parent=document.getElementById('parent_table');
		  // remove old table 
		  var myNode = document.getElementById("parent_table");
          while (myNode.firstChild) {
         myNode.removeChild(myNode.firstChild);
          }

		  
		  for(var i=0;i<data.length;i++)
			{
				var product_name   = data[i].name;
				var jars           = data[i].jars;
				var amount         = data[i].amount;
				
				var tr=document.createElement("tr");
				var td1 =document.createElement("td");
				td1_text=document.createTextNode(product_name);
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode(jars);
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3_text=document.createTextNode(amount);
				td3.appendChild(td3_text);
				
				
				
				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				
				parent.appendChild(tr);
			}
			
			for(var i=0;i<combo.length;i++)
			{
				var combo_name     = combo[i].combo_name;
				var jars           = combo[i].quantity_ordered;
				var amount         = combo[i].amount;
				
				var tr1=document.createElement("tr");
				var td1 =document.createElement("td");
				td1_text=document.createTextNode(combo_name);
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode(jars);
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3_text=document.createTextNode(amount);
				td3.appendChild(td3_text);
				
				
				
				tr1.appendChild(td1);
				tr1.appendChild(td2);
				tr1.appendChild(td3);
				
				parent.appendChild(tr1);
			}
			// shipping cost show
			var tr2=document.createElement("tr");
				var td1 =document.createElement("td");
				td1_text=document.createTextNode("Shipping Cost");
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode("");
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3_text=document.createTextNode(shipping_cost);
				td3.appendChild(td3_text);
				
				
				
				tr2.appendChild(td1);
				tr2.appendChild(td2);
				tr2.appendChild(td3);
				
				parent.appendChild(tr2);
				
				// total_discount_in_rs
				var tr2=document.createElement("tr");
				var td1 =document.createElement("td");
				td1_text=document.createTextNode("Discount Deduction Amount");
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode("");
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3_text=document.createTextNode(total_discount_in_rs);
				td3.appendChild(td3_text);
				
				
				
				tr2.appendChild(td1);
				tr2.appendChild(td2);
				tr2.appendChild(td3);
				
				parent.appendChild(tr2);
				
				
					// total_discount_in_rs
				var tr3=document.createElement("tr");
				var td1 =document.createElement("td");
				td1_text=document.createTextNode("Total Payable");
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode("");
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3_text=document.createTextNode(total_payable);
				td3.appendChild(td3_text);
				
				
				
				tr3.appendChild(td1);
				tr3.appendChild(td2);
				tr3.appendChild(td3);
				
				parent.appendChild(tr3);
			
			
		 // order logs
		 var parent=document.getElementById('order_logs_table');
		 var myNode = document.getElementById("order_logs_table");
          while (myNode.firstChild) {
         myNode.removeChild(myNode.firstChild);
          }
		  
		  for(var i=0;i<logs.length;i++)
			{
				var user_name      = logs[i].user_name;
				var text           = logs[i].text;
				var updated_at     = logs[i].updated_at;
				var date_string=updated_at;
				date_string=date_string.toString();
				date_string=date_string.split(' ').slice(0, 5).join(' ');
				updated_at=date_string;
				
				var tr=document.createElement("tr");
				var td1 =document.createElement("td");
				td1_text=document.createTextNode(user_name);
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode(text);
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3_text=document.createTextNode(updated_at);
				td3.appendChild(td3_text);
				
				
				
				
				
				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				
				
				parent.appendChild(tr);
			}
		 
			
	  }
  });   
  
  $.ajax({
	  type:"GET",
	  url:"/get_customer_info",
	  data:{order_id:val},
	  success:function(data){
		  var customer_name=data[0].customer_name;
		  var customer_phone=data[0].phone;
		  var customer_address=data[0].customer_address;
		  var email = data[0].email;
		  var pincode = data[0].pincode;
		  var state   = data[0].customer_state;
		  var city    = data[0].city;
		  //alert(customer_name + "  " +customer_phone);
		  //document.getElementById('customer_details').innerHTML="Customer Name: " +customer_name + "; Phone: " +customer_phone + "; Address: " +customer_address + "; Email: " +email  + "; Pincode: " +pincode + "; State: " +state + "; City: " +city + "; Notes: " +data[0].note + "; Promo: " +data[0].promo;
		  
		  document.getElementById('customer_details').innerHTML="Customer Name: " + customer_name + "; Address: " +customer_address + "; City: " + city + "; State: " +state + "; Pincode: " + pincode + "; Phone: " + customer_phone + "; Email: " +email + "; Notes: " + data[0].note + "; Promo: " +data[0].promo;
		  
		  var track_url=data[0].track_company_url;
		  var myNode = document.getElementById("track_button_div");
               while (myNode.firstChild) {
               myNode.removeChild(myNode.firstChild);
                 }
				 
		   if(track_url)
		  {

			  var link=document.createElement("a");
			  link.onclick=function(){ window.open(track_url, '_blank'); }
			  link.innerHTML="Track";
			  link.className="waves-effect"
			  var parent=document.getElementById("track_button_div");
			  parent.appendChild(link); 
		  }
		  
		  
	  }
	  
  })
}

function open_merchant_copy(id)
{
	
	window.open("/convert_to_pdf_merchant?order_id=" +id);
	//window.open("/generate_bill_customer?order_id=" +id);
	//window.open("/generate_bill_merchant?order_id=" +id);
}

function change_status(id,val,order_source)
{
	//alert(id + " " +val);
	
	var order_id=id;
	var status=val;
	
	if(status!=2)
	{
	    $.ajax({
		type:"POST",
		url:"/change_status",
		data:{order_id:order_id,status:status,user_id:user_id},
		success:function(data){
			//alert("Status changed successfully!");
			
			//window.location.assign("/show_all_orders");
			location.reload();
		}
	   });
	}
	else
	{
		if(order_source==="Amazon")
		{
			$.ajax({
		     type:"POST",
		    url:"/change_status",
		   data:{order_id:order_id,status:status,user_id:user_id},
		   success:function(data){
			//alert("Status changed successfully!");
			location.reload();
			//window.location.assign("/show_all_orders");
		  }
	       });
		}
		else
		{
		$('#modal3').openModal();
		document.getElementById('hidden_order_id').innerHTML=id;
		}
		
	}
}

function calculate_total()
{
	alert("Aya");
}




