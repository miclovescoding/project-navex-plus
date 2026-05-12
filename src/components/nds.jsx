import { useState, useEffect } from "react";

export default function NDS({ nds, loading }) {
  let [displayNds, setDisplayNds] = useState(nds);
  
  useEffect(() => {
    if (!loading) {
      setDisplayNds(nds);
    }
  }, [nds, loading]);

  return (
    <>
      <table className={`mx-auto my-7 w-11/12 border-2 border-solid border-black ${loading && "opacity-50"}`}>
        <thead className="bg-green">
          <tr>
            <TableCell>No.</TableCell>
            <TableCell>Start MGR</TableCell>
            <TableCell>End MGR</TableCell>
            <TableCell>Mil</TableCell>
            <TableCell>Dist.</TableCell>
          </tr>
        </thead>
        <tbody>
          {displayNds.map((row, index) => (
            <tr
              key={index}
              className={`${index % 2 == 0 && "bg-[#212121]"} ${row.is_checkpoint && "text-yellow-100"}`}
            >
              <TableCell>{index}</TableCell>
              <TableCell>{row.start_x} {row.start_y}</TableCell>
              <TableCell>{row.end_x} {row.end_y}</TableCell>
              <TableCell>{row.azimuth}</TableCell>
              <TableCell>{row.distance}</TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function TableCell({ children }) {
  return (
    <td className="border-2 border-solid border-black text-center">
      {children}
    </td>
  );
}