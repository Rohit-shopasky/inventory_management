
$(document).ready(function(){

$('#open_modal').leanModal();
$('.edit_link').leanModal();
$('select').material_select();


$('#form_save').click(function(){
	
	var outlet_name = $('#outlet_name').val();
	var outlet_type = $('#outlet_type').val();
    var branch_name = $('#branch_name').val();
	var commision   = $('#commision').val();
	var contact_person = $('#contact_person').val();
	var phone       = $('#phone').val();
	var billing_address     = $('#billing_address').val();
    var shipping_address = $('#shipping_address').val();
	var gst_no     = $('#gst_no').val();
	var state      = $('#states').val();
	var cities     = $('#cities').val();
	var pincode    = $('#pincode').val();
	
	
	
	if(shipping_address=="") {shipping_address = billing_address;}
	
     if(outlet_name !="" && outlet_type!=null && phone!="")
	 {
		 $.ajax({
			 type: "POST",
			 url:"/save_outlet",
			 data:{outlet_name:outlet_name,outlet_type:outlet_type,commision:commision,contact_person:contact_person,phone:phone,billing_address:billing_address,shipping_address:shipping_address,gst_no:gst_no,state:state,city:cities,branch_name:branch_name,pincode:pincode},
			 success:function(data){
				 if(data==1)
				 {
					 window.location.assign("/outlet");
				 }
				 else
				 {
					 alert("Phone number already exsist! Try with new number.");
				 }
			 }
		 })
	 }
	 else
	 {
		 alert("All fields are required!");
	 }
})

$('#print_excel').click(function(){
	var year  = $('#year_filter').val();
	var month= $('#month_filter').val();
	
	window.location.assign("/outlet_excel_export?month=" +month + "&year=" +year);
})


$('#save_edits').click(function(){
	
	var outlet_name = $('#e_outlet_name').val();
	var outlet_type = $('#e_outlet_type').val();
	var branch_name = $('#e_branch_name').val();
	var commision   = $('#e_commision').val();
	var contact_person = $('#e_contact_person').val();
	var phone       = $('#e_phone').val();
	var billing_address= $('#e_billing_address').val();
	var shipping_address = $('#e_shipping_address').val();
	var billing_address = $('#e_billing_address').val();
	var gst_no      = $('#e_gst_no').val();
	var pincode     = $('#e_pincode').val();
	var state       = $('#e_states').val();
	var city        = $('#e_cities').val();
	
	var outlet_id   = document.getElementById('e_outlet_id').innerHTML;
	
	
     if(outlet_name !="" && outlet_type!=null && phone!="")
	 {
		 $.ajax({
			 type: "POST",
			 url:"/save_outlet_edits",
			 data:{outlet_name:outlet_name,outlet_type:outlet_type,commision:commision,contact_person:contact_person,phone:phone,billing_address:billing_address,outlet_id:outlet_id,shipping_address:shipping_address,gst_no:gst_no,branch_name:branch_name,pincode:pincode,state:state,city:city},
			 success:function(data){
				 if(data==1)
				 {
					 window.location.assign("/outlet");
				 }
				 else
				 {
					 alert("Phone number already exsist! Try with new number.");
				 }
			 }
		 })
	 }
	 else
	 {
		 alert("All fields are required!");
	 }
})


   
var states = ["Select State","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Dadra and Nagar Haveli","Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
                                        "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Orissa","Puducherry","Punjab", "Rajasthan","Sikkim","Tamil Nadu",
                                        "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];
var op="";
for(var i=0;i<states.length;i++)
{
	$('<option>').val(states[i]).text(states[i]).appendTo('#states');
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




})


function edit_row(val)
{   
   $.ajax({
	   type:"GET",
	   url:"/get_outlet_details",
	   data:{outlet_id:val},
	   success:function(data){
		 
		document.getElementById('e_outlet_name').value=data[0].outlet_name;                   $( "#e_outlet_name" ).focus(); 
	     $('#e_outlet_type').val("Online");
	    document.getElementById('e_commision').value=data[0].commision;                       $( "#e_commision" ).focus();
	    document.getElementById('e_contact_person').value=data[0].contact_person;             $( "#e_contact_person" ).focus();
		document.getElementById('e_phone').value=data[0].phone;                               $( "#e_phone" ).focus();
		document.getElementById('e_billing_address').value=data[0].billing_address;           $('#e_billing_address').focus();
		document.getElementById('e_shipping_address').value=data[0].shipping_address;         $('#e_shipping_address').focus();
		document.getElementById('e_gst_no').value=data[0].gst_no;                             $('#e_gst_no').focus();
		document.getElementById("e_branch_name").value=data[0].brand_name;                    $('#e_branch_name').focus();
		document.getElementById("e_pincode").value=data[0].pincode;                           $('#e_pincode').focus();
		
		$('<option>').val(data[0].city).text(data[0].city).appendTo('#e_cities');
		document.getElementById("e_cities").value=data[0].city;
		
		$('<option>').val(data[0].state).text(data[0].state).appendTo('#e_states');
		document.getElementById("e_states").value=data[0].state;
		
		document.getElementById('e_outlet_id').innerHTML=val;                 
	   }
   });
    
}

function go_to_orders(outlet_id)
{
	window.location.assign("/show_outlet_order?outlet_id=" + outlet_id);
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
			
			$('<option>').val(data.state).text(data.state).appendTo('#e_states');
			$('<option>').val(data.city).text(data.city).appendTo('#e_cities');
			document.getElementById('e_states').value=data.state ; 
		    document.getElementById('e_cities').value=data.city;
			
		}
	});
	}
}
