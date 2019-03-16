
function  get_parameter(key) {  
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}  

var order_id=get_parameter("order_id");



function cal_tax_amount(amount,tax_percentage)
{
	var tax_amount=(Number(amount) * Number(tax_percentage))/100;
	tax_amount    =Number(amount) + Number(tax_amount);
	return tax_amount;
}

function cal_total_amount(net_amount,tax_percentage)
{
	var tax_amount=(Number(net_amount) * Number(tax_percentage))/100;
	var total_amount=Number(net_amount) + Number(tax_amount);
	return total_amount;
}

function discount_deduct(amount,discount_percentage)
{
	var net=amount;
	net=(Number(amount) * Number(discount_percentage))/100; 
	
	return net;	
}

function cal_discount_amount(amount,discount_percentage)
{
	//var net=amount;
	
	var discount_amount=(Number(amount) * Number(discount_percentage))/100; 
	amount=Number(amount) - Number(discount_amount);
	return amount;
	
}

function cal_unit_price(price)
{
	var temp=Number(price)/1.12;
	return temp;
}

function tax_deduct(amount,tax_percentage)
{
	var temp=(Number(amount) * 12)/100;
	var amount=Number(amount) - Number(temp);
	return amount;
}

var customer_state=
$(document).ready(function(){

$.ajax({
	type:"GET",
	url:"/get_outlet_info_for_invoice",
	data:{order_id:order_id},
	success:function(data){
	
		var date_string=data.order_details[0].order_date;
         date_string=new Date(date_string).toUTCString();
		date_string=date_string.split(' ').slice(0, 4).join(' ');
		
		date_string=date_string.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
		customer_state=data.outlet_details[0].state
		document.getElementById('order_no').innerHTML="<b> Order No: </b>" +order_id + "";
		document.getElementById('order_date').innerHTML="<b> Order Date: </b>" + date_string + "";
		
		
		document.getElementById('billing_address').innerHTML=data.outlet_details[0].outlet_name + " <br>" + data.outlet_details[0].billing_address + " <br>" + data.outlet_details[0].state + ", " +data.outlet_details[0].city + " - " + data.outlet_details[0].pincode + "<br> <b>GSTIN: </b>" + data.outlet_details[0].gst_no + "<br> <b>Phone: </b>" +data.outlet_details[0].phone;
		
		document.getElementById('shipping_address').innerHTML=data.outlet_details[0].outlet_name + " <br>" + data.outlet_details[0].shipping_address + " <br>" + data.outlet_details[0].state + ", " +data.outlet_details[0].city + " - " + data.outlet_details[0].pincode + "<br><b>Phone: </b>" +data.outlet_details[0].phone ;
		
	}
});

 var tax_amount_count=0;
		 var jars_count=0;
		  var total_bill=0;

$.ajax({
	type:"GET",
	url:"/get_order_detail_for_invoice",
	data:{order_id:order_id},
	success:function(resp){
		var order = resp.order;
		var order_details = resp.order_details;
		var combo_order_details = resp.combo_order_details;
		var commision = resp.commision;
		var state     = resp.state;
        console.log(resp);
		
		
		// for orders
		var parent = document.getElementById("parent_table");
		var count=1;
		var jars=0;
		for(var i=0;i<order_details.length;i++)
		{
			 
			 var up           = remove_commision(order_details[i].unit_price,commision)
			 var ta           = Number(up) * Number(order_details[i].jars);
			     jars         = Number(jars) + Number(order_details[i].jars);
			var tr = document.createElement("tr");
			var s_no         = $("<td class='order'></td>").text(count); 
			var product_name = $("<td class='order'></td>").text(order_details[i].name + "(" + order_details[i].selling_quantity_gms + "g)");
			var sku_id       = $("<td class='order'></td>").text(order_details[i].sku_id);
			var hsn          = $("<td class='order'></td>").text(order_details[i].hsn);
			var unit_price   = $("<td class='order'></td>").text(up.toPrecision(3));
			var quantity     = $("<td class='order'></td>").text(order_details[i].jars);
			var total_amount = $("<td class='order'></td>").text(Number(Math.round(ta)));
			
			count++;
			$(tr).append(s_no,product_name,sku_id,hsn,unit_price,quantity,total_amount);
			$(parent).append(tr);
		}

        // for combo orders
        for(var i=0;i<combo_order_details.length;i++)
		{
		  var up           = remove_commision(combo_order_details[i].unit_price,commision)
		  var ta           = Number(up) * Number(combo_order_details[i].quantity_ordered);
		      jars         = Number(jars) + Number(combo_order_details[i].quantity_ordered);
		  var tr = document.createElement("tr");
		  var s_no         = $("<td class='order'></td>").text(count); 
		  var product_name = $("<td class='order'></td>").text(combo_order_details[i].combo_name);
		  var sku_id       = $("<td class='order'></td>").text(combo_order_details[i].sku_id);
		  var hsn          = $("<td class='order'></td>").text("");
		  var unit_price   = $("<td class='order'></td>").text(up.toPrecision(3));
		  var quantity     = $("<td class='order'></td>").text(combo_order_details[i].quantity_ordered);
		  var total_amount = $("<td class='order'></td>").text(Number(Math.round(ta)));
			
			count++;
			$(tr).append(s_no,product_name,sku_id,hsn,unit_price,quantity,total_amount);
			$(parent).append(tr);
		}
		
        var tr_without_tax = document.createElement("tr");
            var s_no         = $("<td class='order'></td>").text(""); 
		  var product_name = $("<td class='order'></td>").text("");
		  var sku_id       = $("<td class='order'></td>").text("");
		  var hsn          = $("<td class='order'></td>").text("Total Without Tax");
		  var unit_price   = $("<td class='order'></td>").text("");
		  var quantity     = $("<td class='order'></td>").text("");
		  var total_amount = $("<td class='order'></td>").text(Math.round(order[0].amount_without_tax));
		  $(tr_without_tax).append(s_no,product_name,sku_id,hsn,unit_price,quantity,total_amount);
		  parent.appendChild(tr_without_tax);
		  
		  var str ="";
		  if(state==="DELHI"){str="CGST + SGST @12%"}  else{str="IGST @12"}
		  
		  
		  var tr_total_tax = document.createElement("tr");
          var s_no         = $("<td class='order'></td>").text(""); 
		  var product_name = $("<td class='order'></td>").text("");
		  var sku_id       = $("<td class='order'></td>").text("");
		  var hsn          = $("<td class='order'></td>").text("Total Tax");
		  var unit_price   = $("<td class='order'></td>").text("");
		  var quantity     = $("<td class='order'></td>").text(str);
		  var total_amount = $("<td class='order'></td>").text(Math.round(order[0].tax_amount));
		  $(tr_total_tax).append(s_no,product_name,sku_id,hsn,unit_price,quantity,total_amount);
		  parent.appendChild(tr_total_tax);
		  
		  
		  
		  
		 var tr_net_total = document.createElement("tr");
          var s_no         = $("<td class='order'></td>").text(""); 
		  var product_name = $("<td class='order'></td>").text("");
		  var sku_id       = $("<td class='order'></td>").text("");
		  var hsn          = $("<td class='order net'></td>").text("Net Total");
		  var unit_price   = $("<td class='order'></td>").text("");
		  var quantity     = $("<td class='order net'></td>").text(jars);
		  var total_amount = $("<td class='order net'></td>").text(Math.round(order[0].total_payable));
		  $(tr_net_total).append(s_no,product_name,sku_id,hsn,unit_price,quantity,total_amount);
		  parent.appendChild(tr_net_total); 
	}
}); 


function remove_commision(amount,commision)
{
	var temp = (Number(amount) * Number(commision))/100;
	var new_amount = Number(amount) - Number(temp);
	
	return new_amount;
}



if(window.location.pathname=="/generate_outlet_bill_customer")
{
	document.getElementById('copy').innerHTML="Customer Copy";
}
else
{
	document.getElementById('copy').innerHTML="Merchant Copy";
}



})

/*
var invoice_url=window.location.href;
$.ajax({
	type:"POST",
	url:"/convert_to_pdf",
	data:{invoice_url:invoice_url},
	success:function(data){
		alert(data);
	}
}); */