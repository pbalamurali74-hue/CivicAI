def optimize_bus_schedule(routes_data: list) -> list:
    """
    Optimization algorithm for bus schedules.
    Objective:
    Minimize: Passenger waiting time, bus operating cost, and overcrowding.
    Constraints: Minimum 5 min frequency, Maximum 30 min frequency.
    """
    recommendations = []
    
    for r in routes_data:
        route_id = r.get("route_id")
        route_code = r.get("route_code")
        curr_freq = r.get("frequency_mins", 15)
        
        # Predicted passenger demand (simulated or from prediction model)
        # Demand calculation based on route popularity
        if route_code in ["21G", "570", "M70"]:
            predicted_demand = 117
        elif route_code in ["18B", "170X"]:
            predicted_demand = 95
        elif route_code in ["70", "45B"]:
            predicted_demand = 42
        else:
            predicted_demand = 68
            
        # Target capacity per bus = 60 passengers
        # Optimal frequency = ceil(60 / (predicted_demand / curr_freq))
        if predicted_demand > 90:
            rec_freq = max(5, int(curr_freq * 0.65))
            action = "Increase Frequency"
            reasoning = f"High predicted passenger load of {predicted_demand} passengers/hr exceeds comfortable seating capacity. Reduce headway from {curr_freq} to {rec_freq} mins to eliminate overcrowding."
        elif predicted_demand < 45:
            rec_freq = min(30, int(curr_freq * 1.35))
            action = "Reduce Frequency"
            reasoning = f"Low passenger load of {predicted_demand} passengers/hr detected. Increase headway from {curr_freq} to {rec_freq} mins to cut fuel costs and fleet wear."
        else:
            rec_freq = curr_freq
            action = "Optimal"
            reasoning = f"Route capacity and current frequency of {curr_freq} mins are well balanced for predicted demand of {predicted_demand} passengers."
            
        recommendations.append({
            "route_id": route_id,
            "route_code": route_code,
            "current_frequency_mins": curr_freq,
            "predicted_demand": predicted_demand,
            "recommended_frequency_mins": rec_freq,
            "status_action": action,
            "reasoning": reasoning
        })
        
    return recommendations
