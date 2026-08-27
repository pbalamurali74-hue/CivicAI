import csv
import os
import random
from datetime import datetime, timedelta

os.makedirs("data", exist_ok=True)
os.makedirs("backend/app/ml/saved_models", exist_ok=True)

# 1. OFFICERS CSV
officers_data = [
    # Police Department
    ("TN-POL-10001", "Rajesh Kumar", "Tamil Nadu Police", "Traffic Police Inspector", "Chennai Traffic Division - Guindy", "ACTIVE", 4.7, "2026-08-10", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10002", "Anitha Ramesh", "Tamil Nadu Police", "Assistant Commissioner", "Ashok Nagar Police Station", "ACTIVE", 4.9, "2026-08-01", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10003", "Suresh Pitchai", "Tamil Nadu Police", "Sub-Inspector", "Koyambedu Police Station", "ACTIVE", 4.2, "2026-07-15", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10004", "Karthik Subramanian", "Tamil Nadu Police", "Head Constable", "T. Nagar Traffic Control", "SUSPENDED", 2.1, "2026-06-20", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10005", "Meena Sundaram", "Tamil Nadu Police", "Traffic Police Sub-Inspector", "Tambaram Traffic Station", "ACTIVE", 4.6, "2026-08-05", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10006", "Venkatesh Prasad", "Tamil Nadu Police", "Inspector of Police", "Adyar Police Station", "ACTIVE", 4.8, "2026-08-08", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10007", "Dinesh Karthik", "Tamil Nadu Police", "Traffic Sub-Inspector", "Porur Junction Traffic Unit", "ACTIVE", 4.3, "2026-07-30", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10008", "Priya Vijay", "Tamil Nadu Police", "Sub-Inspector", "Vadapalani Police Station", "ACTIVE", 4.5, "2026-08-02", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
    
    # Revenue & SRO Department
    ("TN-REV-20001", "Murugan Chettiar", "Revenue Department", "Tahsildar", "Guindy Taluk Office", "ACTIVE", 4.4, "2026-07-10", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"),
    ("TN-REV-20002", "Lakshmi Narayanan", "Registration Dept (SRO)", "Sub-Registrar", "Ashok Nagar SRO", "ACTIVE", 4.6, "2026-08-03", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"),
    ("TN-REV-20003", "Balamurugan K", "Registration Dept (SRO)", "Sub-Registrar Officer", "Saidapet SRO Office", "ACTIVE", 4.1, "2026-06-18", "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80"),
    ("TN-REV-20004", "Ramesh Chandran", "Revenue Department", "Village Administrative Officer (VAO)", "Ramapuram Revenue Circle", "ACTIVE", 4.5, "2026-07-28", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"),
    ("TN-REV-20005", "Deepa Selvam", "Revenue Department", "Deputy Tahsildar", "Mambalam Taluk Office", "SUSPENDED", 1.8, "2026-05-10", "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"),
    
    # Transport Department & TANGEDCO (EB)
    ("TN-TNP-30001", "Saravanan R", "Transport Department", "Regional Transport Officer (RTO)", "Chennai South RTO (KK Nagar)", "ACTIVE", 4.7, "2026-08-04", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"),
    ("TN-TNP-30002", "Gajendran M", "TANGEDCO (Electricity Board)", "Assistant Executive Engineer", "Guindy EB Section Office", "ACTIVE", 4.3, "2026-07-22", "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&auto=format&fit=crop&q=80"),
    ("TN-TNP-30003", "Kavitha Rajan", "Transport Department", "Motor Vehicle Inspector", "Virugambakkam RTO Unit", "ACTIVE", 4.5, "2026-08-07", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"),
    ("TN-TNP-30004", "Sundararaman G", "Greater Chennai Corporation", "Assistant Engineer (Sanitation)", "Zone 11 Corporation Office", "ACTIVE", 4.4, "2026-08-09", "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80"),
    ("TN-TNP-30005", "Arun Prakash", "TANGEDCO (Electricity Board)", "Junior Engineer", "Ramapuram EB Office", "ACTIVE", 4.2, "2026-07-19", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10009", "Nalini Natarajan", "Tamil Nadu Police", "Women Help Desk Officer", "Guindy Police Station", "ACTIVE", 4.9, "2026-08-06", "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80"),
    ("TN-POL-10010", "Santhosh Kumar", "Tamil Nadu Police", "Highway Patrol Inspector", "GST Road Patrol Unit", "ACTIVE", 4.6, "2026-08-01", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"),
]

with open("data/officers.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["officer_id", "name", "department", "designation", "office_location", "verification_status", "trust_score", "verified_date", "photo_url"])
    writer.writerows(officers_data)

# 2. GOVERNMENT OFFICES CSV (30 Offices in Chennai)
offices_data = [
    ("OFF-001", "Guindy Police Station", "Police", "GST Road, Guindy, Chennai", "600032", "Chennai", 13.0067, 80.2020, "044-22500100", "24 Hours"),
    ("OFF-002", "Ashok Nagar Police Station", "Police", "1st Block, Ashok Nagar, Chennai", "600083", "Chennai", 13.0355, 80.2115, "044-24891100", "24 Hours"),
    ("OFF-003", "Koyambedu Police Station", "Police", "Near CMBT Bus Stand, Koyambedu, Chennai", "600107", "Chennai", 13.0694, 80.1948, "044-24792200", "24 Hours"),
    ("OFF-004", "Vadapalani Police Station", "Police", "Arcot Road, Vadapalani, Chennai", "600026", "Chennai", 13.0500, 80.2121, "044-24833300", "24 Hours"),
    ("OFF-005", "Adyar Police Station", "Police", "L.B. Road, Adyar, Chennai", "600020", "Chennai", 13.0012, 80.2565, "044-24414400", "24 Hours"),
    ("OFF-006", "Porur Police Station", "Police", "Mount Poonamallee Road, Porur, Chennai", "600116", "Chennai", 13.0382, 80.1565, "044-24765500", "24 Hours"),
    ("OFF-007", "Mambalam Police Station", "Police", "Madley Road, T. Nagar, Chennai", "600017", "Chennai", 13.0418, 80.2341, "044-24346600", "24 Hours"),
    
    ("OFF-008", "Government Multi Super Speciality Hospital", "Hospital", "Omandurar Estate, Anna Salai, Chennai", "600002", "Chennai", 13.0684, 80.2743, "044-25305000", "24 Hours Emergency"),
    ("OFF-009", "MIOT International Hospital", "Hospital", "Mount Poonamallee Road, Manapakkam, Chennai", "600089", "Chennai", 13.0232, 80.1772, "044-42002288", "24 Hours"),
    ("OFF-010", "SRM Specialty Hospital & Medical College", "Hospital", "Bharathi Salai, Ramapuram, Chennai", "600089", "Chennai", 13.0315, 80.1812, "044-30603060", "24 Hours"),
    ("OFF-011", "Royapettah Government Hospital", "Hospital", "West Cott Road, Royapettah, Chennai", "600014", "Chennai", 13.0560, 80.2642, "044-28483051", "24 Hours Emergency"),
    ("OFF-012", "Government Peripheral Hospital", "Hospital", "KK Nagar, Chennai", "600078", "Chennai", 13.0390, 80.1980, "044-24741122", "24 Hours Emergency"),
    
    ("OFF-013", "Ramapuram EB Office (TANGEDCO)", "EB", "Vallal Pari Salai, Ramapuram, Chennai", "600089", "Chennai", 13.0335, 80.1795, "044-22490123", "09:00 AM - 05:00 PM"),
    ("OFF-014", "Guindy TANGEDCO Section Office", "EB", "GST Road, Guindy, Chennai", "600032", "Chennai", 13.0089, 80.2045, "044-22501234", "09:00 AM - 05:00 PM"),
    ("OFF-015", "KK Nagar TANGEDCO Electricity Office", "EB", "12th Main Road, KK Nagar, Chennai", "600078", "Chennai", 13.0410, 80.2010, "044-24719876", "09:00 AM - 05:00 PM"),
    ("OFF-016", "Porur TANGEDCO Substation Office", "EB", "Trunk Road, Porur, Chennai", "600116", "Chennai", 13.0395, 80.1580, "044-24769988", "09:00 AM - 05:00 PM"),
    
    ("OFF-017", "Ashok Nagar Sub-Registrar Office (SRO)", "SRO", "10th Avenue, Ashok Nagar, Chennai", "600083", "Chennai", 13.0368, 80.2134, "044-24893456", "10:00 AM - 05:30 PM"),
    ("OFF-018", "Virugambakkam Sub-Registrar Office", "SRO", "Arcot Road, Virugambakkam, Chennai", "600092", "Chennai", 13.0532, 80.1912, "044-23771122", "10:00 AM - 05:30 PM"),
    ("OFF-019", "Saidapet Sub-Registrar Office", "SRO", "Jeonis Road, Saidapet, Chennai", "600015", "Chennai", 13.0225, 80.2241, "044-24355544", "10:00 AM - 05:30 PM"),
    ("OFF-020", "Joint Sub-Registrar Office South Chennai", "SRO", "Fanepet, Nandanam, Chennai", "600035", "Chennai", 13.0289, 80.2389, "044-24330011", "10:00 AM - 05:30 PM"),
    
    ("OFF-021", "Chennai South RTO (KK Nagar)", "Transport", "Inner Ring Road, KK Nagar, Chennai", "600078", "Chennai", 13.0425, 80.1995, "044-24747700", "09:30 AM - 05:00 PM"),
    ("OFF-022", "Chennai Central RTO (Ayanavaram)", "Transport", "Konnur High Road, Ayanavaram, Chennai", "600023", "Chennai", 13.0988, 80.2344, "044-26742211", "09:30 AM - 05:00 PM"),
    ("OFF-023", "Poonamallee RTO Unit Office", "Transport", "Trunk Road, Poonamallee, Chennai", "600056", "Chennai", 13.0488, 80.0911, "044-26493322", "09:30 AM - 05:00 PM"),
    
    ("OFF-024", "Greater Chennai Corporation Zone 11 Office", "Municipality", "Arcot Road, Valasaravakkam, Chennai", "600087", "Chennai", 13.0440, 80.1730, "044-24860011", "10:00 AM - 05:00 PM"),
    ("OFF-025", "Greater Chennai Corporation Ripon Building (HQ)", "Municipality", "EVR Periyar Salai, Park Town, Chennai", "600003", "Chennai", 13.0827, 80.2755, "044-25384520", "10:00 AM - 05:30 PM"),
    ("OFF-026", "Zone 13 Corporation Office (Adyar)", "Municipality", "L.B. Road, Adyar, Chennai", "600020", "Chennai", 13.0035, 80.2580, "044-24425566", "10:00 AM - 05:00 PM"),
    ("OFF-027", "Guindy Taluk Revenue Office", "Municipality", "GST Road, Guindy, Chennai", "600032", "Chennai", 13.0075, 80.2030, "044-22502233", "10:00 AM - 05:00 PM"),
    ("OFF-028", "T. Nagar Post Office & Passport Seva Kendra", "Municipality", "Thyagaraya Road, T. Nagar, Chennai", "600017", "Chennai", 13.0405, 80.2330, "044-24341100", "09:00 AM - 04:00 PM"),
    ("OFF-029", "Ramapuram Village Panchayat Office", "Municipality", "Mount-Poonamallee Link Road, Ramapuram", "600089", "Chennai", 13.0308, 80.1802, "044-22498899", "10:00 AM - 05:00 PM"),
    ("OFF-030", "Tambaram City Municipal Corporation HQ", "Municipality", "GST Road, Tambaram, Chennai", "600045", "Chennai", 12.9249, 80.1000, "044-22260022", "10:00 AM - 05:00 PM")
]

with open("data/offices.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["office_id", "name", "category", "address", "pincode", "city", "latitude", "longitude", "phone", "opening_hours"])
    writer.writerows(offices_data)

# 3. BUS STOPS CSV (50 Stops)
stops = [
    ("STOP-001", "SRM Ramapuram Campus", 13.0315, 80.1812),
    ("STOP-002", "DLF IT Park / Ramapuram", 13.0285, 80.1770),
    ("STOP-003", "Miot Hospital Junction", 13.0232, 80.1772),
    ("STOP-004", "Manapakkam Water Works", 13.0180, 80.1790),
    ("STOP-005", "Kathipara Junction / Guindy", 13.0070, 80.2020),
    ("STOP-006", "Guindy Bus Terminus", 13.0090, 80.2050),
    ("STOP-007", "Saidapet Metro / Bus Stand", 13.0220, 80.2230),
    ("STOP-008", "Nandanam Signal", 13.0290, 80.2390),
    ("STOP-009", "T. Nagar Bus Terminus", 13.0400, 80.2330),
    ("STOP-010", "Vadapalani Bus Terminus", 13.0500, 80.2120),
    ("STOP-011", "Ashok Pillar Junction", 13.0350, 80.2110),
    ("STOP-012", "KK Nagar Bus Depot", 13.0410, 80.1990),
    ("STOP-013", "Koyambedu CMBT", 13.0694, 80.1948),
    ("STOP-014", "Porur Roundana", 13.0380, 80.1560),
    ("STOP-015", "Iyyapanthangal Bus Depot", 13.0390, 80.1380),
    ("STOP-016", "Chennai Central Railway Station", 13.0827, 80.2755),
    ("STOP-017", "Egmore Railway Station", 13.0780, 80.2610),
    ("STOP-018", "Gemini Flyover / Thousand Lights", 13.0560, 80.2510),
    ("STOP-019", "Adyar Signal / Bus Stand", 13.0010, 80.2560),
    ("STOP-020", "Velachery Bus Stand", 12.9780, 80.2210),
    ("STOP-021", "Tambaram Railway Station West", 12.9250, 80.1000),
    ("STOP-022", "Chromepet Bus Stand", 12.9520, 80.1410),
    ("STOP-023", "Airport Cargo Terminal", 12.9810, 80.1630),
    ("STOP-024", "Tirusulam / Airport Metro", 12.9880, 80.1670),
    ("STOP-025", "Meenambakkam Bus Stop", 12.9940, 80.1780),
    ("STOP-026", "Valasaravakkam", 13.0440, 80.1730),
    ("STOP-027", "Virugambakkam Market", 13.0530, 80.1910),
    ("STOP-028", "Liberty / Kodambakkam", 13.0520, 80.2240),
    ("STOP-029", "PNS / Panagal Park", 13.0420, 80.2310),
    ("STOP-030", "Luz Corner / Mylapore", 13.0330, 80.2680),
    ("STOP-031", "Marina Beach / Light House", 13.0410, 80.2800),
    ("STOP-032", "High Court / Broadway", 13.0890, 80.2860),
    ("STOP-033", "Mint Terminus / Washermanpet", 13.1080, 80.2800),
    ("STOP-034", "Anna Nagar West Depot", 13.0880, 80.1980),
    ("STOP-035", "Anna Arch / Aminjikarai", 13.0760, 80.2180),
    ("STOP-036", "Kilpauk Medical College", 13.0780, 80.2440),
    ("STOP-037", "Royapettah Signal", 13.0560, 80.2640),
    ("STOP-038", "Thiruvanmiyur Bus Depot", 12.9860, 80.2590),
    ("STOP-039", "ECR Tollgate / Palavakkam", 12.9620, 80.2570),
    ("STOP-040", "Sholinganallur Junction", 12.9010, 80.2270),
    ("STOP-041", "OMR Navalur / TCS", 12.8480, 80.2260),
    ("STOP-042", "Siruseri IT Park", 12.8250, 80.2180),
    ("STOP-043", "Medavakkam Junction", 12.9180, 80.1920),
    ("STOP-044", "Perumbakkam", 12.8980, 80.1900),
    ("STOP-045", "Camp Road / Selaiyur", 12.9130, 80.1410),
    ("STOP-046", "Perungalathur Junction", 12.9050, 80.0890),
    ("STOP-047", "Vandalur Zoo", 12.8900, 80.0800),
    ("STOP-048", "Poonamallee Bus Stand", 13.0480, 80.0910),
    ("STOP-049", "Avadi Bus Depot", 13.1160, 80.1010),
    ("STOP-050", "Ambattur OT", 13.1140, 80.1540),
]

with open("data/bus_stops.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["stop_id", "stop_name", "latitude", "longitude"])
    writer.writerows(stops)

# 4. BUS ROUTES CSV (20 Routes)
routes_data = [
    ("R-21G", "21G", "Tambaram", "Broadway / High Court", 32.5, 25.0, 15, "STOP-021,STOP-022,STOP-024,STOP-006,STOP-007,STOP-008,STOP-018,STOP-016,STOP-032"),
    ("R-70", "70", "Tambaram", "Koyambedu CMBT", 24.0, 20.0, 20, "STOP-021,STOP-022,STOP-005,STOP-011,STOP-010,STOP-013"),
    ("R-18B", "18B", "Guindy", "Chennai Central", 14.8, 15.0, 15, "STOP-006,STOP-007,STOP-008,STOP-018,STOP-017,STOP-016"),
    ("R-570", "570", "Koyambedu CMBT", "Kelambakkam / Siruseri", 36.2, 30.0, 12, "STOP-013,STOP-011,STOP-005,STOP-020,STOP-040,STOP-041,STOP-042"),
    ("R-25G", "25G", "Poonamallee", "Anna Square", 22.0, 18.0, 15, "STOP-048,STOP-014,STOP-001,STOP-010,STOP-018,STOP-031"),
    ("R-11G", "11G", "KK Nagar Depot", "Broadway", 16.5, 15.0, 18, "STOP-012,STOP-011,STOP-009,STOP-018,STOP-016,STOP-032"),
    ("R-29C", "29C", "Perambur", "Beshant Nagar", 18.2, 18.0, 15, "STOP-035,STOP-036,STOP-017,STOP-008,STOP-019"),
    ("R-5B", "5B", "T. Nagar", "Mylapore / Beach", 10.5, 12.0, 20, "STOP-009,STOP-008,STOP-030,STOP-031"),
    ("R-45B", "45B", "Anna Nagar West", "Guindy Terminus", 15.0, 15.0, 20, "STOP-034,STOP-035,STOP-013,STOP-010,STOP-011,STOP-006"),
    ("R-M70", "M70", "Velachery", "CMBT Koyambedu", 17.5, 18.0, 10, "STOP-020,STOP-005,STOP-011,STOP-012,STOP-010,STOP-013"),
    ("R-70V", "70V", "Vadapalani", "Tambaram", 19.8, 18.0, 15, "STOP-010,STOP-011,STOP-005,STOP-024,STOP-022,STOP-021"),
    ("R-570S", "570S", "SRM Ramapuram", "Siruseri IT Park", 28.5, 25.0, 15, "STOP-001,STOP-002,STOP-005,STOP-020,STOP-040,STOP-042"),
    ("R-170X", "170X (AI Rec)", "SRM Ramapuram", "Chennai Central Direct", 16.2, 20.0, 15, "STOP-001,STOP-003,STOP-005,STOP-007,STOP-016"),
    ("R-D51", "D51", "Medavakkam", "High Court", 25.0, 22.0, 25, "STOP-043,STOP-020,STOP-019,STOP-031,STOP-032"),
    ("R-27B", "27B", "CMBT Koyambedu", "Fore Shore Estate", 14.0, 15.0, 15, "STOP-013,STOP-035,STOP-036,STOP-017,STOP-037,STOP-031"),
    ("R-88K", "88K", "Kaundi / Porur", "Broadway", 20.5, 18.0, 20, "STOP-014,STOP-001,STOP-010,STOP-035,STOP-016,STOP-032"),
    ("R-12B", "12B", "Vadapalani", "Fore Shore Estate", 11.2, 12.0, 15, "STOP-010,STOP-009,STOP-008,STOP-030,STOP-031"),
    ("R-A1", "A1", "Chennai Central", "Thiruvanmiyur", 15.8, 15.0, 15, "STOP-016,STOP-018,STOP-008,STOP-019,STOP-038"),
    ("R-102", "102", "Broadway", "Kelambakkam", 35.0, 30.0, 10, "STOP-032,STOP-031,STOP-019,STOP-038,STOP-040,STOP-041"),
    ("R-47", "47", "Villivakkam", "Adyar Depot", 19.0, 18.0, 18, "STOP-034,STOP-013,STOP-010,STOP-011,STOP-006,STOP-019")
]

with open("data/bus_routes.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["route_id", "route_code", "origin", "destination", "distance_km", "base_fare", "frequency_mins", "path_stops"])
    writer.writerows(routes_data)

# 5. LIVE VEHICLES CSV (100 Buses)
vehicles_data = []
route_list = [r[0] for r in routes_data]
for i in range(1, 101):
    vid = f"BUS-{i:03d}"
    bus_num = f"TN-01-N-{1000+i}"
    rid = route_list[i % len(route_list)]
    lat = round(13.0000 + random.uniform(0.00, 0.09), 4)
    lng = round(80.1400 + random.uniform(0.00, 0.14), 4)
    speed = random.randint(15, 45)
    occ = random.randint(20, 95)
    next_s = f"STOP-{random.randint(1, 50):03d}"
    eta = random.randint(2, 18)
    vehicles_data.append((vid, bus_num, rid, lat, lng, speed, occ, next_s, eta))

with open("data/vehicles.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["vehicle_id", "bus_number", "route_id", "current_lat", "current_lng", "speed_kmh", "occupancy_percent", "next_stop_id", "eta_mins"])
    writer.writerows(vehicles_data)

# 6. HISTORICAL PASSENGER DEMAND CSV (1000 records for ML training)
demand_data = []
weather_types = ["Sunny", "Clear", "Rainy", "Cloudy"]
traffic_levels = ["Low", "Moderate", "Heavy", "Severe"]

start_date = datetime(2026, 7, 1)
for i in range(1000):
    dt = start_date + timedelta(hours=i*3, minutes=random.randint(0, 59))
    rid = random.choice(route_list)
    sid = f"STOP-{random.randint(1, 20):03d}"
    hr = dt.hour
    dow = dt.weekday()
    holiday = 1 if dow >= 5 or random.random() < 0.05 else 0
    
    if (8 <= hr <= 10) or (17 <= hr <= 20):
        base_pax = random.randint(75, 140)
        traf = random.choice(["Heavy", "Severe"])
    elif (11 <= hr <= 16):
        base_pax = random.randint(35, 70)
        traf = random.choice(["Moderate", "Low"])
    else:
        base_pax = random.randint(10, 40)
        traf = "Low"
        
    weath = random.choice(weather_types)
    if weath == "Rainy":
        base_pax += int(base_pax * 0.25)
        
    demand_data.append((
        dt.strftime("%Y-%m-%d %H:%M:%S"),
        rid,
        sid,
        base_pax,
        weath,
        dow,
        hr,
        holiday,
        traf
    ))

with open("data/demand.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["timestamp", "route_id", "stop_id", "passenger_count", "weather", "day_of_week", "hour", "holiday", "traffic_level"])
    writer.writerows(demand_data)

# 7. OFFICER RATINGS CSV (500 records)
ratings_data = []
officer_ids = [o[0] for o in officers_data]
comments = [
    "Very professional behavior, explained the verification clearly.",
    "Prompt response and courteous assistance at the counter.",
    "Helpful officer, resolved my query in 10 minutes.",
    "Extremely polite and transparent officer.",
    "Delayed service, asked unnecessary questions.",
    "Suspicious request for extra processing charge without receipt.",
    "Great guidance on registration procedure.",
    "Efficient handling of traffic clearance during rush hour."
]

for i in range(1, 501):
    oid = random.choice(officer_ids)
    cid = f"USER-{random.randint(100, 300)}"
    
    is_suspicious_sample = random.random() < 0.12
    if is_suspicious_sample:
        p, b, t, s = 1, 1, 1, 1
        val = 1.0
        comm = "Unsatisfactory experience fake officer!"
        ip = "192.168.1.105"
        anom = round(random.uniform(0.72, 0.95), 2)
        is_susp = 1
    else:
        p = random.randint(4, 5)
        b = random.randint(4, 5)
        t = random.randint(4, 5)
        s = random.randint(4, 5)
        val = round((p + b + t + s) / 4.0, 1)
        comm = random.choice(comments)
        ip = f"10.0.{random.randint(1,50)}.{random.randint(1,250)}"
        anom = round(random.uniform(0.05, 0.35), 2)
        is_susp = 0
        
    created = (datetime(2026, 8, 10) - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))).strftime("%Y-%m-%d %H:%M:%S")
    ratings_data.append((i, oid, cid, p, b, t, s, val, comm, ip, created, is_susp, anom))

with open("data/ratings.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["rating_id", "officer_id", "citizen_id", "professionalism", "behavior", "transparency", "service_quality", "rating_value", "comment", "ip_address", "created_at", "is_suspicious", "anomaly_score"])
    writer.writerows(ratings_data)

# 8. OD TRIP JOURNEY DATA CSV (200 records)
od_data = []
od_pairs = [
    ("STOP-001", "STOP-005", "SRM Ramapuram", "Guindy"),
    ("STOP-001", "STOP-009", "SRM Ramapuram", "T. Nagar"),
    ("STOP-001", "STOP-016", "SRM Ramapuram", "Chennai Central"),
    ("STOP-005", "STOP-016", "Guindy", "Chennai Central"),
    ("STOP-014", "STOP-013", "Porur", "Koyambedu CMBT"),
    ("STOP-021", "STOP-005", "Tambaram", "Guindy"),
    ("STOP-020", "STOP-042", "Velachery", "Siruseri IT Park"),
    ("STOP-010", "STOP-016", "Vadapalani", "Chennai Central"),
]

for i in range(200):
    pair = random.choice(od_pairs)
    pax = random.randint(15, 120)
    transfers = 1 if pair[0] == "STOP-001" and pair[1] in ["STOP-009", "STOP-016"] else 0
    pref_hour = random.choice([8, 9, 10, 17, 18, 19])
    od_data.append((i+1, pair[0], pair[1], pair[2], pair[3], pax, transfers, pref_hour))

with open("data/od_data.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["trip_id", "origin_stop_id", "dest_stop_id", "origin_name", "dest_name", "passenger_count", "transfers_count", "preferred_hour"])
    writer.writerows(od_data)

print("✅ Seed dataset CSV files created successfully in data/")
