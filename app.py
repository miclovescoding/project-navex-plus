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
            dot_lat = prev["lat"] + ratio * (curr["lat"] - prev["lat"])
            dot_lng = prev["lng"] + ratio * (curr["lng"] - prev["lng"])
            dot_x, dot_y = transformer.transform(dot_lat, dot_lng)
            mgr_x = int(str(int(dot_x))[1:5])
            mgr_y = int(str(int(dot_y))[1:5])
            dots.append({
                "lat": dot_lat,
                "lng": dot_lng,
                "mgr_x": mgr_x,
                "mgr_y": mgr_y
            })
            next_dot += interval

        cumulative += segment_dist

    return dots

def get_azimuth(x_diff, y_diff):
    if x_diff == 0:
        return 6400 if y_diff > 0 else 3200
    angle = math.atan(y_diff / x_diff)
    if x_diff > 0:
        return math.floor(1600 - (angle / (2 * math.pi)) * 6400)
    else:
        return math.floor(4800 - (angle / (2 * math.pi)) * 6400)
    
# calls OSRM routing engine to get real walkable path between consecutive checkpoints
@app.route("/route", methods=["POST"])
def route():
    data = request.get_json()
    markers = data["markers"]
    interval = int(data["interval"])
    
    full_route = []
    all_dots = []
    nds = []

    for i in range(len(markers) - 1):
        start = markers[i]
        end = markers[i + 1]

        # Get leg route
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
                leg_route = [{"lat": start["lat"], "lng": start["lng"]}, {"lat": end["lat"], "lng": end["lng"]}]
            else:
                coords = result["routes"][0]["geometry"]["coordinates"]
                leg_route = [{"lat": c[1], "lng": c[0]} for c in coords]
        else:
            leg_route = [{"lat": start["lat"], "lng": start["lng"]}, {"lat": end["lat"], "lng": end["lng"]}]

        full_route.extend(leg_route)

        # Calculate dots for this leg only — counter resets per leg
        leg_dots = calculate_interval_dots(leg_route, interval)
        all_dots.extend(leg_dots)

        # Convert start marker to MGR
        start_x, start_y = transformer.transform(start["lat"], start["lng"])
        start_mgr_x = int(str(int(start_x))[1:5])
        start_mgr_y = int(str(int(start_y))[1:5])

        # Add start marker as checkpoint row
        all_leg_points = [{"mgr_x": start_mgr_x, "mgr_y": start_mgr_y, "is_checkpoint": True}]

        # Add interval dots for this leg
        for dot in leg_dots:
            all_leg_points.append({"mgr_x": dot["mgr_x"], "mgr_y": dot["mgr_y"], "is_checkpoint": False})

        # Generate NDS rows for this leg
        for j in range(1, len(all_leg_points)):
            prev = all_leg_points[j - 1]
            curr = all_leg_points[j]
            x_diff = curr["mgr_x"] - prev["mgr_x"]
            y_diff = curr["mgr_y"] - prev["mgr_y"]
            distance = round(math.sqrt(x_diff**2 + y_diff**2) * 10)
            azimuth = get_azimuth(x_diff, y_diff)
            nds.append({
                "start_x": prev["mgr_x"],
                "start_y": prev["mgr_y"],
                "end_x": curr["mgr_x"],
                "end_y": curr["mgr_y"],
                "azimuth": azimuth,
                "distance": interval if not curr["is_checkpoint"] else distance,
                "is_checkpoint": prev["is_checkpoint"]  # ← changed from curr to prev
            })

    # Add final marker as checkpoint row
    end = markers[-1]
    end_x, end_y = transformer.transform(end["lat"], end["lng"])
    end_mgr_x = int(str(int(end_x))[1:5])
    end_mgr_y = int(str(int(end_y))[1:5])
    
    if nds:
        last = nds[-1]
        x_diff = end_mgr_x - last["end_x"]
        y_diff = end_mgr_y - last["end_y"]
        distance = round(math.sqrt(x_diff**2 + y_diff**2) * 10)
        azimuth = get_azimuth(x_diff, y_diff)
        nds.append({
            "start_x": last["end_x"],
            "start_y": last["end_y"],
            "end_x": end_mgr_x,
            "end_y": end_mgr_y,
            "azimuth": azimuth,
            "distance": distance,
            "is_checkpoint": True
        })

    return {"route": full_route, "dots": all_dots, "nds": nds}

if __name__ == "__main__":
    app.run(debug=True)