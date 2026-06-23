const { State, City } = require('../Utils/Postgres');

const stateCitiesMap = {
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 
    'Kakinada', 'Rajamahendravaram', 'Kadapa', 'Tirupati', 'Anantapur', 
    'Eluru', 'Vizianagaram', 'Ongole', 'Tenali', 'Proddatur', 'Chittoor'
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Tawang', 'Pasighat', 'Ziro', 'Bomdila'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 
    'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Bihar Sharif', 
    'Darbhanga', 'Arrah', 'Begusarai', 'Purnia', 'Katihar', 'Munger'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Jagdalpur', 
    'Ambikapur', 'Dhamtari', 'Durg', 'Mahasamund'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 
    'Junagadh', 'Gandhinagar', 'Nadiad', 'Anand', 'Morbi', 'Mehsana', 
    'Bhuj', 'Valsad', 'Vapi', 'Bharuch', 'Porbandar'
  ],
  'Haryana': [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 
    'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Sirsa'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Nahan', 'Una', 'Kullu'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 
    'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 
    'Alappuzha', 'Palakkad', 'Malappuram', 'Kannur', 'Kottayam', 
    'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 
    'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Khandwa'
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 
    'Solapur', 'Amravati', 'Navi Mumbai', 'Kolhapur', 'Sangli', 
    'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 
    'Parbhani', 'Ichalkaranji', 'Jalna', 'Bhusawal', 'Panvel'
  ],
  'Manipur': [
    'Imphal', 'Thoubal', 'Kakching', 'Churachandpur', 'Ukhrul', 'Senapati'
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Williamnagar', 'Baghmara'
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip'
  ],
  'Nagaland': [
    'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto'
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur', 
    'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 
    'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Abohar', 'Khanna'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 
    'Bhilwara', 'Alwar', 'Sikar', 'Bharatpur', 'Ganganagar', 'Pali'
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Singtam', 'Rangpo'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tiruppur', 
    'Erode', 'Vellore', 'Tirunelveli', 'Thoothukudi', 'Nagercoil', 
    'Thanjavur', 'Dindigul', 'Ranipet', 'Sivakasi', 'Karur', 'Kancheepuram'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 
    'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet'
  ],
  'Tripura': [
    'Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia', 'Ambassa'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 
    'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 
    'Noida', 'Greater Noida', 'Jhansi', 'Muzaffarnagar', 'Mathura'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Haldwani', 'Rudrapur', 'Kashipur', 
    'Roorkee', 'Rishikesh', 'Pithoragarh', 'Ramnagar'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Asansol', 
    'Durgapur', 'Kharagpur', 'Bardhaman', 'Malda', 'Baharampur', 'Haldia'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Delhi': [
    'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 
    'Central Delhi', 'North West Delhi', 'North East Delhi', 'South West Delhi', 
    'South East Delhi', 'Shahdara'
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Sopore', 
    'Udhampur', 'Poonch', 'Rajouri'
  ],
  'Ladakh': [
    'Leh', 'Kargil'
  ],
  'Lakshadweep': [
    'Kavaratti', 'Minicoy', 'Amini', 'Andrott'
  ],
  'Puducherry': [
    'Puducherry', 'Karaikal', 'Mahe', 'Yanam'
  ],
  'Andaman and Nicobar Islands': [
    'Port Blair', 'Car Nicobar', 'Mayabunder'
  ]
};

async function seed() {
  console.log("Starting seeding of cities for all states...");
  
  // Fetch all states from db to get correct UUIDs
  const dbStates = await State.findAll();
  
  for (const dbState of dbStates) {
    const cityNameList = stateCitiesMap[dbState.name];
    if (!cityNameList) {
      console.log(`No city mapping found for state: ${dbState.name}`);
      continue;
    }
    
    console.log(`Seeding ${cityNameList.length} cities for state: ${dbState.name}`);
    for (const cityName of cityNameList) {
      try {
        const [city, created] = await City.findOrCreate({
          where: { name: cityName, stateId: dbState.id },
          defaults: { name: cityName, stateId: dbState.id, isActive: true }
        });
        if (created) {
          // Success
        }
      } catch (err) {
        console.error(`Error creating city ${cityName} in ${dbState.name}:`, err.message);
      }
    }
  }
  
  console.log("All states cities seeded successfully!");
  process.exit(0);
}

seed();
