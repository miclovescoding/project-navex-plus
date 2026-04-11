import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";

// Defines a geographic box ard sg, prevents panning map outside sg
const SINGAPORE_BOUNDS = {
  north: 1.466878,
  south: 1.21186,
  west: 103.584676,
  east: 104.114079,
};

function ChangeMapView({ location }) {
  let map = useMap();

  useEffect(() => {
  console.log("location changed:", location);
  map.flyTo([location.lat, location.lng], location.zoom);
}, [location.lat, location.lng, location.zoom]);

  return null;
}
// receives input from main-page.jsx
export default function NavexMap({
  defaultLocation,
  markers,
  handleAddMarker,
  handleChangeMarker,
  handleDeleteMarker,
}) {


  // Clicking anywhere on the map adds marker with clicked coords
  return (
    <MapContainer
  center={[defaultLocation.lat, defaultLocation.lng]}
  zoom={defaultLocation.zoom}
  scrollWheelZoom={true}
  className="my-5 h-[450px] w-full md:h-[75vh]"
>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <ChangeMapView location={defaultLocation} />
</MapContainer>
  );
}
