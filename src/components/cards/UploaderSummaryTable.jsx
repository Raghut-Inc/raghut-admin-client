import React from "react";
import { timeAgo } from "../../utils/timeAgo";

const UploaderSummaryTable = ({ rows = [], total = 0, onFilter }) => {
  return (
    <div className="w-full bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Uploader</th>
              <th className="px-4 py-2 text-right font-medium">Up/Q.</th>
              <th className="px-4 py-2 text-left font-medium">First</th>
              <th className="px-4 py-2 text-left font-medium">Last</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                  No data
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr onClick={() => onFilter(r)} key={`${r.kind}:${r.displayId}`} className="border-t text-xs">
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900">
                      {r.displayName || (r.kind === "guest" ? "Guest" : "User")}
                    </div>
                    <div className="text-gray-500 text-xs">{r.displayId.slice(0, 6)}...</div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {r.uploads}/{r.totalQuestions}
                  </td>
                  <td className="px-4 py-2">{timeAgo(r.firstAt)}</td>
                  <td className="px-4 py-2">{timeAgo(r.lastAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t text-xs text-gray-500">
        Showing most recent uploader groups. Use “Filter” to inspect their individual uploads.
      </div>
    </div>
  );
};

export default UploaderSummaryTable;
