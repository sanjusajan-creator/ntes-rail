export interface StationEntry {
  code: string;
  name: string;
  city: string;
  state: string;
}

/** A curated list of popular stations for autocomplete. Codes follow NTES. */
export const STATIONS: StationEntry[] = [
  // Delhi NCR
  { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi" },
  { code: "DLI", name: "Delhi Junction", city: "Delhi", state: "Delhi" },
  { code: "NZM", name: "Hazrat Nizamuddin", city: "New Delhi", state: "Delhi" },
  { code: "DEE", name: "Delhi Sarai Rohilla", city: "Delhi", state: "Delhi" },
  { code: "ANVT", name: "Anand Vihar Terminal", city: "Delhi", state: "Delhi" },
  { code: "GZB", name: "Ghaziabad", city: "Ghaziabad", state: "Uttar Pradesh" },
  { code: "FDB", name: "Faridabad", city: "Faridabad", state: "Haryana" },
  { code: "GGN", name: "Gurgaon", city: "Gurugram", state: "Haryana" },
  { code: "SMBX", name: "Sonipat", city: "Sonipat", state: "Haryana" },

  // Uttar Pradesh & Uttarakhand
  { code: "AGC", name: "Agra Cantt", city: "Agra", state: "Uttar Pradesh" },
  { code: "AF", name: "Agra Fort", city: "Agra", state: "Uttar Pradesh" },
  { code: "MTJ", name: "Mathura Junction", city: "Mathura", state: "Uttar Pradesh" },
  { code: "ALJN", name: "Aligarh Junction", city: "Aligarh", state: "Uttar Pradesh" },
  { code: "MTC", name: "Meerut City", city: "Meerut", state: "Uttar Pradesh" },
  { code: "SRE", name: "Saharanpur", city: "Saharanpur", state: "Uttar Pradesh" },
  { code: "MB", name: "Moradabad", city: "Moradabad", state: "Uttar Pradesh" },
  { code: "BE", name: "Bareilly", city: "Bareilly", state: "Uttar Pradesh" },
  { code: "LKO", name: "Lucknow Charbagh", city: "Lucknow", state: "Uttar Pradesh" },
  { code: "CNB", name: "Kanpur Central", city: "Kanpur", state: "Uttar Pradesh" },
  { code: "PRYJ", name: "Prayagraj Junction", city: "Prayagraj", state: "Uttar Pradesh" },
  { code: "BSB", name: "Varanasi Junction", city: "Varanasi", state: "Uttar Pradesh" },
  { code: "DDU", name: "Pt. Deen Dayal Upadhyaya Jn", city: "Mughalsarai", state: "Uttar Pradesh" },
  { code: "GKP", name: "Gorakhpur Junction", city: "Gorakhpur", state: "Uttar Pradesh" },
  { code: "AYC", name: "Ayodhya Cantt", city: "Ayodhya", state: "Uttar Pradesh" },
  { code: "AY", name: "Ayodhya Dham", city: "Ayodhya", state: "Uttar Pradesh" },
  { code: "SLN", name: "Sultanpur", city: "Sultanpur", state: "Uttar Pradesh" },
  { code: "JHS", name: "Jhansi Junction", city: "Jhansi", state: "Uttar Pradesh" },
  { code: "ETW", name: "Etawah", city: "Etawah", state: "Uttar Pradesh" },
  { code: "TDL", name: "Tundla Junction", city: "Tundla", state: "Uttar Pradesh" },
  { code: "MGS", name: "Mughalsarai (Old Code)", city: "Mughalsarai", state: "Uttar Pradesh" },
  { code: "HW", name: "Haridwar Junction", city: "Haridwar", state: "Uttarakhand" },
  { code: "RKSH", name: "Rishikesh", city: "Rishikesh", state: "Uttarakhand" },
  { code: "DDN", name: "Dehradun", city: "Dehradun", state: "Uttarakhand" },
  { code: "KGM", name: "Kathgodam", city: "Haldwani", state: "Uttarakhand" },

  // Punjab, Haryana, Himachal, J&K, Chandigarh
  { code: "ASR", name: "Amritsar Junction", city: "Amritsar", state: "Punjab" },
  { code: "LDH", name: "Ludhiana Junction", city: "Ludhiana", state: "Punjab" },
  { code: "JUC", name: "Jalandhar City", city: "Jalandhar", state: "Punjab" },
  { code: "PTA", name: "Patiala", city: "Patiala", state: "Punjab" },
  { code: "BTI", name: "Bathinda Junction", city: "Bathinda", state: "Punjab" },
  { code: "FZR", name: "Firozpur Cantt", city: "Firozpur", state: "Punjab" },
  { code: "CDG", name: "Chandigarh", city: "Chandigarh", state: "Chandigarh" },
  { code: "UMB", name: "Ambala Cantt", city: "Ambala", state: "Haryana" },
  { code: "KKDE", name: "Kurukshetra Junction", city: "Kurukshetra", state: "Haryana" },
  { code: "PNP", name: "Panipat Junction", city: "Panipat", state: "Haryana" },
  { code: "ROK", name: "Rohtak Junction", city: "Rohtak", state: "Haryana" },
  { code: "HSR", name: "Hisar", city: "Hisar", state: "Haryana" },
  { code: "KLK", name: "Kalka", city: "Kalka", state: "Haryana" },
  { code: "SML", name: "Shimla", city: "Shimla", state: "Himachal Pradesh" },
  { code: "UHL", name: "Una Himachal", city: "Una", state: "Himachal Pradesh" },
  { code: "JAT", name: "Jammu Tawi", city: "Jammu", state: "Jammu & Kashmir" },
  { code: "SVDK", name: "Shri Mata Vaishno Devi Katra", city: "Katra", state: "Jammu & Kashmir" },
  { code: "UHP", name: "Udhampur", city: "Udhampur", state: "Jammu & Kashmir" },

  // Rajasthan & Gujarat
  { code: "JP", name: "Jaipur Junction", city: "Jaipur", state: "Rajasthan" },
  { code: "AII", name: "Ajmer Junction", city: "Ajmer", state: "Rajasthan" },
  { code: "JU", name: "Jodhpur Junction", city: "Jodhpur", state: "Rajasthan" },
  { code: "BKN", name: "Bikaner Junction", city: "Bikaner", state: "Rajasthan" },
  { code: "JSM", name: "Jaisalmer", city: "Jaisalmer", state: "Rajasthan" },
  { code: "UDZ", name: "Udaipur City", city: "Udaipur", state: "Rajasthan" },
  { code: "ABR", name: "Abu Road", city: "Abu Road", state: "Rajasthan" },
  { code: "KOTA", name: "Kota Junction", city: "Kota", state: "Rajasthan" },
  { code: "SWM", name: "Sawai Madhopur", city: "Sawai Madhopur", state: "Rajasthan" },
  { code: "BTE", name: "Bharatpur Junction", city: "Bharatpur", state: "Rajasthan" },
  { code: "AWR", name: "Alwar", city: "Alwar", state: "Rajasthan" },
  { code: "ADI", name: "Ahmedabad Junction", city: "Ahmedabad", state: "Gujarat" },
  { code: "BRC", name: "Vadodara Junction", city: "Vadodara", state: "Gujarat" },
  { code: "ST", name: "Surat", city: "Surat", state: "Gujarat" },
  { code: "RJT", name: "Rajkot Junction", city: "Rajkot", state: "Gujarat" },
  { code: "JAM", name: "Jamnagar", city: "Jamnagar", state: "Gujarat" },
  { code: "DWK", name: "Dwarka", city: "Dwarka", state: "Gujarat" },
  { code: "PBR", name: "Porbandar", city: "Porbandar", state: "Gujarat" },
  { code: "BVC", name: "Bhavnagar Terminus", city: "Bhavnagar", state: "Gujarat" },
  { code: "GIMB", name: "Gandhidham Junction", city: "Gandhidham", state: "Gujarat" },
  { code: "OKHA", name: "Okha", city: "Okha", state: "Gujarat" },
  { code: "BL", name: "Valsad", city: "Valsad", state: "Gujarat" },
  { code: "VAPI", name: "Vapi", city: "Vapi", state: "Gujarat" },

  // Maharashtra & Goa
  { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai", state: "Maharashtra" },
  { code: "MMCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra" },
  { code: "LTT", name: "Lokmanya Tilak Terminus", city: "Mumbai", state: "Maharashtra" },
  { code: "BDTS", name: "Bandra Terminus", city: "Mumbai", state: "Maharashtra" },
  { code: "DR", name: "Dadar", city: "Mumbai", state: "Maharashtra" },
  { code: "BVI", name: "Borivali", city: "Mumbai", state: "Maharashtra" },
  { code: "BSR", name: "Vasai Road", city: "Vasai", state: "Maharashtra" },
  { code: "TNA", name: "Thane", city: "Thane", state: "Maharashtra" },
  { code: "KYN", name: "Kalyan Junction", city: "Kalyan", state: "Maharashtra" },
  { code: "PNVL", name: "Panvel", city: "Panvel", state: "Maharashtra" },
  { code: "PUNE", name: "Pune Junction", city: "Pune", state: "Maharashtra" },
  { code: "NGP", name: "Nagpur Junction", city: "Nagpur", state: "Maharashtra" },
  { code: "SUR", name: "Solapur", city: "Solapur", state: "Maharashtra" },
  { code: "KOP", name: "Kolhapur", city: "Kolhapur", state: "Maharashtra" },
  { code: "AWB", name: "Aurangabad", city: "Chhatrapati Sambhajinagar", state: "Maharashtra" },
  { code: "NK", name: "Nashik Road", city: "Nashik", state: "Maharashtra" },
  { code: "MMR", name: "Manmad Junction", city: "Manmad", state: "Maharashtra" },
  { code: "BSL", name: "Bhusaval Junction", city: "Bhusaval", state: "Maharashtra" },
  { code: "KNW", name: "Khandwa", city: "Khandwa", state: "Madhya Pradesh" },
  { code: "MAO", name: "Madgaon", city: "Margao", state: "Goa" },
  { code: "THVM", name: "Thivim", city: "Thivim", state: "Goa" },
  { code: "KRMI", name: "Karmali", city: "Old Goa", state: "Goa" },

  // Madhya Pradesh & Chhattisgarh
  { code: "BPL", name: "Bhopal Junction", city: "Bhopal", state: "Madhya Pradesh" },
  { code: "HBJ", name: "Rani Kamlapati", city: "Bhopal", state: "Madhya Pradesh" },
  { code: "IND", name: "Indore Junction", city: "Indore", state: "Madhya Pradesh" },
  { code: "UJN", name: "Ujjain Junction", city: "Ujjain", state: "Madhya Pradesh" },
  { code: "GWL", name: "Gwalior Junction", city: "Gwalior", state: "Madhya Pradesh" },
  { code: "JBP", name: "Jabalpur", city: "Jabalpur", state: "Madhya Pradesh" },
  { code: "ET", name: "Itarsi Junction", city: "Itarsi", state: "Madhya Pradesh" },
  { code: "STA", name: "Satna", city: "Satna", state: "Madhya Pradesh" },
  { code: "KTE", name: "Katni", city: "Katni", state: "Madhya Pradesh" },
  { code: "BINA", name: "Bina Junction", city: "Bina", state: "Madhya Pradesh" },
  { code: "RTM", name: "Ratlam Junction", city: "Ratlam", state: "Madhya Pradesh" },
  { code: "SGO", name: "Saugor", city: "Sagar", state: "Madhya Pradesh" },
  { code: "RAIP", name: "Raipur Junction", city: "Raipur", state: "Chhattisgarh" },
  { code: "BSP", name: "Bilaspur Junction", city: "Bilaspur", state: "Chhattisgarh" },
  { code: "DURG", name: "Durg", city: "Durg", state: "Chhattisgarh" },
  { code: "RJN", name: "Rajnandgaon", city: "Rajnandgaon", state: "Chhattisgarh" },

  // Bihar & Jharkhand
  { code: "PNBE", name: "Patna Junction", city: "Patna", state: "Bihar" },
  { code: "GAYA", name: "Gaya Junction", city: "Gaya", state: "Bihar" },
  { code: "DNR", name: "Danapur", city: "Patna", state: "Bihar" },
  { code: "ARA", name: "Ara Junction", city: "Ara", state: "Bihar" },
  { code: "BXR", name: "Buxar", city: "Buxar", state: "Bihar" },
  { code: "MFP", name: "Muzaffarpur Junction", city: "Muzaffarpur", state: "Bihar" },
  { code: "DBG", name: "Darbhanga Junction", city: "Darbhanga", state: "Bihar" },
  { code: "SPJ", name: "Samastipur Junction", city: "Samastipur", state: "Bihar" },
  { code: "BJU", name: "Barauni Junction", city: "Barauni", state: "Bihar" },
  { code: "BGP", name: "Bhagalpur", city: "Bhagalpur", state: "Bihar" },
  { code: "JYG", name: "Jaynagar", city: "Jaynagar", state: "Bihar" },
  { code: "RNC", name: "Ranchi Junction", city: "Ranchi", state: "Jharkhand" },
  { code: "DHN", name: "Dhanbad Junction", city: "Dhanbad", state: "Jharkhand" },
  { code: "ASN", name: "Asansol Junction", city: "Asansol", state: "West Bengal" },
  { code: "BKSC", name: "Bokaro Steel City", city: "Bokaro", state: "Jharkhand" },
  { code: "TATA", name: "Tatanagar Junction", city: "Jamshedpur", state: "Jharkhand" },
  { code: "GMO", name: "Netaji SC Bose Gomoh", city: "Gomoh", state: "Jharkhand" },

  // West Bengal & Northeast
  { code: "HWH", name: "Howrah Junction", city: "Kolkata", state: "West Bengal" },
  { code: "SDAH", name: "Sealdah", city: "Kolkata", state: "West Bengal" },
  { code: "KOAA", name: "Kolkata", city: "Kolkata", state: "West Bengal" },
  { code: "SHM", name: "Shalimar", city: "Kolkata", state: "West Bengal" },
  { code: "SRC", name: "Santragachi Junction", city: "Kolkata", state: "West Bengal" },
  { code: "KGP", name: "Kharagpur Junction", city: "Kharagpur", state: "West Bengal" },
  { code: "NJP", name: "New Jalpaiguri", city: "Siliguri", state: "West Bengal" },
  { code: "SGUJ", name: "Siliguri Junction", city: "Siliguri", state: "West Bengal" },
  { code: "APDJ", name: "Alipurduar Junction", city: "Alipurduar", state: "West Bengal" },
  { code: "GHY", name: "Guwahati", city: "Guwahati", state: "Assam" },
  { code: "KYQ", name: "Kamakhya", city: "Guwahati", state: "Assam" },
  { code: "RNY", name: "Rangiya Junction", city: "Rangiya", state: "Assam" },
  { code: "LMG", name: "Lumding Junction", city: "Lumding", state: "Assam" },
  { code: "DMV", name: "Dimapur", city: "Dimapur", state: "Nagaland" },
  { code: "SCL", name: "Silchar", city: "Silchar", state: "Assam" },
  { code: "AGTL", name: "Agartala", city: "Agartala", state: "Tripura" },
  { code: "DBRG", name: "Dibrugarh", city: "Dibrugarh", state: "Assam" },
  { code: "TSK", name: "Tinsukia Junction", city: "Tinsukia", state: "Assam" },

  // Odisha
  { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar", state: "Odisha" },
  { code: "CTC", name: "Cuttack", city: "Cuttack", state: "Odisha" },
  { code: "PURI", name: "Puri", city: "Puri", state: "Odisha" },
  { code: "BAM", name: "Berhampur", city: "Berhampur", state: "Odisha" },
  { code: "KUR", name: "Khurda Road Junction", city: "Khurda", state: "Odisha" },
  { code: "BHC", name: "Bhadrak", city: "Bhadrak", state: "Odisha" },
  { code: "BLS", name: "Balasore", city: "Balasore", state: "Odisha" },

  // Andhra Pradesh & Telangana
  { code: "SC", name: "Secunderabad Junction", city: "Hyderabad", state: "Telangana" },
  { code: "HYB", name: "Hyderabad Deccan", city: "Hyderabad", state: "Telangana" },
  { code: "KCG", name: "Kacheguda", city: "Hyderabad", state: "Telangana" },
  { code: "BZA", name: "Vijayawada Junction", city: "Vijayawada", state: "Andhra Pradesh" },
  { code: "VSKP", name: "Visakhapatnam", city: "Visakhapatnam", state: "Andhra Pradesh" },
  { code: "VZM", name: "Vizianagaram", city: "Vizianagaram", state: "Andhra Pradesh" },
  { code: "RJY", name: "Rajahmundry", city: "Rajahmundry", state: "Andhra Pradesh" },
  { code: "TPTY", name: "Tirupati", city: "Tirupati", state: "Andhra Pradesh" },
  { code: "GNT", name: "Guntur Junction", city: "Guntur", state: "Andhra Pradesh" },
  { code: "NLR", name: "Nellore", city: "Nellore", state: "Andhra Pradesh" },
  { code: "OGL", name: "Ongole", city: "Ongole", state: "Andhra Pradesh" },
  { code: "RU", name: "Renigunta Junction", city: "Renigunta", state: "Andhra Pradesh" },
  { code: "GDR", name: "Gudur Junction", city: "Gudur", state: "Andhra Pradesh" },

  // Karnataka
  { code: "SBC", name: "KSR Bengaluru City", city: "Bengaluru", state: "Karnataka" },
  { code: "YPR", name: "Yesvantpur Junction", city: "Bengaluru", state: "Karnataka" },
  { code: "BNC", name: "Bengaluru Cantt", city: "Bengaluru", state: "Karnataka" },
  { code: "KJM", name: "Krishnarajapuram", city: "Bengaluru", state: "Karnataka" },
  { code: "MYS", name: "Mysuru Junction", city: "Mysuru", state: "Karnataka" },
  { code: "UBL", name: "Hubballi Junction", city: "Hubballi", state: "Karnataka" },
  { code: "DWR", name: "Dharwad", city: "Dharwad", state: "Karnataka" },
  { code: "BGM", name: "Belagavi", city: "Belagavi", state: "Karnataka" },
  { code: "HPT", name: "Hosapete Junction", city: "Hosapete", state: "Karnataka" },
  { code: "BAY", name: "Ballari Junction", city: "Ballari", state: "Karnataka" },
  { code: "BJP", name: "Vijayapura", city: "Vijayapura", state: "Karnataka" },
  { code: "MAJN", name: "Mangaluru Junction", city: "Mangaluru", state: "Karnataka" },
  { code: "MAQ", name: "Mangaluru Central", city: "Mangaluru", state: "Karnataka" },
  { code: "HAS", name: "Hassan", city: "Hassan", state: "Karnataka" },

  // Tamil Nadu, Kerala & Puducherry
  { code: "MAS", name: "MGR Chennai Central", city: "Chennai", state: "Tamil Nadu" },
  { code: "MS", name: "Chennai Egmore", city: "Chennai", state: "Tamil Nadu" },
  { code: "TBM", name: "Tambaram", city: "Chennai", state: "Tamil Nadu" },
  { code: "CGL", name: "Chengalpattu", city: "Chengalpattu", state: "Tamil Nadu" },
  { code: "AJJ", name: "Arakkonam Junction", city: "Arakkonam", state: "Tamil Nadu" },
  { code: "KPD", name: "Katpadi Junction", city: "Vellore", state: "Tamil Nadu" },
  { code: "JTJ", name: "Jolarpettai Junction", city: "Jolarpettai", state: "Tamil Nadu" },
  { code: "SA", name: "Salem Junction", city: "Salem", state: "Tamil Nadu" },
  { code: "ED", name: "Erode Junction", city: "Erode", state: "Tamil Nadu" },
  { code: "TUP", name: "Tiruppur", city: "Tiruppur", state: "Tamil Nadu" },
  { code: "CBE", name: "Coimbatore Junction", city: "Coimbatore", state: "Tamil Nadu" },
  { code: "TPJ", name: "Tiruchirappalli", city: "Tiruchirappalli", state: "Tamil Nadu" },
  { code: "MDU", name: "Madurai Junction", city: "Madurai", state: "Tamil Nadu" },
  { code: "DG", name: "Dindigul Junction", city: "Dindigul", state: "Tamil Nadu" },
  { code: "TEN", name: "Tirunelveli", city: "Tirunelveli", state: "Tamil Nadu" },
  { code: "NCJ", name: "Nagercoil Junction", city: "Nagercoil", state: "Tamil Nadu" },
  { code: "TN", name: "Tuticorin", city: "Thoothukudi", state: "Tamil Nadu" },
  { code: "RMM", name: "Rameswaram", city: "Rameswaram", state: "Tamil Nadu" },
  { code: "VM", name: "Villupuram Junction", city: "Villupuram", state: "Tamil Nadu" },
  { code: "PDY", name: "Puducherry", city: "Puducherry", state: "Puducherry" },
  { code: "TVC", name: "Thiruvananthapuram Central", city: "Thiruvananthapuram", state: "Kerala" },
  { code: "KCVL", name: "Kochuveli", city: "Thiruvananthapuram", state: "Kerala" },
  { code: "QLN", name: "Kollam Junction", city: "Kollam", state: "Kerala" },
  { code: "KYJ", name: "Kayamkulam", city: "Kayamkulam", state: "Kerala" },
  { code: "SRR", name: "Shoranur Junction", city: "Shoranur", state: "Kerala" },
  { code: "TCR", name: "Thrissur", city: "Thrissur", state: "Kerala" },
  { code: "ERS", name: "Ernakulam Junction", city: "Kochi", state: "Kerala" },
  { code: "ERN", name: "Ernakulam Town", city: "Kochi", state: "Kerala" },
  { code: "AWY", name: "Aluva", city: "Aluva", state: "Kerala" },
  { code: "PGT", name: "Palakkad Junction", city: "Palakkad", state: "Kerala" },
  { code: "CLT", name: "Kozhikode", city: "Kozhikode", state: "Kerala" },
  { code: "CAN", name: "Kannur", city: "Kannur", state: "Kerala" },
  { code: "KGQ", name: "Kasaragod", city: "Kasaragod", state: "Kerala" },
];

export function searchStations(query: string, limit = 8): StationEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return STATIONS.slice(0, limit);
  const scored = STATIONS.map((station) => {
    const code = station.code.toLowerCase();
    const name = station.name.toLowerCase();
    const city = station.city.toLowerCase();
    let score = -1;
    if (code === q) score = 100;
    else if (code.startsWith(q)) score = 80;
    else if (name.startsWith(q)) score = 70;
    else if (city.startsWith(q)) score = 60;
    else if (name.includes(q)) score = 40;
    else if (city.includes(q)) score = 30;
    else if (code.includes(q)) score = 20;
    return { station, score };
  })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.station);
}

export function stationByCode(code: string): StationEntry | undefined {
  return STATIONS.find((station) => station.code === code.toUpperCase());
}
