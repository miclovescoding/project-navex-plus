import { useState, useRef, useEffect } from "react";

import MapControls from "../components/map-controls";
import NavexMap from "../components/navex-map";
import NDS from "../components/nds";
import TrainingAreaDropdown from "../components/training-area-dropdown";
import MarkerPanel from "../components/marker-panel";

//Javascript object; like Python dict - can update new training areas in the future
const TRAINING_AREAS = {
  amaKeng: {
    name: "Ama Keng",
    location: { lat: 1.403703, lng: 103.702338, zoom: 15 },
  },
  jalanBahar: {
    name: "Jalan Bahar",
    location: { lat: 1.359666, lng: 103.674655, zoom: 14 },
  },
  jalanBathera: {
    name: "Jalan Bathera",
    location: { lat: 1.409809, lng: 103.683807, zoom: 14 },
  },
  lorongAsrama: {
    name: "Lorong Asrama",
    location: { lat: 1.412811, lng: 103.77478, zoom: 15 },
  },
  lowerMandai: {
    name: "Lower Mandai",
    location: { lat: 1.348384, lng: 103.812913, zoom: 15 },
  },
  marsling: {
    name: "Marsling",
    location: { lat: 1.400156, lng: 103.771155, zoom: 15 },
  },
  tekong: {
    name: "Tekong",
    location: { lat: 1.412587, lng: 104.038093, zoom: 14 },
  },
};

export default function MainPage() {
  //List of checkpoints user places on map, starts empty
  let [markers, setMarkers] = useState([]); 
  //Dist interval between points default 100m 
  let [interval, setInterval] = useState(100); 
  let [mapLocation, setMapLocation] = useState(TRAINING_AREAS.lorongAsrama.location);
  let [selectedMarker, setSelectedMarker] = useState(null);
  let [route, setRoute] = useState([]);
  let [dots, setDots] = useState([]);
  let [nds, setNds] = useState([]);
  let [ndsLoading, setNdsLoading] = useState(false)
  //5 actions users can perform 

  const fetchRouteTimeout = useRef(null);
  const markersRef = useRef(markers);
useEffect(() => {
  markersRef.current = markers;
}, [markers]);

  useEffect(() => {
  if (markersRef.current.length >= 2) {
    debouncedFetchRoute(markersRef.current);
  }
}, [interval]);

function debouncedFetchRoute(currentMarkers) {
  if (fetchRouteTimeout.current) {
    clearTimeout(fetchRouteTimeout.current);
  }
  fetchRouteTimeout.current = setTimeout(() => {
    fetchRoute(currentMarkers);
  }, 300);
}
  //Add Marker 
  function handleAddMarker(position) {
  const newMarkers = [...markers, { id: crypto.randomUUID(), position: position, color: "red", name: "" }];
  setMarkers(newMarkers);
  debouncedFetchRoute(newMarkers);
}
  
  //Change Marker - drag and drop 
  function handleChangeMarker(id, position) {
  const newMarkers = markers.map(marker =>
    marker.id === id ? { ...marker, position: position } : marker
  );
  setMarkers(newMarkers);
  debouncedFetchRoute(newMarkers);
}
  
  //Delete 1 Marker 
  function handleDeleteMarker(id) {
  const newMarkers = markers.filter(marker => marker.id !== id);
  setMarkers(newMarkers);
  debouncedFetchRoute(newMarkers);
}

  //Delete all markers
function handleDeleteAllMarkers() {
  setMarkers([]);
  setRoute([]);
  setDots([]);
  setNds([]);
}

  //Changes distance interval between 50 and 100
  function handleChangeInterval(newInterval) {
    setInterval(newInterval);
  }

  function handleSelectArea(location) {
    setMapLocation(location);
  }
  function handleUpdateMarker(id, color, name) {
  setMarkers(markers.map(marker =>
    marker.id === id ? { ...marker, color: color, name: name } : marker
  ));
}

function fetchRoute(currentMarkers) {
  if (currentMarkers.length < 2) {
    setRoute([]);
    setDots([]);
    return;
  }

  setNdsLoading(true);

  fetch("http://127.0.0.1:5000/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      markers: currentMarkers.map(marker => ({
        lat: marker.position.lat,
        lng: marker.position.lng
      })),
      interval: interval
    })
  })
    .then(response => response.json())
    .then(data => {
      setRoute(data.route);
      setDots(data.dots);
      setNds(data.nds);
      setNdsLoading(false);
    })
    .catch(error => {
      console.error(error);
      setNdsLoading(false);
    });
}

const activeMarker = markers.find(marker => marker.id === selectedMarker);
  return (  
    <div>
      
        {/* Dropdown menu for training areas */}
        <TrainingAreaDropdown trainingAreas={TRAINING_AREAS} onSelectArea={handleSelectArea} /> 
        <div style={{ position: "relative" }}>
  <NavexMap
    defaultLocation={mapLocation}
    markers={markers}
    route={route}
    dots={dots}
    handleAddMarker={handleAddMarker}
    handleChangeMarker={handleChangeMarker}
    handleDeleteMarker={handleDeleteMarker}
    handleUpdateMarker={handleUpdateMarker}
    setSelectedMarker={setSelectedMarker}
  />

  <MarkerPanel
    marker={activeMarker}
    onUpdate={handleUpdateMarker}
    onDelete={handleDeleteMarker}
    onClose={() => setSelectedMarker(null)}
  />
</div>
        <MapControls 
          handleAddMarker={handleAddMarker}
          handleDeleteAllMarkers={handleDeleteAllMarkers}
          handleChangeInterval={handleChangeInterval}
        />
        {/* Only show NDS when at least 2 markers are placed */}
        {nds.length > 0 && <NDS nds={nds} loading={ndsLoading} />}
      
    </div>
  );
}
