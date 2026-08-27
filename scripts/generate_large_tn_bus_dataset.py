"""
Large-Scale Tamil Nadu Bus Transit Dataset Generator
Generates 1,200+ realistic trip records across MTC, TNSTC, and SETC corridors in Tamil Nadu
"""

import csv
import random
import os

# Tamil Nadu Transit Corridors Data Structure
ROUTES_DATA = [
    # MTC CHENNAI URBAN CORRIDORS
    {"corp": "MTC_CHENNAI", "code": "70H", "origin": "SRM Ramapuram", "dest": "T. Nagar Market", "dist": 12.5, "base_fuel": 6.5},
    {"corp": "MTC_CHENNAI", "code": "101A", "origin": "Koyambedu CMBT", "dest": "Chennai Central Station", "dist": 14.8, "base_fuel": 7.8},
    {"corp": "MTC_CHENNAI", "code": "21G", "origin": "Guindy Station", "dest": "Broadway Bus Terminus", "dist": 15.2, "base_fuel": 8.0},
    {"corp": "MTC_CHENNAI", "code": "23C", "origin": "Adayar Depot", "dest": "Egmore Railway Station", "dist": 11.4, "base_fuel": 6.0},
    {"corp": "MTC_CHENNAI", "code": "5E", "origin": "Besant Nagar", "dest": "Vadapalani Bus Terminus", "dist": 13.0, "base_fuel": 6.8},
    {"corp": "MTC_CHENNAI", "code": "11G", "origin": "K.K. Nagar", "dest": "Broadway Bus Terminus", "dist": 12.0, "base_fuel": 6.2},
    {"corp": "MTC_CHENNAI", "code": "570", "origin": "Koyambedu CMBT", "dest": "Siruseri IT Park OMR", "dist": 34.5, "base_fuel": 16.5},
    {"corp": "MTC_CHENNAI", "code": "D70", "origin": "Ambattur OT", "dest": "Velachery Railway Station", "dist": 26.0, "base_fuel": 12.5},

    # TNSTC COIMBATORE CORRIDORS
    {"corp": "TNSTC_COIMBATORE", "code": "CBE-101", "origin": "Coimbatore Gandhipuram", "dest": "Singanallur Bus Stand", "dist": 9.5, "base_fuel": 5.0},
    {"corp": "TNSTC_COIMBATORE", "code": "CBE-OOTY", "origin": "Coimbatore New Bus Stand", "dest": "Ooty Central Bus Stand", "dist": 86.0, "base_fuel": 38.0},
    {"corp": "TNSTC_COIMBATORE", "code": "CBE-PLK", "origin": "Coimbatore Ukkadam", "dest": "Pollachi Bus Stand", "dist": 42.0, "base_fuel": 20.0},

    # TNSTC MADURAI CORRIDORS
    {"corp": "TNSTC_MADURAI", "code": "MDU-201", "origin": "Madurai Mattuthavani", "dest": "Madurai Periyar Bus Stand", "dist": 8.2, "base_fuel": 4.5},
    {"corp": "TNSTC_MADURAI", "code": "MDU-RMS", "origin": "Madurai Mattuthavani", "dest": "Rameswaram Temple Stand", "dist": 172.0, "base_fuel": 68.0},
    {"corp": "TNSTC_MADURAI", "code": "MDU-KODAI", "origin": "Madurai Arapalayam", "dest": "Kodaikanal Bus Stand", "dist": 115.0, "base_fuel": 52.0},

    # TNSTC SALEM & TRICHY CORRIDORS
    {"corp": "TNSTC_SALEM", "code": "SLM-301", "origin": "Salem New Bus Stand", "dest": "Yercaud Hill Top", "dist": 32.0, "base_fuel": 18.0},
    {"corp": "TNSTC_SALEM", "code": "SLM-ERD", "origin": "Salem Central Stand", "dest": "Erode Bus Stand", "dist": 64.0, "base_fuel": 28.0},
    {"corp": "TNSTC_TRICHY", "code": "TRY-401", "origin": "Trichy Central Bus Stand", "dest": "Thanjavur Old Bus Stand", "dist": 56.0, "base_fuel": 24.0},
    {"corp": "TNSTC_TRICHY", "code": "TRY-SRM", "origin": "Trichy Chatram", "dest": "Srirangam Temple", "dist": 9.0, "base_fuel": 4.8},

    # SETC STATE EXPRESS LONG-DISTANCE CORRIDORS
    {"corp": "SETC_EXPRESS", "code": "SETC-108X", "origin": "Chennai CMBT", "dest": "Puducherry Bus Stand", "dist": 155.0, "base_fuel": 62.0},
    {"corp": "SETC_EXPRESS", "code": "SETC-801X", "origin": "Chennai CMBT", "dest": "Madurai Mattuthavani", "dist": 460.0, "base_fuel": 175.0},
    {"corp": "SETC_EXPRESS", "code": "SETC-902X", "origin": "Chennai CMBT", "dest": "Coimbatore Gandhipuram", "dist": 505.0, "base_fuel": 190.0}
]

WEATHER_TYPES = ["Clear", "Clear", "Clear", "Rain", "Monsoon_Heavy", "Fog"]

def generate_dataset(num_records=1200, output_path="data/tn_bus_kaggle_dataset.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    random.seed(42)  # Reproducible seed

    header = [
        "trip_id", "corporation", "route_code", "origin", "destination", 
        "distance_km", "hour_of_day", "day_of_week", "is_peak_hour", 
        "weather_condition", "traffic_density_index", 
        "passenger_occupancy_percent", "actual_delay_mins", "fuel_consumed_liters"
    ]

    rows = []

    for i in range(1, num_records + 1):
        route = random.choice(ROUTES_DATA)
        hour = random.randint(5, 23)
        dow = random.randint(0, 6)
        
        # Peak hours: 8-10 AM and 5-8 PM
        is_peak = 1 if (8 <= hour <= 10 or 17 <= hour <= 20) else 0
        
        weather = random.choice(WEATHER_TYPES)

        # Calculate traffic density index based on peak hours and weather
        base_traffic = random.uniform(0.70, 0.96) if is_peak else random.uniform(0.20, 0.65)
        if weather == "Rain":
            base_traffic = min(0.98, base_traffic + 0.10)
        elif weather == "Monsoon_Heavy":
            base_traffic = min(0.98, base_traffic + 0.20)
        
        traffic_density = round(base_traffic, 2)

        # Passenger occupancy calculation
        base_occ = random.randint(85, 128) if is_peak else random.randint(30, 75)
        if route["corp"] == "SETC_EXPRESS":
            base_occ = min(100, base_occ)  # Reservation limited
        occupancy = max(20, min(130, base_occ))

        # Calculate delay in minutes
        delay = round((traffic_density * 30) + (12 if weather == "Rain" else 25 if weather == "Monsoon_Heavy" else 0) + random.uniform(-3, 6), 1)
        delay = max(0.0, delay)

        # Calculate fuel consumption with traffic delay factor
        traffic_fuel_factor = 1.0 + (traffic_density * 0.35)
        fuel = round(route["base_fuel"] * traffic_fuel_factor + random.uniform(-0.5, 1.2), 1)

        trip_id = f"TN-{route['code']}-{i:04d}"

        rows.append([
            trip_id, route["corp"], route["code"], route["origin"], route["dest"],
            route["dist"], hour, dow, is_peak, weather, traffic_density,
            occupancy, delay, fuel
        ])

    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

    print(f"✅ Successfully generated {num_records} Tamil Nadu Bus Transit records in '{output_path}'")

if __name__ == "__main__":
    generate_dataset()
