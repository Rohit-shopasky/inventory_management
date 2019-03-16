


var modified_quantity=new Array();
var modified_combo_quantity=new Array();
var total_amount=0;
var promo_code_id=0;
var discount_percentage=0;
$(document).ready(function(){

$('#complete_order').click(function(){

var order_no = document.getElementById('order_no').innerHTML;

	  $.ajax({
		  type:"POST",
		  url:"/submit_return",
		  data:{modified_quantity:modified_quantity,modified_combo_quantity:modified_combo_quantity,order_id:order_no},
		  success:function(data){
			  if(data==1)
			  {
				  alert("Data saved");
				  window.location.assign("/outlet");
			  }
		  }
	  })
})

});

function add_product(product_id,val,reason)
{
	var found_or_not=-1;
	for(var i=0;i<modified_quantity.length;i++)
	{
		if(modified_quantity[i].product_id==product_id)
		{
			found_or_not=i;
		} 
	}
	
	if(found_or_not!=-1)
	{
		//alert("Found");
		modified_quantity[found_or_not].product_id=product_id;
        if(reason==="Broken")
	    modified_quantity[found_or_not].broken=val;
	    if(reason==="Expired")
		modified_quantity[found_or_not].expired=val;
        if(reason==="Defected")	
	    modified_quantity[found_or_not].defected=val;
	    if(reason==="Rejected")
	    modified_quantity[found_or_not].rejected=val;
	}
	else
	{
		 let {broken=0,expired=0,defected=0,rejected=0}=0
		if(reason==="Broken")
	     broken=val
	    if(reason==="Expired")
		 expired=val;
        if(reason==="Defected")	
	     defected=val;
	    if(reason==="Rejected")
	      rejected=val;
		
		modified_quantity.push({"product_id":product_id,broken:broken,expired:expired,defected:defected,rejected:rejected});
		
	}
	
   console.log(modified_quantity);
}

function add_combo(combo_id,val,reason)
{
	var found_or_not=-1;
	for(var i=0;i<modified_combo_quantity.length;i++)
	{
		if(modified_combo_quantity[i].combo_id==combo_id)
		{
			found_or_not=i;
		} 
	}
	
	if(found_or_not!=-1)
	{
		//alert("Found");
		modified_combo_quantity[found_or_not].combo_id=combo_id;
        if(reason==="Broken")
	    modified_combo_quantity[found_or_not].broken=val;
	    if(reason==="Expired")
		modified_combo_quantity[found_or_not].expired=val;
        if(reason==="Defected")	
	    modified_combo_quantity[found_or_not].defected=val;
	    if(reason==="Rejected")
	    modified_combo_quantity[found_or_not].rejected=val;
	}
	else
	{
		 let {broken=0,expired=0,defected=0,rejected=0}=0
		if(reason==="Broken")
	     broken=val
	    if(reason==="Expired")
		 expired=val;
        if(reason==="Defected")	
	     defected=val;
	    if(reason==="Rejected")
	      rejected=val;
		
		modified_combo_quantity.push({"combo_id":combo_id,broken:broken,expired:expired,defected:defected,rejected:rejected});
		
	}
	
   console.log(modified_combo_quantity);
}







