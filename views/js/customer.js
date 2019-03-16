

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
	
	var customer_name      = $('#user_name').val();
	var customer_address   = $('#user_address').val();
	var customer_state     = $('#states').val();
	var city               = $('#cities').val();
	var pincode            = $('#user_pincode').val();
	var phone              = $('#user_phone').val();
	var email              = $('#user_email').val();
    //alert(customer_name + " " +customer_address + " " +customer_state + " " +city + " " +pincode + " " +phone + " " +email);
	
	if(customer_name!="" && customer_address!="" && customer_state!="select state" && city!="" && phone!="" && pincode!="")
	{
		$.ajax({
			type:"POST",
			url:"/add_new_customer",
			data:{customer_name:customer_name,customer_address:customer_address,customer_state:customer_state,city:city,pincode:pincode,phone:phone,email:email},
			success:function(data){
				if(data==1)
				{
					alert("New customer added sucessfully!");
					window.location.assign("/show_all_customers");
				}
			}
		})
	}
	else
	{
		alert("Fields marked * are required!");
	}
	
});





$('#save_edits').click(function(){
	
	var customer_name      = $('#customer_name').val();
	var customer_address   = $('#customer_address').val();
	var customer_state     = $('#customer_state').val();
	var city               = $('#city').val();
	var pincode            = $('#customer_pincode').val();
	var phone              = $('#customer_phone').val();
	var email              = $('#customer_email').val();
	var customer_id        =document.getElementById('cus_id').innerHTML;
    //alert(customer_name + " " +customer_address + " " +customer_state + " " +city + " " +pincode + " " +phone + " " +email);
	
	if(customer_name!="" && customer_address!="" && customer_state!="select state" && city!="" && phone!="")
	{
		$.ajax({
			type:"POST",
			url:"/edit_new_customer",
			data:{customer_name:customer_name,customer_address:customer_address,customer_state:customer_state,city:city,pincode:pincode,phone:phone,email:email,customer_id:customer_id},
			success:function(data){
				if(data==1)
				{
					//alert(" customer added sucessfully!");
					window.location.assign("/show_all_customers");
				}
			}
		}) 
	}
	else
	{
		alert("Fields marked * are required!");
	}
	
});




   
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










