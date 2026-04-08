from flask import Flask, request
from pyproj import Transformer

app = Flask(__name__)

transformer = Transformer.from_crs(4326, 3168)

@app.route("/")
def hello():
    return "Navex+ backend is running"

@app.route("/convert")
def convert():
    lat = float(request.args.get("lat"))
    lng = float(request.args.get("lng"))
    x, y = transformer.transform(lat, lng)
    return {"x": x, "y": y}

if __name__ == "__main__":
    app.run(debug=True)