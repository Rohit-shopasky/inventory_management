
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

$('#form_save').click(function(){
	var product_name          = $('#product_name').val();
	var selling_quantity_gms  = $('#selling_quantity_gms').val();
	var price                 = $('#price').val();
	var ingredients           = $('#ingredients').val();
	var instructions          = $('#instructions').val();
	var category              = $('#category').val();
	var sku_id                = $('#sku_id').val();
	var data={product_name:product_name,selling_quantity_gms:selling_quantity_gms,price:price,ingredients:ingredients,instructions:instructions,category:category,sku_id:sku_id};
	//alert(product_name + " " +selling_quantity_gms + " " +price + " " +ingredients + " " +instructions + " " +quantity_gms + " " +jars);
	if(product_name!="" && category!="" && sku_id!="")
	{
		$.ajax({
		type:"POST",
		url:"/add_product",
		data:data,
		success:function(data){
			if(data==1)
			{
				//alert("Product saved successfully!");
				location.reload();
			}
		}
	   });
	}
	else
	{
		showToast("Product Name, SKU_id and category are required fields!",5000);
		//$('#modal1').modal('open');
	}
	
	
});




$('#save_edits').click(function(){
	var product_id            = document.getElementById('edit_product_id').innerHTML;
	var product_name          = $('#e_product_name').val();
	var selling_quantity_gms  = $('#e_selling_quantity_gms').val();
	var price                 = $('#e_price').val();
	var ingredients           = $('#e_ingredients').val();
	var instructions          = $('#e_instructions').val();
	var quantity_gms          = $('#e_quantity_gms').val();
	var jars                  = $('#e_jars').val();
	var sku_id                = $('#e_sku_id').val();
	//alert(product_name + " " +selling_quantity_gms + " " +price + " " +ingredients + " " +instructions + " " +product_id );
	
	var update_data={product_name:product_name,selling_quantity_gms:selling_quantity_gms,price:price,ingredients:ingredients,instructions:instructions,product_id:product_id,quantity_gms:quantity_gms,jars:jars,sku_id:sku_id};
	
	$.ajax({
		type:"POST",
		url:"/save_product_edits",
		data:update_data,
		success:function(data){
			if(data==1)
			{
				//alert("Edited successfully!");
				location.reload();
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

function edit_row(val)
{
  
  
   $.ajax({
	   type:"GET",
	   url:"/get_row_data_for_edit",
	   data:{product_id:val},
	   success:function(data){
		document.getElementById('e_product_name').value=data[0].name;                         $( "#e_product_name" ).focus();
        document.getElementById('e_selling_quantity_gms').value=data[0].selling_quantity_gms; $("#e_selling_quantity_gms").focus();
	    document.getElementById('e_price').value=data[0].price;                               $( "#e_price" ).focus();
	    document.getElementById('e_ingredients').value=data[0].ingredients;                   $( "#e_ingredients" ).focus();
	    document.getElementById('e_instructions').value=data[0].instructions;                 $( "#e_instructions" ).focus();
		document.getElementById('e_quantity_gms').value=data[0].quantity_gms;                 $( "#e_quantity_gms" ).focus();
		document.getElementById('e_jars').value=data[0].jars;                                 $( "#e_jars" ).focus();
		document.getElementById('e_sku_id').value=data[0].sku_id;                             $( "#e_sku_id" ).focus();
		document.getElementById('edit_product_id').innerHTML=val;                 ;
	   }
   });
	
     
}
