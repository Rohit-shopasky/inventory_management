var fpath="";
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
    $('.tabs').tabs();


$('#form_save').click(function(){
	var product_name          = $('#product_name').val();
	var selling_quantity_gms  = $('#selling_quantity_gms').val();
	var price                 = $('#price').val();
	var ingredients           = $('#ingredients').val();
	var instructions          = $('#instructions').val();
	var category              = $('#category').val();
	var unit_price            = $('#unit_price').val();
	var tax                   = $('#tax').val();
	
	var data={product_name:product_name,selling_quantity_gms:selling_quantity_gms,price:price,ingredients:ingredients,instructions:instructions,category:category,unit_price:unit_price,tax:tax,fpath:fpath}
	//alert(product_name + " " +selling_quantity_gms + " " +price + " " +ingredients + " " +instructions + " " +quantity_gms + " " +jars);
	if(product_name!="" && category!=""  && unit_price!="" && tax!="" && price!="" && selling_quantity_gms!="")
	{
		$.ajax({
		type:"POST",
		url:"/add_product",
		data:data,
		success:function(data){
			if(data==1)
			{
				alert("Product saved successfully!");
				window.location.assign("/home");
			}
		}
	   });
	}
	else
	{
		showToast("Product Name, SKU_id,category and Selling quantity are required fields!",5000);
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
	var unit_price            = $('#e_unit_price').val();
    var tax                   = $('#e_tax').val();
	var order_url             = $('#e_order_url').val();
	var hsn                   = $('#e_hsn').val();
    var on_order              = $('#e_on_order').is(":checked");
	
	 //alert(product_name + "  "+ category + " " +sku_id + " " +unit_price + " " +tax + " " +price+ " " +selling_quantity_gms);
	
	if(product_name!="" && category!=""  && unit_price!="" && tax!="" && price!="" && selling_quantity_gms!="")
	{
	var update_data={product_name:product_name,selling_quantity_gms:selling_quantity_gms,price:price,ingredients:ingredients,instructions:instructions,product_id:product_id,unit_price:unit_price,tax:tax,fpath:fpath,order_url:order_url,on_order:on_order,hsn:hsn};
	
	$.ajax({
		type:"POST",
		url:"/save_product_edits",
		data:update_data,
		success:function(data){
			if(data==1)
			{
				//alert("Edited successfully!");
				window.location.assign("/home");
			}
		}
	});
  }
  else
  {
	  alert("Something missing!");
  }
	
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

function show_stock(val)
{
	var product_id=val;
	
	window.location.assign("/get_stock_of_specific_product?product_id=" +val);
	
	
}



function edit_row(val)
{
   $.ajax({
	   type:"GET",
	   url:"/get_row_data_for_edit",
	   data:{product_id:val},
	   success:function(data){
		 console.log(data);
		document.getElementById('e_product_name').value=data[0].name;                         $( "#e_product_name" ).focus(); 
	    document.getElementById('e_price').value=data[0].price;                               $( "#e_price" ).focus();
	    document.getElementById('e_ingredients').value=data[0].ingredients;                   $( "#e_ingredients" ).focus();
	    document.getElementById('e_instructions').value=data[0].instructions;                 $( "#e_instructions" ).focus();
		//document.getElementById('e_sku_id').value=data[0].sku_id;                             $( "#e_sku_id" ).focus();
		document.getElementById('e_unit_price').value=data[0].unit_price;                      $('#e_unit_price').focus();
		document.getElementById('e_tax').value=data[0].tax;                                   $('#e_tax').focus();
		document.getElementById('e_selling_quantity_gms').value=data[0].selling_quantity_gms; $('#e_selling_quantity_gms').focus();  
		document.getElementById('e_order_url').value=data[0].order_url;                       $('#e_order_url').focus();
		fpath=data[0].icon_url;
		
		document.getElementById("e_hsn").value=data[0].hsn;                                   $('#e_hsn').focus();
		
		if(data[0].on_order==1) { $('#e_on_order').prop("checked",true);}
		
		document.getElementById('edit_product_id').innerHTML=val;                 
	   }
   });
	
     
}

function change_visibility(val,product_id)
{
	var id=val;
     var status="";
    if($("#" +id).is(':checked'))
	status=1;
    else
	status=0;

   $.ajax({
	   type:"POST",
	   url:"/change_visibility",
	   data:{status:status,product_id:product_id},
	   success:function(data){
		   
	   }
   })

	
}

function show_file()
{
	var form = document.forms.namedItem("fileinfo");
    oData = new FormData(form);
	var req=new XMLHttpRequest();
	req.onreadystatechange=function(){
		 
		if(req.status==200 && req.readyState==4)
		{  fpath=req.responseText;
	       if(fpath!=-1)
		   {
		    // alert(fpath);
		   }
		   else
		   {
			   //alert("Please select only image files!");
			   fpath="";
			   showToast("Please select only image files!",3000);
		   }
		}
	}
	req.open("POST","/upload_product_pic",true);
	req.send(oData);
}
