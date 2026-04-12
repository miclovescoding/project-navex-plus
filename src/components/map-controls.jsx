import { useState } from "react";

import IntervalControls from "./interval-controls";

const DEFAULT_MESSAGE = "Or manually input your points!";
const SUCCESS_MESSAGE = "Sucessfully plotted MGR!";
const FAILURE_MESSAGE = "Oops, something went wrong!";
const INVALID_MGR_MESSAGE = "Oops, MGR must be an 8 digit number!";

export default function MapControls({
  handleAddMarker,
  handleDeleteAllMarkers,
  handleChangeInterval,
}) {
  let [mgr, setMgr] = useState("");
  let [statusMessage, setStatusMessage] = useState(DEFAULT_MESSAGE);

  const handleSubmit = () => {
  if (mgr.length !== 8) {
    setStatusMessage(INVALID_MGR_MESSAGE);
    return;
  }

  let easting = parseInt(`6${mgr.slice(0, 4)}0`);
  let northing = parseInt(`1${mgr.slice(4, 8)}0`);

  fetch("http://127.0.0.1:5000/reverse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ easting, northing })
  })
    .then(response => response.json())
    .then(result => {
      handleAddMarker({ lat: result.lat, lng: result.lng });
      setStatusMessage(SUCCESS_MESSAGE);
      setMgr("");
    })
    .catch(error => {
      setStatusMessage(FAILURE_MESSAGE);
      console.error(error);
    });
}

  return (
    <div className="text-center">
      <p className="mb-3">{statusMessage}</p>
      <input
        className="mr-3 rounded-3xl p-2 text-center text-black"
        type="text"
        maxLength={8}
        placeholder="Enter MGR"
        value={mgr}
        onInput={e => {
          let userInput = e.target.value;
          if (!isNaN(userInput)) {
            setMgr(userInput);
          }
        }}
      />
      <div className="mt-3 inline-block sm:mt-0">
        <button
          className="mr-3 w-20 rounded-3xl border-2 bg-green p-2 text-[#fff] duration-150 hover:bg-[#284f3e]"
          onClick={handleSubmit}
        >
          Plot
        </button>
        <button
          className="mr-3 w-20 rounded-3xl border-2 bg-red p-2 text-[#fff] duration-150 hover:bg-[#9f3b27]"
          onClick={() => {
            handleDeleteAllMarkers();
            setStatusMessage(DEFAULT_MESSAGE);
          }}
        >
          Clear
        </button>
        <IntervalControls handleChangeInterval={handleChangeInterval} />
      </div>
    </div>
  );
}
