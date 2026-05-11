import requests
import math
from flask import Flask, request
from flask_cors import CORS
from pyproj import Transformer

# creates the web server
app = Flask(__name__)
# prevents CORS error; browser was blocking React from calling Flask backend bc they r on diff ports
CORS(app)

# tool that converts gps latlong to RSO kertau
transformer = Transformer.from_crs(4326, 3168)
reverse_transformer = Transformer.from_crs(3168, 4326)

# health check endpoint
@app.route("/")
def hello():
    return "Navex+ backend is running"

# turns a python function into sending lat,lng coords to convert to x,y
@app.route("/convert", methods=["POST"])
def convert():
    data = request.get_json()
    results = []
    for coord in data:
        lat = coord["lat"]
        lng = coord["lng"]
        x, y = transformer.transform(lat, lng)
        mgr_x = int(str(int(x))[1:5])
        mgr_y = int(str(int(y))[1:5])
        results.append({"x": mgr_x, "y": mgr_y})
    return results

# reverse function of the one above it, used when MGR is the input to convert to latlngs on map
@app.route("/reverse", methods=["POST"])
def reverse():
    data = request.get_json()
    easting = data["easting"]
    northing = data["northing"]
    lat, lng = reverse_transformer.transform(easting, northing)
    return {"lat": lat, "lng": lng}

def calculate_interval_dots(route_coords, interval):
    dots = []
    if len(route_coords) < 2:
        return dots
    
    cumulative = 0
    next_dot = interval

    for i in range(1, len(route_coords)):
        prev = route_coords[i - 1]
        curr = route_coords[i]

        # Convert to RSO Malaya for accurate flat distance calculation
        prev_x, prev_y = transformer.transform(prev["lat"], prev["lng"])
        curr_x, curr_y = transformer.transform(curr["lat"], curr["lng"])

        # Pythagoras distance in metres
        segment_dist = math.sqrt((curr_x - prev_x)**2 + (curr_y - prev_y)**2)

        while cumulative + segment_dist >= next_dot:
            ratio = (next_dot - cumulative) / segment_dist
            dots.append({
                "lat": prev["lat"] + ratio * (curr["lat"] - prev["lat"]),
                "lng": prev["lng"] + ratio * (curr["lng"] - prev["lng"])
            })
            next_dot += interval

        cumulative += segment_dist

    return dots

# calls OSRM routing engine to get real walkable path between consecutive checkpoints
@app.route("/route", methods=["POST"])
def route():
    data = request.get_json()
    markers = data["markers"]
    interval = data["interval"]
    full_route = []
    
    for i in range(len(markers) - 1):
        start = markers[i]
        end = markers[i + 1]
        
        url = f"http://router.project-osrm.org/route/v1/foot/{start['lng']},{start['lat']};{end['lng']},{end['lat']}?overview=full&geometries=geojson"
        
        response = requests.get(url)
        result = response.json()
        
        if result["code"] == "Ok":
            waypoints = result["waypoints"]
            snap_too_far = waypoints[0]["distance"] > 100 or waypoints[1]["distance"] > 100
            osrm_distance = result["routes"][0]["distance"]
            straight_distance = math.sqrt((end["lat"] - start["lat"])**2 + (end["lng"] - start["lng"])**2) * 111000
            route_too_long = osrm_distance > straight_distance * 1.4

            if snap_too_far or route_too_long:
                full_route.append({"lat": start["lat"], "lng": start["lng"]})
                full_route.append({"lat": end["lat"], "lng": end["lng"]})
            else:
                coords = result["routes"][0]["geometry"]["coordinates"]
                for coord in coords:
                    full_route.append({"lat": coord[1], "lng": coord[0]})
        else:
            # OSRM failed entirely, use straight line
            full_route.append({"lat": start["lat"], "lng": start["lng"]})
            full_route.append({"lat": end["lat"], "lng": end["lng"]})
    
    dots = calculate_interval_dots(full_route, interval)
    return {"route": full_route, "dots": dots}

if __name__ == "__main__":
    app.run(debug=True)