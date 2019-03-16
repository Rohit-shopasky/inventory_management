
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
	url:"/get_customer_info",
	data:{order_id:order_id},
	success:function(data){
		//document.getElementById('billing_address').innerHTML=data[0].customer_address;
		var date_string=data[0].order_date;
         date_string=new Date(date_string).toUTCString();
		date_string=date_string.split(' ').slice(0, 4).join(' ');
		
		date_string=date_string.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
		customer_state=data[0].customer_state
		document.getElementById('order_no').innerHTML="<b> Order No: </b>" +order_id + "";
		document.getElementById('order_date').innerHTML="<b> Order Date: </b>" + date_string + "";
		
		//document.getElementById('right_order_no').innerHTML="<b> Order No: </b>" +order_id + "";
		//document.getElementById('right_order_date').innerHTML="<b> Order date: </b>" + date_string + "";
		
		document.getElementById('billing_address').innerHTML=data[0].customer_name + " <br>" + data[0].customer_address + " <br>" + data[0].customer_state + ", " +data[0].city + " - " + data[0].pincode + "<br><b>Phone </b>" +data[0].phone;
		
		document.getElementById('shipping_address').innerHTML=data[0].customer_name + " <br>" + data[0].customer_address + " <br>" + data[0].customer_state + ", " +data[0].city + " - " + data[0].pincode + "<br><b>Phone </b>" +data[0].phone ;
		
		//document.getElementById('billing_address_right').innerHTML=data[0].customer_name + " <br>" + data[0].customer_address + " <br>" + data[0].customer_state + "," +data[0].city + "," + data[0].pincode;
		
		//document.getElementById('shipping_address_right').innerHTML=data[0].customer_name + " <br>" + data[0].customer_address + " <br>" + data[0].customer_state + "," +data[0].city + "," + data[0].pincode;
	}
});

 var tax_amount_count=0;
		 var jars_count=0;
		  var total_bill=0;
