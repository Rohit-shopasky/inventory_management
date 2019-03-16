
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

$('#open_modal').leanModal();
$('.edit_link').leanModal();
$('.data').leanModal();
$('select').material_select();

$('#form_save').click(function(){

	var combo_name  =$('#combo_name').val();
	
	var price       =$('#price').val();
	var temp_products    =$('#products').val();
	temp_products   =temp_products.toString();
	var products    =new Array();
	products=temp_products.split(",");
	var unit_price  =$('#unit_price').val();
	var tax         =$('#tax').val();
	
	

	$.ajax({
		type:"POST",
		url:"/add_combo_product",
		data:{combo_name:combo_name,price:price,product_ids:products,unit_price:unit_price,tax:tax},
		success:function(data){
			location.reload();
		}
	}) 
	
})


  $('#save_edits').click(function(){
	  var combo_name = $('#e_combo_name').val();
	  var sku_id     = $('#e_sku_id').val();
	  var unit_price = $('#e_unit_price').val();
	  var tax        = $('#e_tax').val();
	  var price      = $('#e_price').val();
	  var combo_id   = document.getElementById('edit_combo_id').innerHTML;
	  
	  $.ajax({
		  type:"POST",
		  url:"/edit_combo",
		  data:{combo_name:combo_name,sku_id:sku_id,unit_price:unit_price,tax:tax,price:price,combo_id:combo_id},
		  success:function(data){
			  if(data)
			  {
				  location.reload();
			  }
		  }
	  })
	  
  });
  
  $('#disable_combo').click(function(){
	  
	var combo_id = document.getElementById('edit_combo_id').innerHTML;
	$.ajax({
		type:"POST",
		url:"/disable_combo",
		data:{combo_id:combo_id},
		success:function(data){
			location.reload();
		}
	})
  })

})

function combo_details(combo_id)
{
	$.ajax({
		type:"GET",
		url:"/get_combo",
		data:{combo_id:combo_id},
		success:function(data){
			document.getElementById('e_combo_name').value= data[0].combo_name;    $('#e_combo_name').focus();                                
			document.getElementById('e_sku_id').value=data[0].sku_id;             $('#e_sku_id').focus();
			document.getElementById('e_price').value=data[0].price;               $('#e_price').focus();
			document.getElementById('e_tax').value=data[0].tax;                   $('#e_tax').focus();
			document.getElementById('e_unit_price').value=data[0].unit_price;     $('#e_unit_price').focus();
			document.getElementById('edit_combo_id').innerHTML=combo_id;
		}
	})
}

function show_products(combo_id,combo_name,combo_price)
{
	//alert(combo_id);
	//alert(combo_id + " " +combo_name + " " +combo_price);
	document.getElementById('text').innerHTML="Combo Name: " +combo_name + "; MRP: " +combo_price;
	$.ajax({
		type:"GET",
		url:"/get_products_in_combo",
		data:{combo_id:combo_id},
		success:function(data){
			$('#products_table').empty();
			var parent = document.getElementById('products_table');
			 for(var i=0;i<data.length;i++)
			{
				var product_name   = data[i].name;
				var mrp            = data[i].price;
				
				var tr=document.createElement("tr");
				var td1 =document.createElement("td");
				td1_text=document.createTextNode(product_name);
				td1.appendChild(td1_text);
				
				var td2 =document.createElement("td");
				td2_text=document.createTextNode(mrp);
				td2.appendChild(td2_text);
				

				tr.appendChild(td1);
				tr.appendChild(td2);
			
				
				parent.appendChild(tr);
			}
		}
	})
}

