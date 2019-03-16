
$(document).ready(function(){

$('#open_modal').leanModal();
$('select').material_select();


$('#form_save').click(function(){
	
	var track_url   =$('#track_url').val();
	var company_name=$('#company_name').val();
	
	if(company_name!="" && track_url!="")
	{
		//alert(company_name +  " " +company_url);
		$.ajax({
			type:"POST",
			url:"/save_new_company",
			data:{company_name:company_name,track_url:track_url},
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
		alert("Both fields are required!");
	}
})

})