$.ajax({
	type:"GET",
	url:"/get_order_detail",
	data:{order_id:order_id},
	success:function(resp){
		var parent=document.getElementById('parent_table');
		//var right_parent=document.getElementById('right_parent_table');
        console.log(resp);
		var data=resp.order_details;
		var combo=resp.combo_order_details;
		var shipping_cost=resp.shipping_cost;
		var total_payable_db=resp.total_payable;
		var total_tax_db = resp.total_tax;
		//alert(total_payable + " " +total_tax);
		var total_discount_in_rs=resp.total_discount_in_rs;
		
		// for dynamically creating discount column
	    if(Number(total_discount_in_rs)!=0)
		{
           var parent_head=document.getElementById('parent_head');
           var th=document.createElement("th");
		   th.className="order";
		   if(data.length!=0)
		   {
           var text=document.createTextNode("Discount (" +data[0].discount_percentage + "%)");
		   }
		   else
		   {
			  var text=document.createTextNode("Discount (" +combo[0].discount_percentage + "%)"); 
		   }
           th.appendChild(text);
           parent_head.insertBefore(th,parent_head.childNodes[10]); 
 
	    }
		 var total_bill=0;
		 var total_tax=0;
		 var total_jar=0;
		 var total_without_tax=0;
		 total_bill=Number(total_bill) + Number(shipping_cost);
		for(var i=0;i<data.length;i++)
		{
			var product_name   = data[i].name;
			var weight         = data[i].selling_quantity_gms
			var jars           = data[i].jars;               
			var total_amount   = data[i].amount;             // total amount
			var price          = cal_unit_price(data[i].price); // unit price
			var net           = Number(price) * Number(jars);
			
			var after_discount_amount= cal_discount_amount(net,data[i].discount_percentage);
			var product_amount_without_tax=after_discount_amount;
            var total_product_amount=cal_tax_amount(after_discount_amount,12);
			
			var discount_amount_on_product=discount_deduct(net,data[i].discount_percentage);
			var tax_amount_on_product=discount_deduct(product_amount_without_tax,12);
			
			
		    total_bill     = Number(total_bill) + Number(total_product_amount); 
			total_tax      = Number(total_tax)  + Number(tax_amount_on_product);
			total_jar      = Number(total_jar)  + Number(jars);
			total_without_tax=Number(total_without_tax) + Number(product_amount_without_tax);
 
			var weight_text="";
			if(weight>1000)
			{
				 weight_text=weight + "kg";
			}
			else
			{
				weight_text=weight + "gm";
			}
			
			var tr=document.createElement("tr");
			    
				
				var td0 =document.createElement("td");
				td0.className="normal_text";
				td0_text=document.createTextNode(i+1);
				td0.appendChild(td0_text);
				
				var td1 =document.createElement("td");
				td1.className="normal_text";
				td1_text=document.createTextNode(product_name + " (" + weight_text + ")");
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2.className="normal_text";
				td2_text=document.createTextNode(Math.round(price));
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3.className="normal_text";
				td3_text=document.createTextNode(jars);
				td3.appendChild(td3_text);
				
				 if(Number(total_discount_in_rs)!=0)
				{
				var tdDiscount=document.createElement("td");
				tdDiscount.className="normal_text";
				tdDiscount_text=document.createTextNode("-" +Math.round(discount_amount_on_product));
				tdDiscount.appendChild(tdDiscount_text);
				}
				
				var td4 =document.createElement("td");
				td4.className="normal_text";
				td4_text=document.createTextNode(Math.round(net));
				td4.appendChild(td4_text);
				
				
				
				/*var td5 =document.createElement("td");
				td5.className="normal_text";
				if(customer_state==="Delhi")
				td5_text=document.createTextNode("6% + 6%");
			    else
				td5_text=document.createTextNode("12%");
				td5.appendChild(td5_text); */
				
				
				
				/*var td6 =document.createElement("td");
				td6.className="normal_text";
				if(customer_state==="Delhi")
			    td6_text=document.createTextNode("CGST + SGST");
			    else
				td6_text=document.createTextNode("IGST");
				td6.appendChild(td6_text); */
				
				/*var td7 =document.createElement("td");
				td7.className="normal_text";
				td7_text=document.createTextNode(tax_amount.toPrecision(3));
				td7.appendChild(td7_text); */
				
				var td8 =document.createElement("td");
				td8.className="normal_text";
				td8_text=document.createTextNode(Math.round(product_amount_without_tax));
				td8.appendChild(td8_text);
				
				tr.appendChild(td0);
				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				
				tr.appendChild(td4);
				if(Number(total_discount_in_rs)!=0) {tr.appendChild(tdDiscount);}
				//tr.appendChild(td5);
				//tr.appendChild(td6);
				//tr.appendChild(td7);
				tr.appendChild(td8);
				parent.appendChild(tr);
				
		}
		
		      for(var i=0;i<combo.length;i++)
			  {
                  var combo_name     =   combo[i].combo_name;
			      var jars           = combo[i].quantity_ordered;
			      var total_amount   = combo[i].amount;
				  var total_amount   = combo[i].amount;             // total amount
			      var price          = cal_unit_price(combo[i].price); // unit price
			      var net            = Number(price) * Number(jars);
				  
				  
				  
			var after_discount_amount= cal_discount_amount(net,combo[i].discount_percentage);
			var product_amount_without_tax=after_discount_amount;
            var total_product_amount=cal_tax_amount(after_discount_amount,12);
			
			var discount_amount_on_product=discount_deduct(net,combo[i].discount_percentage);
			var tax_amount_on_product=discount_deduct(product_amount_without_tax,12);
			
			
		    total_bill     = Number(total_bill) + Number(total_product_amount); 
			total_tax      = Number(total_tax)  + Number(tax_amount_on_product);
			total_jar      = Number(total_jar)  + Number(jars);
			total_without_tax=Number(total_without_tax) + Number(product_amount_without_tax);
				 
				var tr3=document.createElement("tr");
				var td0 =document.createElement("td");
				td0.className="normal_text";
				td0_text=document.createTextNode(i+1);
				td0.appendChild(td0_text);
				
				var td1 =document.createElement("td");
				td1.className="normal_text";
				td1_text=document.createTextNode(combo_name);
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2.className="normal_text";
				td2_text=document.createTextNode(Math.round(price));
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3.className="normal_text";
				td3_text=document.createTextNode(jars);
				td3.appendChild(td3_text);
				
				
				
				var td4 =document.createElement("td");
				td4.className="normal_text";
				td4_text=document.createTextNode(Math.round(net));
				td4.appendChild(td4_text);
				
				if(Number(total_discount_in_rs)!=0)
				{
				var tdDiscount=document.createElement("td");
				tdDiscount.className="normal_text";
				tdDiscount_text=document.createTextNode("-" +Math.round(discount_amount_on_product));
				tdDiscount.appendChild(tdDiscount_text);
				} 
				
				/*var td5 =document.createElement("td");
				td5.className="normal_text";
				if(customer_state==="Delhi")
				td5_text=document.createTextNode("6% + 6%");
			    else
				td5_text=document.createTextNode("12%");
				td5.appendChild(td5_text); */
				
				
				
				/*var td6 =document.createElement("td");
				td6.className="normal_text";
				if(customer_state==="Delhi")
			    td6_text=document.createTextNode("CGST + SGST");
			    else
				td6_text=document.createTextNode("IGST");
				td6.appendChild(td6_text); */
				
				/*var td7 =document.createElement("td");
				td7.className="normal_text";
				td7_text=document.createTextNode(tax_amount.toPrecision(3));
				td7.appendChild(td7_text);*/
				
				var td8 =document.createElement("td");
				td8.className="normal_text";
				td8_text=document.createTextNode(Math.round(product_amount_without_tax));
				td8.appendChild(td8_text);
				
				tr3.appendChild(td0);
				tr3.appendChild(td1);
				tr3.appendChild(td2);
				tr3.appendChild(td3);
				
				tr3.appendChild(td4);
				if(Number(total_discount_in_rs)!=0) {tr3.appendChild(tdDiscount);}
				//tr3.appendChild(td5);
				//tr3.appendChild(td6);
				//tr3.appendChild(td7);
				tr3.appendChild(td8);
				var child=parent.childNodes;
				   child=child.length;
				   child=Number(child) - 1;
				   parent.insertBefore(tr3,parent.childNodes[Number(child)]);
				
			  }
		
        
			
		 // total without tax
		 
		 var tr_total_without_tax=document.createElement("tr");
	     tr_total_without_tax.id="total_without_tax";
		tr_total_without_tax.setAttribute("style"," background: #f5f5f5");
		var td0 =document.createElement("td");
		         td0.className="normal_text";
				td0_text=document.createTextNode("");
				td0.appendChild(td0_text);
				
				var td1 =document.createElement("td");
				td1.className="normal_text";
				td1_text=document.createTextNode("");
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2.className="normal_text";
				td2.setAttribute("style","font-weight:bold")
				td2_text=document.createTextNode("Total Without Tax");
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3.className="normal_text";
				td3.setAttribute("style","font-weight:bold")
				td3_text=document.createTextNode("");
				td3.appendChild(td3_text);
				
				
				
				var td4 =document.createElement("td");
				td4.className="normal_text";
				td4_text=document.createTextNode("");
				td4.appendChild(td4_text);
				
				if(Number(total_discount_in_rs)!=0)
				{
				var tdDiscount=document.createElement("td");
				tdDiscount.className="normal_text";
				tdDiscount_text=document.createTextNode("");
				tdDiscount.appendChild(tdDiscount_text);
				} 
				
				/*var td5 =document.createElement("td");
				td5.className="normal_text";
				td5_text=document.createTextNode("");
				td5.appendChild(td5_text); */
						
				/* var td6 =document.createElement("td");
				td6.className="normal_text";
				td6_text=document.createTextNode("");
				td6.appendChild(td6_text); */
				
				/*var td7 =document.createElement("td");
				td7.className="normal_text";
				td7.setAttribute("style","font-weight:bold")				
				td7_text=document.createTextNode("");
				td7.appendChild(td7_text);*/
				
				var td8 =document.createElement("td");
				td8.className="normal_text";
				td8.id="shipping_cost";
				td8.setAttribute("style","font-weight:bold")
				td8_text=document.createTextNode(Math.round(total_without_tax));
				td8.appendChild(td8_text); 
				
				tr_total_without_tax.appendChild(td0);
				tr_total_without_tax.appendChild(td1);
				tr_total_without_tax.appendChild(td2);
				tr_total_without_tax.appendChild(td3);
				
				tr_total_without_tax.appendChild(td4);
				if(Number(total_discount_in_rs)!=0) {tr_total_without_tax.appendChild(tdDiscount);}
				//tr4.appendChild(td5);
				//tr4.appendChild(td6);
				//tr_total_without_tax.appendChild(td7);
				tr_total_without_tax.appendChild(td8);
				parent.appendChild(tr_total_without_tax);
				
		// shipping row		
		if(shipping_cost!=0)
		{   total_without_tax=Number(total_without_tax) + Number(shipping_cost);
		var tr4=document.createElement("tr");
	    tr4.id="shipping_cost";
		tr4.setAttribute("style"," background: #f5f5f5");
		var td0 =document.createElement("td");
		         td0.className="normal_text";
				td0_text=document.createTextNode("");
				td0.appendChild(td0_text);
				
				var td1 =document.createElement("td");
				td1.className="normal_text";
				td1_text=document.createTextNode("");
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2.className="normal_text";
				td2.setAttribute("style","font-weight:bold")
				td2_text=document.createTextNode("Shipping Cost");
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3.className="normal_text";
				td3.setAttribute("style","font-weight:bold")
				td3_text=document.createTextNode("");
				td3.appendChild(td3_text);
				
				
				
				var td4 =document.createElement("td");
				td4.className="normal_text";
				td4_text=document.createTextNode("");
				td4.appendChild(td4_text);
				
				if(Number(total_discount_in_rs)!=0)
				{
				var tdDiscount=document.createElement("td");
				tdDiscount.className="normal_text";
				tdDiscount_text=document.createTextNode("");
				tdDiscount.appendChild(tdDiscount_text);
				} 
				
				/*var td5 =document.createElement("td");
				td5.className="normal_text";
				td5_text=document.createTextNode("");
				td5.appendChild(td5_text); */
						
				/* var td6 =document.createElement("td");
				td6.className="normal_text";
				td6_text=document.createTextNode("");
				td6.appendChild(td6_text); */
				
				/*var td7 =document.createElement("td");
				td7.className="normal_text";
				td7.setAttribute("style","font-weight:bold")				
				td7_text=document.createTextNode("");
				td7.appendChild(td7_text);*/
				
				var td8 =document.createElement("td");
				td8.className="normal_text";
				td8.id="shipping_cost";
				td8.setAttribute("style","font-weight:bold")
				td8_text=document.createTextNode(shipping_cost);
				td8.appendChild(td8_text);
				
				tr4.appendChild(td0);
				tr4.appendChild(td1);
				tr4.appendChild(td2);
				tr4.appendChild(td3);
				
				tr4.appendChild(td4);
				if(Number(total_discount_in_rs)!=0) {tr4.appendChild(tdDiscount);}
				//tr4.appendChild(td5);
				//tr4.appendChild(td6);
				//tr4.appendChild(td7);
				tr4.appendChild(td8);
				parent.appendChild(tr4);	 
	        }		
		 
			
		// total tax row
         var tr_total_tax=document.createElement("tr");
	    tr_total_tax.id="total_tax";
		tr_total_tax.setAttribute("style"," background: #f5f5f5");
		var td0 =document.createElement("td");
		         td0.className="normal_text";
				td0_text=document.createTextNode("");
				td0.appendChild(td0_text);
				
				var td1 =document.createElement("td");
				td1.className="normal_text";
				td1_text=document.createTextNode("");
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2.className="normal_text";
				td2.setAttribute("style","font-weight:bold")
				td2_text=document.createTextNode("Total Tax");
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3.className="normal_text";
				td3.setAttribute("style","font-weight:bold")
				if(customer_state==="DELHI")
			    td3_text=document.createTextNode("CGST + SGST @12%");
			    else
				td3_text=document.createTextNode("IGST @12%");
				//td3_text=document.createTextNode("");
				td3.appendChild(td3_text);
				
				
				
				var td4 =document.createElement("td");
				td4.className="normal_text";
				td4_text=document.createTextNode("");
				td4.appendChild(td4_text);
				
				if(Number(total_discount_in_rs)!=0)
				{
				var tdDiscount=document.createElement("td");
				tdDiscount.className="normal_text";
				tdDiscount_text=document.createTextNode("");
				tdDiscount.appendChild(tdDiscount_text);
				} 
				
				/*var td5 =document.createElement("td");
				td5.className="normal_text";
				td5_text=document.createTextNode("");
				td5.appendChild(td5_text); */
						
				/* var td6 =document.createElement("td");
				td6.className="normal_text";
				td6_text=document.createTextNode("");
				td6.appendChild(td6_text); */
				
				/*var td7 =document.createElement("td");
				td7.className="normal_text";
				td7.setAttribute("style","font-weight:bold")				
				td7_text=document.createTextNode("");
				td7.appendChild(td7_text);*/
				
				var td8 =document.createElement("td");
				td8.className="normal_text";
				td8.id="shipping_cost";
				td8.setAttribute("style","font-weight:bold")
				td8_text=document.createTextNode(Math.round(total_tax_db));
				td8.appendChild(td8_text);
				
				tr_total_tax.appendChild(td0);
				tr_total_tax.appendChild(td1);
				tr_total_tax.appendChild(td2);
				tr_total_tax.appendChild(td3);
				
				tr_total_tax.appendChild(td4);
				if(Number(total_discount_in_rs)!=0) {tr_total_tax.appendChild(tdDiscount);}
				//tr4.appendChild(td5);
				//tr4.appendChild(td6);
				//tr_total_tax.appendChild(td7);
				tr_total_tax.appendChild(td8);
				parent.appendChild(tr_total_tax);
         		
				
				
		// total bill row
		
		var tr2=document.createElement("tr");
	    tr2.id="total";
		tr2.setAttribute("style"," background: #f5f5f5");
		var td0 =document.createElement("td");
		         td0.className="normal_text";
				td0_text=document.createTextNode("");
				td0.appendChild(td0_text);
				
				var td1 =document.createElement("td");
				td1.className="normal_text";
				td1_text=document.createTextNode("");
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2.className="normal_text";
				td2.setAttribute("style","font-weight:bold")
				td2_text=document.createTextNode("Net Total");
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3.className="normal_text";
				td3.setAttribute("style","font-weight:bold")
				td3_text=document.createTextNode(total_jar);
				td3.appendChild(td3_text);
				
				
				
				var td4 =document.createElement("td");
				td4.className="normal_text";
				td4_text=document.createTextNode("");
				td4.appendChild(td4_text);
				
				if(Number(total_discount_in_rs)!=0)
				{
				var tdDiscount=document.createElement("td");
				tdDiscount.className="normal_text";
				tdDiscount_text=document.createTextNode("");
				tdDiscount.appendChild(tdDiscount_text);
				} 
				
				/*var td5 =document.createElement("td");
				td5.className="normal_text";
				td5_text=document.createTextNode("");
				td5.appendChild(td5_text); */

				/*var td6 =document.createElement("td");
				td6.className="normal_text";
				td6_text=document.createTextNode("");
				td6.appendChild(td6_text); */
				
				var td7 =document.createElement("td");
				td7.className="normal_text";
				td7.setAttribute("style","font-weight:bold")				
				td7_text=document.createTextNode(total_tax);
				td7.appendChild(td7_text);
				
				var td8 =document.createElement("td");
				td8.className="normal_text";
				td8.id="total_amount_in_rs";
				td8.setAttribute("style","font-weight:bold")
				td8_text=document.createTextNode(Math.round(total_payable_db));
				td8.appendChild(td8_text);
				
				tr2.appendChild(td0);
				tr2.appendChild(td1);
				tr2.appendChild(td2);
				tr2.appendChild(td3);
				
				tr2.appendChild(td4);
				if(Number(total_discount_in_rs)!=0) {tr2.appendChild(tdDiscount);}
				//tr2.appendChild(td5);
				//tr2.appendChild(td6);
				//tr2.appendChild(td7);
				tr2.appendChild(td8);
				parent.appendChild(tr2);

			
		
	}
});



if(window.location.pathname=="/generate_bill_customer")
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