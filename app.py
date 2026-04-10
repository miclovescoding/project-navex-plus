from flask import Flask, request
from pyproj import Transformer

# creates the web server 
app = Flask(__name__)

# tool that converts gps latlong to RSO kertau
transformer = Transformer.from_crs(4326, 3168)

# health check endpoint
@app.route("/")
def hello():
    return "Navex+ backend is running"

# turns a python function into a URL endpoint
@app.route("/convert")
def convert():
    lat = float(request.args.get("lat"))
    lng = float(request.args.get("lng"))
    x, y = transformer.transform(lat, lng)
    return {"x": x, "y": y}

if __name__ == "__main__":
    app.run(debug=True)