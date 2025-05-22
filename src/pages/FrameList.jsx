import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const FrameList = () => {
  const [frames, setFrames] = useState([]);
  const FRAME_WIDTH = 1640;
  const FRAME_HEIGHT = 1232;
  const FRAME_AREA = FRAME_WIDTH * FRAME_HEIGHT;

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/frames?limit=20`);
        setFrames(res.data);
      } catch (err) {
        console.error("Failed to load frames:", err);
      }
    };

    fetchFrames();
    const interval = setInterval(fetchFrames, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {frames.map((frame) => {
          const confColor =
            frame.confidence > 0.8 ? "text-green-600" : frame.confidence > 0.5 ? "text-yellow-600" : "text-red-600";

          return (
            <div
              key={frame._id}
              className={`border p-2 rounded shadow ${frame.shouldTrigger ? "border-green-400" : "border-gray-300"}`}
            >
              <img src={frame.imageUrl} alt={`frame ${frame.imageUrl}`} className="w-auto rounded object-cover" />
              <div className="flex flex-col justify-between text-sm w-full -mt-6">
                <div className="text-gray-600 text-xs mb-2 flex">
                  <div className="bg-white p-1 py-0.5">{dayjs(frame.timestamp).format("M.DD | h:mm:ss a")}</div>
                </div>
                <div className={`font-semibold ${frame.shouldTrigger ? "text-green-600" : "text-gray-500"}`}>
                  {frame.shouldTrigger ? "✅ Triggered" : "🚫 Stagnant"}
                </div>
                {frame.reason && <div className="text-xs text-gray-400 italic mb-2">{frame.reason}</div>}
                {frame.confidence !== undefined && (
                  <div className={`text-xs ${confColor}`}>
                    Conf: <strong>{(frame.confidence * 100).toFixed(1)}%</strong>
                  </div>
                )}
                {frame.personCount !== undefined && (
                  <div className="text-xs text-gray-400">People: {frame.personCount}</div>
                )}
                {frame.stationaryCount !== undefined && (
                  <div className="text-xs text-gray-400">Stationary: {frame.stationaryCount}</div>
                )}

                {/* 🆕 OBJECTS DETECTED */}
                {frame.rawResult?.objectsDetected && Object.keys(frame.rawResult.objectsDetected).length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    Objects:{" "}
                    {Object.entries(frame.rawResult.objectsDetected).map(([label, count], idx, arr) => (
                      <span key={label}>
                        {label} × {count}
                        {idx < arr.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                )}

                {/* HEIGHTS and AREAS display */}
                {(frame.rawResult.heights_px?.length > 0 || frame.rawResult.areas_px2?.length > 0) && (
                  <div className="mt-2 text-xs text-gray-400">
                    {frame.rawResult.heights_px?.length > 0 && (
                      <div>
                        H:{" "}
                        {frame.rawResult.heights_px.map((h, idx) => {
                          const heightPercent = (h / FRAME_HEIGHT) * 100;
                          return (
                            <span key={idx}>
                              {Math.round(h)}px ({heightPercent.toFixed(1)}%)
                              {idx < frame.rawResult.heights_px.length - 1 ? ", " : ""}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {frame.rawResult.areas_px2?.length > 0 && (
                      <div>
                        A:{" "}
                        {frame.rawResult.areas_px2.map((a, idx) => {
                          const areaPercent = (a / FRAME_AREA) * 100;
                          return (
                            <span key={idx}>
                              {Math.round(a).toLocaleString()}px² ({areaPercent.toFixed(2)}%)
                              {idx < frame.rawResult.areas_px2.length - 1 ? ", " : ""}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* DEBUG INFO */}
                {frame.debugInfo?.tracks && (
                  <details className="mt-1 text-xs text-gray-500">
                    <summary className="cursor-pointer">Track Debug Info</summary>
                    <ul className="pl-4 mt-1 space-y-1">
                      {Object.entries(frame.debugInfo.tracks).map(([trackId, info]) => (
                        <li key={trackId}>
                          <strong>#{trackId}</strong> — Len: {info.length} |{" "}
                          {info.triggered ? "🟢 Triggered" : "🔴 Not Triggered"} {" | "}
                          {typeof info.avg_score === "number" && !isNaN(info.avg_score)
                            ? `Score: ${(info.avg_score * 100).toFixed(1)}%`
                            : "Score: —"}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FrameList;
