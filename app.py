from flask import Flask, request
from flask_cors import CORS
from pyproj import Transformer

# creates the web server
app = Flask(__name__)
# prevents CORS error; browser was blocking React from calling Flask backend bc they r on diff ports
CORS(app)

# tool that converts gps latlong to RSO kertau
transformer = Transformer.from_crs(4326, 3168)

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

if __name__ == "__main__":
    app.run(debug=True)