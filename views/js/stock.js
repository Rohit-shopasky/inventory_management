
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

var product_id=getUrlParameter("product_id");
	  
user_id=getCook("user_id");

if(user_id=="" || user_id===undefined)
{
  showToast("You need to login first!",5000);
}


$('#open_modal').leanModal();
$('.edit_link').leanModal();
$('.datepicker').datepicker({
	 format: 'yyyy/mm/dd'
});

$('#form_save').click(function(){
	var jars           = $('#jars').val();
	var quantity_gms   = "0";
	var manufacture_date=$('#manufacture_date').val();
	
	manufacture_date = new Date(manufacture_date).toUTCString();
	
	var data={jars:jars,quantity_gms:quantity_gms,product_id:product_id,manufacture_date:manufacture_date};
	//alert(product_name + " " +selling_quantity_gms + " " +price + " " +ingredients + " " +instructions + " " +quantity_gms + " " +jars);
	if(jars!="")
	{
		$.ajax({
		type:"POST",
		url:"/add_stock",
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
		showToast("Quantity and jars are required fields!",5000);
		//$('#modal1').modal('open');
	}
	
	
});




$('#save_edits').click(function(){

	//alert(product_name + " " +selling_quantity_gms + " " +price + " " +ingredients + " " +instructions + " " +product_id );
	var jars = $('#e_jars').val();
	var manufacture_date = $('#e_manufacture_date').val();
	
	manufacture_date = new Date(manufacture_date).toUTCString();
	
	var stock_id = document.getElementById('stock_id').innerHTML;
	$.ajax({
		type:"POST",
		url:"/save_stock_edits",
		data:{jars:jars,product_id:product_id,stock_id:stock_id,manufacture_date:manufacture_date},
		success:function(data){
			if(data==1)
			{
				//alert("Edited successfully!");
				location.reload();
			}
		}
	});
	
});




});

function edit_row(val)
{
  
 
   $.ajax({
	   type:"GET",
	   url:"/get_stock_for_edit",
	   data:{stock_id:val},
	   success:function(data){
		       document.getElementById('e_jars').value=data[0].jars;      $('#e_jars').focus();
			   document.getElementById('e_manufacture_date').value=data[0].manufacture_date; //$('#e_manufacture_date').focus();
			   document.getElementById('stock_id').innerHTML=val;
	   }
   });
	
     
}
