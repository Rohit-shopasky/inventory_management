
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
  //showToast("You need to login first!",5000);
  window.location.assign("/");
  }


$('#open_modal').leanModal();
$('.edit_link').leanModal();
$('.order').leanModal();
$('.datepicker').datepicker({
	 format: 'yyyy/mm/dd'
});

$('#form_save').click(function(){
	var code       = $('#code_text').val();
	var start_date = $('#start_date').val();
	var end_date   = $('#end_date').val();
	var total_valid_count = $('#total_valid_count').val();
	var remaning_valid_count = $('#remaning_valid_count').val();
	var discount_percentage = $('#discount_percentage').val();
	var description  = $('#description').val();
	
	start_date=moment(start_date).format('YYYY-MM-DD hh:mm:ss');
	end_date  =moment(end_date).format('YYYY-MM-DD hh:mm:ss');
	//alert(code + " " +start_date + " " +end_date + " " +total_valid_count + " " +remaning_valid_count + " " +discount_percentage + " " +description);
	
	if(code!="" && start_date!="" && end_date!="" && total_valid_count!="" && remaning_valid_count!="")
	{
		$.ajax({
			"type":"POST",
			url:"/save_promo_code",
			data:{code:code,start_date:start_date,end_date:end_date,total_valid_count:total_valid_count,remaning_valid_count:remaning_valid_count,discount_percentage:discount_percentage,description:description},
			success:function(data){
				if(data==1)
				{
					location.reload();
				}
			}
		})
	}
	else
	{
		alert("Fields mark * are required!");
	}
	
});


$('#save_edits').click(function(){
	var code       = $('#e_code_text').val();
	var start_date = $('#e_start_date').val();
	var end_date   = $('#e_end_date').val();
	var total_valid_count = $('#e_total_valid_count').val();
	var remaning_valid_count = $('#e_remaning_valid_count').val();
	var discount_percentage = $('#e_discount_percentage').val();
	var description  = $('#e_description').val();
	var promo_code_id=document.getElementById('edit_promocode_id').innerHTML;
	start_date=new Date(start_date);
	end_date  =new Date(end_date);
	//alert(code + " " +start_date + " " +end_date + " " +total_valid_count + " " +remaning_valid_count + " " +discount_percentage + " " +description);
	
	if(code!="" && start_date!="" && end_date!="" && total_valid_count!="" && remaning_valid_count!="")
	{
		$.ajax({
			"type":"POST",
			url:"/edit_promo_code",
			data:{code:code,start_date:start_date,end_date:end_date,total_valid_count:total_valid_count,remaning_valid_count:remaning_valid_count,discount_percentage:discount_percentage,description:description,promo_code_id:promo_code_id},
			success:function(data){
				if(data==1)
				{
					location.reload();
				}
			}
		})
	}
	else
	{
		alert("Fields mark * are required!");
	}
	
})

$('#delete_row').click(function(){
	
	var id=document.getElementById('edit_promocode_id').innerHTML;
	$.ajax({
		type:"GET",
		url:"/delete_code",
		data:{id:id},
		success:function(data){
			location.reload();
		}
	})
})

});

function promo_details(promo_code_id)
{
	//alert(promo_code_id);
	$.ajax({
		type:"GET",
		url:"/get_promo_code",
		data:{promo_code_id:promo_code_id},
		success:function(data){
		
			
			document.getElementById('e_code_text').value=data[0].code;     $('#e_code_text').focus();
			   var date_string=data[0].start_date;
				date_string=new Date(date_string);
				date_string=date_string.toLocaleString();
				date_string=date_string.split(' ').slice(0, 4).join(' ');
			   document.getElementById('e_start_date').value=date_string;   

               var date_string=data[0].end_date;
				date_string=new Date(date_string);
				date_string=date_string.toLocaleString();
				date_string=date_string.split(' ').slice(0, 4).join(' ');			   
			   document.getElementById('e_end_date').value=date_string; 
			   
          document.getElementById('e_total_valid_count').value=data[0].total_valid_count;  $('#e_total_valid_count').focus();
				 
				document.getElementById('e_remaning_valid_count').value=data[0].remaning_valid_count;
				$('#e_remaning_valid_count').focus();
				
				document.getElementById('e_discount_percentage').value=data[0].discount_percentage;
				$('#e_discount_percentage').focus();
				
				document.getElementById('e_description').value=data[0].description;
				$('#e_description').focus();
				
				document.getElementById('edit_promocode_id').innerHTML=promo_code_id;
		}
	})
}

function show_orders(promo_id)
{
	$.ajax({
		type:"GET",
		url:"/order_related_to_promo",
		data:{promo_id:promo_id},
		success:function(data){
		
			var parent=document.getElementById('parent');
			var myNode = document.getElementById("parent");
             while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
             }
			for(var i=0;i<data.length;i++)
			{
				var order_id   = data[i].order_id;
				var customer_name= data[i].customer_name;
				var deducted     = data[i].total_discount_in_rs;
				
				var tr=document.createElement("tr");
				var td1 =document.createElement("td");
				td1_text=document.createTextNode(order_id);
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode(customer_name);
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3_text=document.createTextNode(deducted);
				td3.appendChild(td3_text);
				
				
				
				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				
				parent.appendChild(tr);
			}			
		}
	})
	
	
	
	$.ajax({
		type:"GET",
		url:"/get_promo_desc",
		data:{promo_id:promo_id},
		success:function(data){
			document.getElementById('promo_text').innerHTML="Promo Description: " +data[0].description;
		}
	})
	
}




