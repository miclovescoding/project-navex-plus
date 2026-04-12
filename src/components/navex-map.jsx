import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMap, Marker, useMapEvents, LayersControl, Polyline } from "react-leaflet";
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

function MapClickHandler({ handleAddMarker }) {
  useMapEvents({
    click(e) {
      handleAddMarker(e.latlng);
    },
  });
  return null;
}

export default function NavexMap({
  defaultLocation,
  markers,
  handleAddMarker,
  handleChangeMarker,
  handleDeleteMarker,
}) {

const polylinePositions = markers.map(marker => [marker.position.lat, marker.position.lng]);

  // Clicking anywhere on the map adds marker with clicked coords
  return (
    <MapContainer
  center={[defaultLocation.lat, defaultLocation.lng]}
  zoom={defaultLocation.zoom}
  scrollWheelZoom={true}
  className="my-5 h-[450px] w-full md:h-[75vh]"
>
  <LayersControl position="topright">
  <LayersControl.BaseLayer checked name="Topo">
    <TileLayer
      attribution='&copy; TracesTrack'
      url={`https://tile.tracestrack.com/topo__/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TRACESTRACK_API_KEY}`}
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="OpenStreetMap">
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="CyclOSM">
    <TileLayer
      attribution='&copy; CyclOSM'
      url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Voyager">
    <TileLayer
      attribution='&copy; CartoDB'
      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Satellite">
    <TileLayer
      attribution='&copy; Esri'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    />
  </LayersControl.BaseLayer>

  <LayersControl.Overlay name="Satellite Labels">
  <TileLayer
    url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
    attribution='&copy; Esri'
  />
</LayersControl.Overlay>
</LayersControl>

  <ChangeMapView location={defaultLocation} />
  {markers.map(marker => (
  <Marker
    key={marker.id}
    position={marker.position}
    draggable={true}
    eventHandlers={{
      dragend(e) {
        handleChangeMarker(marker.id, e.target.getLatLng());
      },
      click() {
        handleDeleteMarker(marker.id);
      },
    }}
  />
))}

{polylinePositions.length > 1 && (
  <Polyline
    positions={polylinePositions}
    pathOptions={{
      color: "black",
      weight: 2.3,
      dashArray: "5,10",
      lineCap: "round"
    }}
  />
)}

  <MapClickHandler handleAddMarker={handleAddMarker} />
</MapContainer>
  );
}
