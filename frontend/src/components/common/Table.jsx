import React, { useState, useMemo, useRef } from "react";
import TableToolbar from "./TableToolbar";
import TableActions from "./TableActions";

export default function Table({
  columns,
  data,
  actions,
  pageSize = 14,
  config,
  query,
  setQuery,
  modalButton,
  onSuccess,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const modalContainerRef = useRef(null);

  const getNestedValue = (obj, key) => {
    return key.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const valA = getNestedValue(a, sortConfig.key);
        const valB = getNestedValue(b, sortConfig.key);
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        {/* Search / Toolbar */}
        <div className="p-2 border-b border-gray-200 flex justify-end items-center">
          <TableToolbar
            config={config}
            query={query}
            setQuery={setQuery}
            modalButton={modalButton}
          />
        </div>

        {/* Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 capitalize text-left text-sm font-medium text-gray-700  ${
                    col.sortable ? "cursor-pointer hover:text-blue-600" : ""
                  }`}
                  style={{ width: col.width }}
                  onClick={
                    col.sortable ? () => requestSort(col.key) : undefined
                  }>
                  <div className={`${col.css}`}>
                    {col.label}
                    {sortConfig.key === col.key ? (
                      <span className="ml-1 text-gray-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    ) : null}
                  </div>
                </th>
              ))}
              {actions?.length > 0 && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions?.length || 0)}
                  className="text-center py-4 text-gray-400">
                  No data found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      onClick={col.onClick ? () => col.onClick(row) : undefined}
                      className={`px-4 py-3 text-sm text-gray-700 ${col.css}`}>
                      {col.render
                        ? col.render(getNestedValue(row, col.key), row)
                        : getNestedValue(row, col.key)}
                    </td>
                  ))}

                  {actions?.length > 0 && (
                    <TableActions
                      actions={actions}
                      row={row}
                      onSuccess={onSuccess}
                      modalContainer={modalContainerRef}
                    />
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200">
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50">
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {modalContainerRef.current}
    </>
  );
}
