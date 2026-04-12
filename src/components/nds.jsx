import { useEffect, useState } from "react";


const FAILURE_MESSAGE = "Oops, something went wrong! Please make sure you have your API key set correctly.";

export default function NDS({ markers, interval }) {
  let [ndsData, setNdsData] = useState([]);
  let [loading, setLoading] = useState(false);
  let [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (markers.length < 2) {
      return;
    }

    setLoading(true);
    fetch("http://127.0.0.1:5000/convert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(markers.map(marker => ({
    lat: marker.position.lat,
    lng: marker.position.lng
  })))
})
  .then(response => response.json())
  .then(mgrs => {
    setStatusMessage("");
    setLoading(false);

    // mgrs already in correct format from Flask backend
    // no conversion needed unlike MapTiler

        let data = [];
        for (let i = 1; i < mgrs.length; i++) {
          let x = mgrs[i - 1].x;
          let y = mgrs[i - 1].y;
          let xDiff = mgrs[i].x - x;
          let yDiff = mgrs[i].y - y;
          // Straight line distance using Pythagoras' Theorem
          let distance = (xDiff ** 2 + yDiff ** 2) ** 0.5 / (interval / 10);
          // bearing
          let azimuth = getAzimuth(xDiff, yDiff);
          let xIncrement = xDiff / distance;
          let yIncrement = yDiff / distance;

          // Divides into smaller segments based on interval setting
          for (let j = 0; j < Math.floor(distance); j++) {
            let start = { x, y };
            x += xIncrement;
            y += yIncrement;
            let end = { x, y };
            data.push({ start, end, azimuth, interval, count: j });
          }

          let remainder = distance - Math.floor(distance);
          let start = { x, y };
          x += remainder * xIncrement;
          y += remainder * yIncrement;
          let end = { x, y };
          data.push({
            start,
            end,
            azimuth,
            interval: Math.round(remainder * interval),
            count: 0,
          });
        }

        setNdsData(data);
      })
      .catch(error => {
        setStatusMessage(FAILURE_MESSAGE);
        console.error(error);
      });
  }, [markers, interval]);

  // Renders NDS table w 5 columns
  return (
    <>
      {statusMessage && <p className="text-center mt-5">{statusMessage}</p>}
      <table
        className={`mx-auto my-7 w-11/12 border-2 border-solid border-black ${loading && "opacity-50"}`}
      >
        <thead className="bg-green">
          <tr>
            {/* Said 5 columns */}
            <TableCell>No.</TableCell>
            <TableCell>Start MGR</TableCell>
            <TableCell>End MGR</TableCell>
            <TableCell>Mil</TableCell>
            <TableCell>Dist.</TableCell>
          </tr>
        </thead>
        <tbody>
          {ndsData.map(({ start, end, azimuth, interval, count }, index) => (
            <tr
              // rows alt between dark and normal bg
              key={index}
              className={`${index % 2 == 0 && "bg-[#212121]"} ${count == 0 && "text-yellow-100"}`}
            >
              <TableCell>{index}</TableCell>
              <TableCell>{getFormattedMgr(start)}</TableCell>
              <TableCell>{getFormattedMgr(end)}</TableCell>
              <TableCell>{azimuth}</TableCell>
              <TableCell>{interval}</TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function TableCell({ count, children }) {
  return (
    <td
      className={`border-2 border-solid border-black text-center ${count == 0 ? "text-yellow-100" : ""}`}
    >
      {children}
    </td>
  );
}

// returns MGR coord for display in the table
function getFormattedMgr(mgr) {
  return Math.round(mgr.x).toString() + " " + Math.round(mgr.y).toString();
}

// converts x/y diff into mils (0-6400) instead of degrees
function getAzimuth(xDiff, yDiff) {
  if (xDiff === 0) {
    // Vertical
    if (yDiff > 0) {
      // Upwards
      return 6400;
    } else {
      // Downwards
      return 3200;
    }
  } else {
    let angle = Math.atan(yDiff / xDiff);
    if (xDiff > 0) {
      // 1st & 4th quadrant
      return Math.floor(1600 - (angle / (2 * Math.PI)) * 6400);
    } else {
      // 2nd & 3rd quadrant
      return Math.floor(4800 - (angle / (2 * Math.PI)) * 6400);
    }
  }
}
