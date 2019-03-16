
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
}


$('#open_modal').leanModal();
$('.edit_link').leanModal();
//$('.show_products').leanModal();

$('#form_save').click(function(){
	var category_name= $('#category_name').val();
	
	var data={category_name:category_name,};
	
	if(category_name!="")
	{
		$.ajax({
		type:"POST",
		url:"/add_category",
		data:data,
		success:function(data){
			if(data==1)
			{
				//alert("Category saved successfully!");
				window.location.assign("/category");
			}
		}
	   });
	}
	else
	{
		showToast("Category Name, is required field. Cannot add category! ",5000);
		//$('#modal1').modal('open');
	}
	
	
});


$('#save_edits').click(function(){
	var category_id            = document.getElementById('edit_product_id').innerHTML;
	var category_name          = $('#e_category_name').val();

	//alert(product_name + " " +selling_quantity_gms + " " +price + " " +ingredients + " " +instructions + " " +product_id );
	
	var update_data={category_name:category_name,category_id:category_id};
	
	$.ajax({
		type:"POST",
		url:"/save_category_edits",
		data:update_data,
		success:function(data){
			if(data==1)
			{
				//alert("Edited successfully!");
				window.location.assign("/category");
			}
		}
	});
	
});

$('#delete_row').click(function(){
	var product_id=document.getElementById('edit_product_id').innerHTML;
	$.ajax({
		type:"POST",
		url:"/delete_product",
		data:{product_id:product_id},
		success:function(data){
			if(data==1)
			{
				//alert("Product deleted successfully!");
				window.location.assign("/home");
			}
		}
	})
})


});

function show_products(val)
{
	var category_id=val;
	
	window.location.assign("/get_products_of_specific_category?category_id=" +val);
	/*$.ajax({
		type:"GET",
		url:"/get_products_of_specific_category",
		data:{category_id:category_id},
		success:function(data){
			
			var parent=document.getElementById('parent_table');
			for(var i=0;i<data.length;i++)
			{
				var product_name   = data[i].name;
				var category_name  = data[i].category_name;
				var price          = data[i].price;
				var selling_quantity_gms=data[i].selling_quantity_gms;
				var sku_id        = data[i].sku_id;
				
				var tr=document.createElement("tr");
				
				var td1 =document.createElement("td");
				td1_text=document.createTextNode(product_name);
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode(category_name);
				td2.appendChild(td2_text);
				
				var td3 =document.createElement("td");
				td3_text=document.createTextNode(price);
				td3.appendChild(td3_text);
				
				var td4 =document.createElement("td");
				td4_text=document.createTextNode(selling_quantity_gms);
				td4.appendChild(td4_text);
				
				var td5 =document.createElement("td");
				td5_text=document.createTextNode(sku_id);
				td5.appendChild(td5_text);
				
				tr.appendChild(td1);
				tr.appendChild(td2);
				tr.appendChild(td3);
				tr.appendChild(td4);
				tr.appendChild(td5);
				parent.appendChild(tr);
			}
		}
	}); */
}


function edit_row(val)
{
   $.ajax({
	   type:"GET",
	   url:"/get_category_for_edit",
	   data:{category_id:val},
	   success:function(data){
		document.getElementById('e_category_name').value=data[0].category_name;                   $( "#e_category_name" ).focus();
		document.getElementById('edit_product_id').innerHTML=val;              
	   }
   });
	
     
} 
