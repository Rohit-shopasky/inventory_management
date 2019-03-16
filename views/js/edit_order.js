var modified_quantity=new Array();
var modified_combo_quantity=new Array();
var total_amount=0;
var promo_code_id=0;
var discount_percentage=0;


function  get_parameter(key) {  
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
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
	



$(document).ready(function(){
	$('select').formSelect();
	var user_id=getCook("user_id");
$.ajax({
	
	type:"GET",
	url:"/get_user_info",
	success:function(result){
		var data={};
		result.forEach(function(element){
			var user_name=element.customer_name;
			data[user_name]=null;
		});
		$('#user_name').autocomplete({
      data:data, 
	
    });	
		
	}
})
	
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
   window.location.assign("/");
  
}


//$('#open_modal').leanModal();
//$('.edit_link').leanModal();


   $('#user_name').change(function(){
	
	  var user_name=$('#user_name').val();
      $.ajax({
		  type:"GET",
		  url:"/get_customer_info_to_fill",
		  data:{user_name:user_name},
		  success:function(data){
			  if(data.length!=0)
			  {
				  document.getElementById('user_address').value=data[0].customer_address;  $('#user_address').focus();
				  document.getElementById('user_phone').value=data[0].phone;      $('#user_phone').focus();
				  document.getElementById('user_pincode').value=data[0].pincode ;   $('#user_pincode').focus();
				  document.getElementById('states').value=data[0].customer_state ; 
				  document.getElementById('cities').value=data[0].cities;
				  
			  }
		  }
	  });	  
   })
   var total_discount=0;
   
   $('#promo_code').on("change",function(){
	   var promo_code=$('#promo_code').val();
	   
	   $.ajax({
		   type:"GET",
		   url:"/check_promo_code",
		   data:{promo_code:promo_code},
		   success:function(data){
			   if(data.status==1)
			   {    promo_code_id=data.promo_code_id;
				   var discount=data.discount;
				   var without_discount_amount=total_amount;
				   discount=Number(discount) / 100;
				   total_amount=Number(total_amount) - Number(discount) * Number(total_amount);
				   
				   total_discount=Number(without_discount_amount) - Number(total_amount);
				   
				   document.getElementById('total_amount').innerHTML="";
				   document.getElementById('total_amount').innerHTML="Total amount: Rs" +total_amount.toPrecision(3) + "/-";
				   discount_percentage=data.discount
			   }
			   else
			   {
				   alert("Code expired! or there are no remaning cards!");
				   discount_percentage=0;
				   document.getElementById('promo_code').value="";
			   }
		   }
	   })
   })
   
   // ppulate discount percentage
   var order_id=get_parameter("order_id");
   $.ajax({
	   type:"GET",
	   url:"/get_total_discount_in_rs",
	   data:{order_id:order_id},
	   success:function(data){
		   if(data.length==0)
		   {
			   discount_percentage=0
		   }
		   else
		   {
			   discount_percentage=data[0].discount_percentage;
		   }
		   
		   
	   }
   })
   
   
   $('#cancel_promo').click(function(){
	 // document.getElementById('promo_code').value="";
	  total_amount=Number(total_amount) +Number(total_discount);
	  document.getElementById('total_amount').innerHTML="";
	  document.getElementById('total_amount').innerHTML="Total amount: Rs" +total_amount.toPrecision(3) + "/-";
	 total_discount=0;
	  var promo_code_id = $('#promo_code').val();
	  
	  document.getElementById('promo_code').value="";
	  discount_percentage=0;
   })
   
   
   
   
   $('#complete_order').click(function(){
	   
	   var user_name    = $('#user_name').val();
	   var user_address = $('#user_address').val();
	   var user_pincode = $('#user_pincode').val();
	   var user_state   = $('#states').val();
       var user_city    = $('#cities').val();       
	   var user_phone   = $('#user_phone').val();
	   var payment_type = "";
	   var order_source = $('#order_source').val();
	   var user_note    = $('#user_note').val();
	   var user_email   = $('#user_email').val();
	   var shipping_cost= $('#shipping_cost').val();
	   var promo_code_id= $('#promo_code').val();
	  
	   if(shipping_cost==0 || shipping_cost=="") {shipping_cost=0;}
	   //alert(user_name + " " +user_address + " " +user_phone + " " +modified_quantity.toString());
      
	   if( (modified_quantity.length!=0 || modified_combo_quantity.length!=0) && user_address!="" && user_phone!=""  && user_pincode!="" && user_state!="" && user_city)
	   {
		   if(payment_type=="Sample"){for(var i=0;i<modified_quantity.length;i++){modified_quantity[i].amount=0;}}
		   if(payment_type=="Gift"){for(var i=0;i<modified_quantity.length;i++){modified_quantity[i].amount=0;}}
	        $.ajax({
		   type:"POST",
		   url:"/save_edited_order",
		   data:{user_name:user_name,user_address:user_address,user_phone:user_phone,modified_quantity:modified_quantity,payment_type:payment_type,order_source:order_source,user_note:user_note,user_pincode:user_pincode,user_state:user_state,user_city:user_city,user_email:user_email,total_discount:0,promo_code_id:promo_code_id,order_id:order_id,modified_combo_quantity:modified_combo_quantity,shipping_cost:shipping_cost,user_id:user_id,discount_percentage:discount_percentage},
		   success:function(data){
			   if(data==1)
			   {
				   alert("Order placed sucessfully!");
				   window.location.assign("/show_all_orders");
			   }
			   else
			   {
				   alert("Some of your product have stock 0.");
			   }
		   }
	       })
	   }
	   else
	   {
		   alert("Fields marked * are mandatory!");
	   } 
   })

   
var states = ["Select State*","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Dadra and Nagar Haveli","Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
                                        "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Orissa","Puducherry","Punjab", "Rajasthan","Sikkim","Tamil Nadu",
                                        "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];
var op="";
for(var i=0;i<states.length;i++)
{
	
	$('<option>').val(states[i].toUpperCase()).text(states[i].toUpperCase()).appendTo('#states');
}

$('#states').change(function(){
	var myNode = document.getElementById("cities");
    while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
    }
	var state_value=this.value;
	//alert(state_value);.
	
	if(state_value=="Andhra Pradesh")
	{
		var cities = ["Anantapur","Chittoor","East Godavari","Guntur","Krishna","Kurnool","Prakasam","Srikakulam","SriPotti Sri Ramulu Nellore","Vishakhapatnam","Vizianagaram","West Godavari","Cudappah"];
		
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
		
	}
	else if(state_value=="Arunachal Pradesh")
	{
		var cities = ["Anjaw","Changlang","Dibang Valley","East Siang","East Kameng","Kurung Kumey","Lohit","Longding","Lower Dibang Valley","Lower Subansiri","Papum Pare","Tawang","Tirap","Upper Siang","Upper Subansiri","West Kameng","West Siang"];
		
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Assam")
	{
		 var cities = ["Baksa","Barpeta","Bongaigaon","Cachar","Chirang","Darrang","Dhemaji","Dima Hasao","Dhubri","Dibrugarh","Goalpara","Golaghat","Hailakandi","Jorhat",
                                     "Kamrup","Kamrup Metropolitan","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Morigaon","Nagaon","Nalbari","Sivasagar","Sonitpur","Tinsukia","Udalguri"];
									 
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}							 
	}
	else if(state_value=="Bihar")
	{
		var cities =["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur",
                                        "Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa",
                                        "Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Chhattisgarh")
	{
		 var cities = ["Bastar","Bijapur","Bilaspur","Dantewada","Dhamtari","Durg","Jashpur","Janjgir-Champa","Korba","Koriya","Kanker","Kabirdham (formerly Kawardha)","Mahasamund",
                                            "Narayanpur","Raigarh","Rajnandgaon","Raipur","Surajpur","Surguja"];
											
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}									
	}
	
	else if(state_value=="Dadra and Nagar Haveli")
	{
		var cities = ["Amal","Silvassa"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}	
	}
	else if(state_value=="Daman and Diu")
	{
		var cities=["Daman","Diu"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Delhi")
	{
		var cities=["Delhi","New Delhi","North Delhi","Noida","Patparganj","Sonabarsa","Tughlakabad"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Goa")
	{
		var cities=["Chapora","Dabolim","Madgaon","Marmugao (Marmagao)","Panaji Port","Panjim","Pellet Plant Jetty/Shiroda","Talpona","Vasco da Gama"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Gujarat")
	{
		var cities=["Ahmedabad","Amreli district","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Dahod","Dang","Gandhinagar","Jamnagar","Junagadh",
                                        "Kutch","Kheda","Mehsana","Narmada","Navsari","Patan","Panchmahal","Porbandar","Rajkot","Sabarkantha","Surendranagar","Surat","Tapi","Vadodara","Valsad"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Haryana")
	{
		var cities=["Ambala","Bhiwani","Faridabad","Fatehabad","Gurgaon","Hissar","Jhajjar","Jind","Karnal","Kaithal",
                                            "Kurukshetra","Mahendragarh","Mewat","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamuna Nagar"];
											
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Himachal Pradesh")
	{
		var cities=["Baddi","Baitalpur","Chamba","Dharamsala","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul & Spiti","Mandi","Simla","Sirmaur","Solan","Una"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}	
	}
	else if(state_value=="Jammu and Kashmir")
	{
		var cities=["Jammu","Leh","Rajouri","Srinagar"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}	
	}
	else if(state_value=="Karnataka")
	{
		var cities=["Bagalkot","Bangalore","Bangalore Urban","Belgaum","Bellary","Bidar","Bijapur","Chamarajnagar", "Chikkamagaluru","Chikkaballapur",
                                           "Chitradurga","Davanagere","Dharwad","Dakshina Kannada","Gadag","Gulbarga","Hassan","Haveri district","Kodagu",
                                           "Kolar","Koppal","Mandya","Mysore","Raichur","Shimoga","Tumkur","Udupi","Uttara Kannada","Ramanagara","Yadgir"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}								   
	}
	else if(state_value=="Kerala")
	{
		var cities=["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thrissur","Thiruvananthapuram","Wayanad"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Madhya Pradesh")
	{
		var cities=["Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhilai","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Dewas","Dhar","Guna","Gwalior","Hoshangabad",
                                    "Indore","Itarsi","Jabalpur","Khajuraho","Khandwa","Khargone","Malanpur","Malanpuri (Gwalior)","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Panna","Pithampur","Raipur","Raisen","Ratlam",
                                    "Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Singrauli","Ujjain"];
	  for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Maharashtra")
	{
		var cities=["Ahmednagar","Akola","Alibag","Amaravati","Arnala","Aurangabad","Aurangabad","Bandra","Bassain","Belapur","Bhiwandi","Bhusaval","Borliai-Mandla","Chandrapur","Dahanu","Daulatabad","Dighi (Pune)","Dombivali","Goa","Jaitapur","Jalgaon",
                                             "Jawaharlal Nehru (Nhava Sheva)","Kalyan","Karanja","Kelwa","Khopoli","Kolhapur","Lonavale","Malegaon","Malwan","Manori",
                                             "Mira Bhayandar","Miraj","Mumbai (ex Bombay)","Murad","Nagapur","Nagpur","Nalasopara","Nanded","Nandgaon","Nasik","Navi Mumbai","Nhave","Osmanabad","Palghar",
                                             "Panvel","Pimpri","Pune","Ratnagiri","Sholapur","Shrirampur","Shriwardhan","Tarapur","Thana","Thane","Trombay","Varsova","Vengurla","Virar","Wada"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Manipur")
	{
		var cities=["Bishnupur","Churachandpur","Chandel","Imphal East","Senapati","Tamenglong","Thoubal","Ukhrul","Imphal West"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Meghalaya")
	{
		var cities=["Baghamara","Balet","Barsora","Bolanganj","Dalu","Dawki","Ghasuapara","Mahendraganj","Moreh","Ryngku","Shella Bazar","Shillong"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Mizoram")
	{
		var cities=["Aizawl","Champhai","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Serchhip"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Nagaland")
	{
		var cities=["Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Peren","Phek","Tuensang","Wokha","Zunheboto"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Orissa")
	{
		var cities=["Bahabal Pur","Bhubaneswar","Chandbali","Gopalpur","Jeypore","Paradip Garh","Puri","Rourkela"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Puducherry")
	{
		var cities=["Karaikal","Mahe","Pondicherry","Yanam"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Punjab")
	{
		var cities=["Amritsar","Barnala","Bathinda","Firozpur","Faridkot","Fatehgarh Sahib","Fazilka","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Mansa","Moga","Sri Muktsar Sahib","Pathankot",
                                        "Patiala","Rupnagar","Ajitgarh (Mohali)","Sangrur","Shahid Bhagat Singh Nagar","Tarn Taran"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Rajasthan")
	{
		var cities=["Ajmer","Banswara","Barmer","Barmer Rail Station","Basni","Beawar","Bharatpur","Bhilwara","Bhiwadi","Bikaner","Bongaigaon","Boranada, Jodhpur","Chittaurgarh","Fazilka","Ganganagar","Jaipur","Jaipur-Kanakpura",
                                       "Jaipur-Sitapura","Jaisalmer","Jodhpur","Jodhpur-Bhagat Ki Kothi","Jodhpur-Thar","Kardhan","Kota","Munabao Rail Station","Nagaur","Rajsamand","Sawaimadhopur","Shahdol","Shimoga","Tonk","Udaipur"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Sikkim")
	{
		var cities=["Chamurci","Gangtok"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
		
	}
	else if(state_value=="Tamil Nadu")
	{
		var cities=["Ariyalur","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kanchipuram","Kanyakumari","Karur","Krishnagiri","Madurai","Mandapam","Nagapattinam","Nilgiris","Namakkal","Perambalur","Pudukkottai","Ramanathapuram","Salem","Sivaganga","Thanjavur","Thiruvallur","Tirupur",
                                   "Tiruchirapalli","Theni","Tirunelveli","Thanjavur","Thoothukudi","Tiruvallur","Tiruvannamalai","Vellore","Villupuram","Viruthunagar"];
	   for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Telangana")
	{
		var cities=["Adilabad","Hyderabad","Karimnagar","Mahbubnagar","Medak","Nalgonda","Nizamabad","Ranga Reddy","Warangal"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Tripura")
	{
		var cities=["Agartala","Dhalaighat","Kailashahar","Kamalpur","Kanchanpur","Kel Sahar Subdivision","Khowai","Khowaighat","Mahurighat","Old Raghna Bazar","Sabroom","Srimantapur"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Uttar Pradesh")
	{
		var cities=["Agra","Allahabad","Auraiya","Banbasa","Bareilly","Berhni","Bhadohi","Dadri","Dharchula","Gandhar","Gauriphanta","Ghaziabad","Gorakhpur","Gunji",
                                    "Jarwa","Jhulaghat (Pithoragarh)","Kanpur","Katarniyaghat","Khunwa","Loni","Lucknow","Meerut","Moradabad","Muzaffarnagar","Nepalgunj Road","Pakwara (Moradabad)",
                                    "Pantnagar","Saharanpur","Sonauli","Surajpur","Tikonia","Varanasi"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="Uttarakhand")
	{
		var cities=["Almora","Badrinath","Bangla","Barkot","Bazpur","Chamoli","Chopra","Dehra Dun","Dwarahat","Garhwal","Haldwani","Hardwar","Haridwar","Jamal","Jwalapur","Kalsi","Kashipur","Mall",
                                           "Mussoorie","Nahar","Naini","Pantnagar","Pauri","Pithoragarh","Rameshwar","Rishikesh","Rohni","Roorkee","Sama","Saur"];
	   for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	else if(state_value=="West Bengal")
	{
		var cities=["Alipurduar","Bankura","Bardhaman","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah",
                                    "Jalpaiguri","Kolkata","Maldah","Murshidabad","Nadia","North 24 Parganas","Paschim Medinipur","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"];
		 for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#cities');
		}
	}
	
})


 
 var order_id=get_parameter("order_id");
 //alert(order_id);

 $.ajax({
	 type:"GET",
	 url:"/already_ordered_q",
	 data:{order_id:order_id},
	 success:function(data){
		 console.log(data);
		 for(var i=0;i<data.length;i++)
		 {
			var id="jars" +data[i].product_id;
			document.getElementById(id).value=data[i].jars;

              var stock=document.getElementById(data[i].product_id).innerHTML;		  
			  
			  stock=stock.toLowerCase();
			  var on_order=0;
			  if(stock==="on order")
		      {
				  
				  on_order=1;
			  }
			 
             modified_quantity.push({"product_id":data[i].product_id,"jars":"-1","quantity_ordered":data[i].jars,"amount":data[i].amount,stock:stock,on_order:on_order});		  
			 var amount=data[i].amount;
            total_amount=Number(total_amount) + Number(amount);			 
		 }
		 
		document.getElementById('total_amount').innerHTML="Total amount: Rs" +total_amount + "/-";
		 
		 console.log(modified_quantity);
		 
	 }
 })
 
$.ajax({
	type:"GET",
	url:"/already_ordered_combo_quantity",
	data:{order_id:order_id},
	success:function(data){
		   
		for(var i=0;i<data.length;i++)
		{
			var id="combo" +data[i].combo_id;
			document.getElementById(id).value=data[i].quantity_ordered;
			modified_combo_quantity.push({"combo_id":data[i].combo_id,"quantity_ordered":data[i].quantity_ordered,"amount":data[i].amount});
			total_amount=Number(total_amount) + Number(data[i].amount);	
		}
		document.getElementById('total_amount').innerHTML="Total amount: Rs" +total_amount + "/-";
		console.log(modified_combo_quantity);
	}
})
 
            var city=document.getElementById('city').innerHTML;
			var state=document.getElementById('state').innerHTML;
			
			var promo_code=document.getElementById('promo_code_value').innerHTML;
			document.getElementById('states').value=state;
            $('<option>').val(city).text(city).appendTo('#cities');
			$('<option>').val(state).text(state).appendTo('#states');
			$('select[name="states"]').first().val(state);
			document.getElementById('cities').value=city;
			
			if(promo_code==0)
			{
				document.getElementById('promo_code').value="";
			}
			else
			{
				document.getElementById('promo_code').value=promo_code
			}
			
			

});



function order_quantity(val,product_id,original_quantity,price,all_jars,stock,on_order)
{  
	//alert(val + " " +product_id + " " +original_quantity + " " +price);
	
	
	// alert(val + " " +all_jars);
	var oq=Number(val) - Number(original_quantity);
	var updated_no_of_jars=Number(all_jars) - Number(oq);
	
	 
	var amount=price*val;
	var quantity_ordered=val;
	val=original_quantity-val;
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
		modified_quantity[found_or_not].jars=val;
        modified_quantity[found_or_not].quantity_ordered=quantity_ordered;
        modified_quantity[found_or_not].amount=amount;	
		modified_quantity[found_or_not].updated_no_of_jars=updated_no_of_jars;
		modified_quantity[found_or_not].stock=stock;
		modified_quantity[found_or_not].on_order=on_order;
	}
	else
	{
		//alert("Not found");
		modified_quantity.push({"product_id":product_id,"jars":val,"quantity_ordered":quantity_ordered,"amount":amount,updated_no_of_jars:updated_no_of_jars,stock:stock,on_order:on_order});
	}
	
	
	/*if(modified_quantity.length==1)
	{
		total_amount=modified_quantity[0].amount;
	}
	else
	{
		total_amount=0;
		for(var i=0;i<modified_quantity.length;i++)
		{
			total_amount=total_amount + modified_quantity[i].amount;
		}
	} */
	
	var a=Number(original_quantity) * Number(price);
	total_amount=Number(total_amount) +  Number(a);
	
	document.getElementById('total_amount').innerHTML="";
	document.getElementById('total_amount').innerHTML="Total amount: Rs" +total_amount + "/-"; 
    /*if($('#payment_type').val()==="Sample")
    {    total_amount=0;
        alert("aya");
		document.getElementById('total_amount').innerHTML="Total amount: Rs" +total_amount + "/-"; 
	 */	
    console.log(modified_quantity);
    
}


function combo_order_quantity(val,combo_id,price,original_quantity)
{
	//alert(val + " " +combo_id + " " +price + " " +original_quantity);
	var oq= Number(val) - Number(original_quantity) ;         // -1 means combo_order_details me +1 karo and products ko -1

	var amount=price*val;
	var quantity_ordered=val;
	val=original_quantity-val;
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
		//modified_quantity[found_or_not].jars=val;
        modified_combo_quantity[found_or_not].quantity_ordered=quantity_ordered;
        modified_combo_quantity[found_or_not].amount=amount;	
		modified_combo_quantity[found_or_not].updated_quantity=oq;
	}
	else
	{
		//alert("Not found");
	
		modified_combo_quantity.push({"combo_id":combo_id,"quantity_ordered":quantity_ordered,"amount":amount});
	}
	
	console.log(modified_combo_quantity);
	
	
}

function get_location_data(pincode)
{
	if(pincode.length==6)
	{
	$.ajax({
		type:"GET",
		url:"/get_location_from_pincode",
		data:{pincode:pincode},
		beforeSend:function(){
			$('.loader_div').show();
		},
		success:function(data){
			//alert(data.city + " " +data.state);
			$('.loader_div').hide();
			$('<option>').val(data.state).text(data.state).appendTo('#states');
			$('<option>').val(data.city).text(data.city).appendTo('#cities');
			document.getElementById('states').value=data.state ; 
		    document.getElementById('cities').value=data.city;
			
		}
	});
	}
}

function change_for_foodcloud(val,order_id)
{
  if(val==="FoodCloud")
  {
	    var d = new Date();
        var n = d.getHours();
	   var phone = order_id + "" +n;
	   document.getElementById('user_phone').value=phone;                           $( "#user_phone" ).focus();
  }	  
}