var states = ["select state","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Dadra and Nagar Haveli","Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
                                        "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Orissa","Puducherry","Punjab", "Rajasthan","Sikkim","Tamil Nadu",
                                        "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];
var op="";
for(var i=0;i<states.length;i++)
{
	$('<option>').val(states[i]).text(states[i]).appendTo('#customer_state');
}

$('#customer_state').change(function(){
	
	var myNode = document.getElementById("city");
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
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
		
	}
	else if(state_value=="Arunachal Pradesh")
	{
		var cities = ["Anjaw","Changlang","Dibang Valley","East Siang","East Kameng","Kurung Kumey","Lohit","Longding","Lower Dibang Valley","Lower Subansiri","Papum Pare","Tawang","Tirap","Upper Siang","Upper Subansiri","West Kameng","West Siang"];
		
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Assam")
	{
		 var cities = ["Baksa","Barpeta","Bongaigaon","Cachar","Chirang","Darrang","Dhemaji","Dima Hasao","Dhubri","Dibrugarh","Goalpara","Golaghat","Hailakandi","Jorhat",
                                     "Kamrup","Kamrup Metropolitan","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Morigaon","Nagaon","Nalbari","Sivasagar","Sonitpur","Tinsukia","Udalguri"];
									 
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}							 
	}
	else if(state_value=="Bihar")
	{
		var cities =["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur",
                                        "Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa",
                                        "Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Chhattisgarh")
	{
		 var cities = ["Bastar","Bijapur","Bilaspur","Dantewada","Dhamtari","Durg","Jashpur","Janjgir-Champa","Korba","Koriya","Kanker","Kabirdham (formerly Kawardha)","Mahasamund",
                                            "Narayanpur","Raigarh","Rajnandgaon","Raipur","Surajpur","Surguja"];
											
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}									
	}
	
	else if(state_value=="Dadra and Nagar Haveli")
	{
		var cities = ["Amal","Silvassa"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}	
	}
	else if(state_value=="Daman and Diu")
	{
		var cities=["Daman","Diu"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Delhi")
	{
		var cities=["Delhi","New Delhi","North Delhi","Noida","Patparganj","Sonabarsa","Tughlakabad"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Goa")
	{
		var cities=["Chapora","Dabolim","Madgaon","Marmugao (Marmagao)","Panaji Port","Panjim","Pellet Plant Jetty/Shiroda","Talpona","Vasco da Gama"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Gujarat")
	{
		var cities=["Ahmedabad","Amreli district","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Dahod","Dang","Gandhinagar","Jamnagar","Junagadh",
                                        "Kutch","Kheda","Mehsana","Narmada","Navsari","Patan","Panchmahal","Porbandar","Rajkot","Sabarkantha","Surendranagar","Surat","Tapi","Vadodara","Valsad"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Haryana")
	{
		var cities=["Ambala","Bhiwani","Faridabad","Fatehabad","Gurgaon","Hissar","Jhajjar","Jind","Karnal","Kaithal",
                                            "Kurukshetra","Mahendragarh","Mewat","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamuna Nagar"];
											
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Himachal Pradesh")
	{
		var cities=["Baddi","Baitalpur","Chamba","Dharamsala","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul & Spiti","Mandi","Simla","Sirmaur","Solan","Una"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}	
	}
	else if(state_value=="Jammu and Kashmir")
	{
		var cities=["Jammu","Leh","Rajouri","Srinagar"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}	
	}
	else if(state_value=="Karnataka")
	{
		var cities=["Bagalkot","Bangalore","Bangalore Urban","Belgaum","Bellary","Bidar","Bijapur","Chamarajnagar", "Chikkamagaluru","Chikkaballapur",
                                           "Chitradurga","Davanagere","Dharwad","Dakshina Kannada","Gadag","Gulbarga","Hassan","Haveri district","Kodagu",
                                           "Kolar","Koppal","Mandya","Mysore","Raichur","Shimoga","Tumkur","Udupi","Uttara Kannada","Ramanagara","Yadgir"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}								   
	}
	else if(state_value=="Kerala")
	{
		var cities=["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thrissur","Thiruvananthapuram","Wayanad"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Madhya Pradesh")
	{
		var cities=["Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhilai","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Dewas","Dhar","Guna","Gwalior","Hoshangabad",
                                    "Indore","Itarsi","Jabalpur","Khajuraho","Khandwa","Khargone","Malanpur","Malanpuri (Gwalior)","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Panna","Pithampur","Raipur","Raisen","Ratlam",
                                    "Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Singrauli","Ujjain"];
	  for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
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
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Manipur")
	{
		var cities=["Bishnupur","Churachandpur","Chandel","Imphal East","Senapati","Tamenglong","Thoubal","Ukhrul","Imphal West"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Meghalaya")
	{
		var cities=["Baghamara","Balet","Barsora","Bolanganj","Dalu","Dawki","Ghasuapara","Mahendraganj","Moreh","Ryngku","Shella Bazar","Shillong"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Mizoram")
	{
		var cities=["Aizawl","Champhai","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Serchhip"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Nagaland")
	{
		var cities=["Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Peren","Phek","Tuensang","Wokha","Zunheboto"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Orissa")
	{
		var cities=["Bahabal Pur","Bhubaneswar","Chandbali","Gopalpur","Jeypore","Paradip Garh","Puri","Rourkela"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Puducherry")
	{
		var cities=["Karaikal","Mahe","Pondicherry","Yanam"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Punjab")
	{
		var cities=["Amritsar","Barnala","Bathinda","Firozpur","Faridkot","Fatehgarh Sahib","Fazilka","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Mansa","Moga","Sri Muktsar Sahib","Pathankot",
                                        "Patiala","Rupnagar","Ajitgarh (Mohali)","Sangrur","Shahid Bhagat Singh Nagar","Tarn Taran"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Rajasthan")
	{
		var cities=["Ajmer","Banswara","Barmer","Barmer Rail Station","Basni","Beawar","Bharatpur","Bhilwara","Bhiwadi","Bikaner","Bongaigaon","Boranada, Jodhpur","Chittaurgarh","Fazilka","Ganganagar","Jaipur","Jaipur-Kanakpura",
                                       "Jaipur-Sitapura","Jaisalmer","Jodhpur","Jodhpur-Bhagat Ki Kothi","Jodhpur-Thar","Kardhan","Kota","Munabao Rail Station","Nagaur","Rajsamand","Sawaimadhopur","Shahdol","Shimoga","Tonk","Udaipur"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Sikkim")
	{
		var cities=["Chamurci","Gangtok"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
		
	}
	else if(state_value=="Tamil Nadu")
	{
		var cities=["Ariyalur","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kanchipuram","Kanyakumari","Karur","Krishnagiri","Madurai","Mandapam","Nagapattinam","Nilgiris","Namakkal","Perambalur","Pudukkottai","Ramanathapuram","Salem","Sivaganga","Thanjavur","Thiruvallur","Tirupur",
                                   "Tiruchirapalli","Theni","Tirunelveli","Thanjavur","Thoothukudi","Tiruvallur","Tiruvannamalai","Vellore","Villupuram","Viruthunagar"];
	   for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Telangana")
	{
		var cities=["Adilabad","Hyderabad","Karimnagar","Mahbubnagar","Medak","Nalgonda","Nizamabad","Ranga Reddy","Warangal"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Tripura")
	{
		var cities=["Agartala","Dhalaighat","Kailashahar","Kamalpur","Kanchanpur","Kel Sahar Subdivision","Khowai","Khowaighat","Mahurighat","Old Raghna Bazar","Sabroom","Srimantapur"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Uttar Pradesh")
	{
		var cities=["Agra","Allahabad","Auraiya","Banbasa","Bareilly","Berhni","Bhadohi","Dadri","Dharchula","Gandhar","Gauriphanta","Ghaziabad","Gorakhpur","Gunji",
                                    "Jarwa","Jhulaghat (Pithoragarh)","Kanpur","Katarniyaghat","Khunwa","Loni","Lucknow","Meerut","Moradabad","Muzaffarnagar","Nepalgunj Road","Pakwara (Moradabad)",
                                    "Pantnagar","Saharanpur","Sonauli","Surajpur","Tikonia","Varanasi"];
		for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="Uttarakhand")
	{
		var cities=["Almora","Badrinath","Bangla","Barkot","Bazpur","Chamoli","Chopra","Dehra Dun","Dwarahat","Garhwal","Haldwani","Hardwar","Haridwar","Jamal","Jwalapur","Kalsi","Kashipur","Mall",
                                           "Mussoorie","Nahar","Naini","Pantnagar","Pauri","Pithoragarh","Rameshwar","Rishikesh","Rohni","Roorkee","Sama","Saur"];
	   for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	else if(state_value=="West Bengal")
	{
		var cities=["Alipurduar","Bankura","Bardhaman","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah",
                                    "Jalpaiguri","Kolkata","Maldah","Murshidabad","Nadia","North 24 Parganas","Paschim Medinipur","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"];
		 for(var i=0;i<cities.length;i++)
		{
			$('<option>').val(cities[i]).text(cities[i]).appendTo('#city');
		}
	}
	
}) 


});


function customer_details(customer_id)
{
    
	$.ajax({
		type:"GET",
		url:"/customer_details",
		data:{customer_id:customer_id},
		success:function(data){
			
			document.getElementById('customer_name').value=data[0].customer_name;      $( "#customer_name" ).focus();
			document.getElementById('customer_address').value=data[0].customer_address;      $( "#customer_address" ).focus();
			
			document.getElementById('customer_state').value=data[0].customer_state;     // $( "#customer_state" ).focus();
			$('<option>').val(data[0].city).text(data[0].city).appendTo('#city');
			document.getElementById('city').value=data[0].city;
			
			document.getElementById('customer_phone').value=data[0].phone; $('#customer_phone').focus();
			document.getElementById('customer_pincode').value=data[0].pincode; $('#customer_pincode').focus();
			document.getElementById('customer_email').value=data[0].email; $('#customer_email').focus();
			document.getElementById('cus_id').innerHTML=customer_id;
		}
	});
}

var global_row_id="";
function search(val)
{

	if(val.length!=0)
	{
		var parent=document.getElementById('search_result');
     $.ajax({
	  type:"GET",
      url:"/search",
      data:{customer_name:val},
      success:function(data){
		  if(document.getElementById('search_list')!=undefined)
		  {

			$('#search_result').empty();
			if(global_row_id!="")
			document.getElementById(global_row_id).setAttribute("style","background-color:white");
		  }
		  
		  var collection=document.createElement('div');
		  collection.className="collection";
		  collection.id="search_list";
		  for(var i=0;i<data.length;i++)
		  { 
			  //var customer_id="#customer" +data[i].customer_id;
			  //var row_id="customer" +data[i].customer_id;
			  var a=document.createElement("a");
		      a.className="collection-item";
		       a.innerHTML=data[i].customer_name;
		      a.href="#" +data[i].customer_id;
			  a.id=data[i].customer_id;
			  var post_id=data[i].customer_id;	
			  a.setAttribute("style","color:#ee6e73");
			  
			  var cn=data[i].customer_name;
			  var ca=data[i].customer_address;
			  
              a.onclick=function(){
				                     /*var id=this.id;
									 var row_id="customer" +id;
									 var customer_id = "#customer" +id;
									 global_row_id=row_id;
				                     document.getElementById(row_id).setAttribute("style","background-color:#ee6e73");
				                     $('body').animate({scrollTop: $(customer_id).offset().top -100},2000); */
									 
                                     
									 
									 
									 var parent=document.getElementById('parent_table');
									 var tr1=document.createElement("tr");
									 tr1.onclick=function(){
										 window.location.assign("/get_all_orders_of_customer?customer_id=" + data[0].customer_id + "&customer_name=" + data[0].customer_name);
									 }
									 tr1.setAttribute("style","background-color:#ee6e73");
									 var td_id=document.createElement("td");
									 var td_id_text=document.createTextNode(data[0].customer_id);
									 td_id.appendChild(td_id_text); 
									 
									 var td_customer_name=document.createElement("td");
									 var td_customer_name_text=document.createTextNode(data[0].customer_name);
									 td_customer_name.appendChild(td_customer_name_text);
									 
									 var td_customer_address=document.createElement("td");
									 var td_customer_address_text=document.createTextNode(data[0].customer_address);
									 td_customer_address.appendChild(td_customer_address_text);
									 
									 var td_customer_state=document.createElement("td");
									 var td_customer_state_text=document.createTextNode(data[0].customer_state);
									 td_customer_state.appendChild(td_customer_state_text);
									 
									 var td_city=document.createElement("td");
									 var td_city_text=document.createTextNode(data[0].city);
									 td_city.appendChild(td_city_text);
									 
									 var td_pincode=document.createElement("td");
									 var td_pincode_text=document.createTextNode(data[0].pincode);
									 td_pincode.appendChild(td_pincode_text);
									 
									 var td_phone=document.createElement("td");
									 var td_phone_text=document.createTextNode(data[0].phone);
									 td_phone.appendChild(td_phone_text);
									 
									 var email=document.createElement("td");
									 var email_text=document.createTextNode(data[0].email);
									 email.appendChild(email_text); 
									 
									 var edit=document.createElement("a");
									 edit.setAttribute("onclick","customer_details(" + data[0].customer_id +")")
									 edit.className="edit_link";
									 edit.href="#modal2"
									 
									 var i=document.createElement("i");
									 i.className="material-icons";
									 var i_text=document.createTextNode("edit");
									 i.appendChild(i_text);
									 
									 edit.appendChild(i);
									 
									 
									 tr1.appendChild(td_id);
									 tr1.appendChild(td_customer_name);
									 tr1.appendChild(td_customer_address);
									 tr1.appendChild(td_customer_state);
									 tr1.appendChild(td_city);
									 tr1.appendChild(td_pincode);
									 tr1.appendChild(td_phone);
									 tr1.appendChild(email);
									 tr1.appendChild(edit);
									 parent.insertBefore(tr1,parent.childNodes[0]);
									 
									 $('#search_result').empty();
			                      }	  
			  
		      collection.appendChild(a);
			  
			
		  }
		  
		  parent.appendChild(collection);

	  }	  
      });
	}
	else
	{
		$('#search_result').empty();
	}
}

function show_orders_of_customer(customer_id,customer_name)
{
	window.location.assign("/get_all_orders_of_customer?customer_id=" + customer_id + "&customer_name=" + customer_name);
}