import React from "react";

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyText = "No data found",
}) {
  return (
    <div className="w-full overflow-x-auto border rounded-lg bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                Loading...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400"
              >
                {emptyText}
              </td>
            </tr>
          )}

          {!loading &&
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b hover:bg-gray-50 transition"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-gray-700 whitespace-nowrap"
                  >
                    {typeof col.render === "function"
                      ? col.render(row)
                      : row[col.key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
