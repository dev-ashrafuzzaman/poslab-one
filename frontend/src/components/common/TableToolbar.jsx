import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  Maximize,
  Printer,
  FileDown,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";


export default function TableToolbar({
  config,
  query,
  setQuery,
  onPrint,
  onExport,
  modalButton
}) {
  const [searchValues, setSearchValues] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle search
  const handleSearchChange = (key, value) => {
    setSearchValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchSubmit = (key) => {
    setQuery(key, searchValues[key] || "");
  };

  // ✅ Apply queries for dropdowns / date / number range
  const applyQuery = (key, value) => {
    setQuery(key, value);
  };

  const resetFilters = () => {
    Object.keys(query).forEach((key) => setQuery(key, ""));
    setSearchValues({});
    setTempValues({});
  };

  const hasActiveQuery = Object.values(query).some((v) => v && v !== "");

  return (
    <div ref={wrapperRef} className="w-full bg-white p-3 ">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800">
          {config.title || "Table Title"}
        </h2>

        {/* Filters / Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 🔍 Search */}
          {config.search?.map((item, idx) => (
            <div key={idx} className="flex items-center">
              <input
                type="text"
                placeholder={item.placeholder || "Search..."}
                className="px-3 py-2 text-sm border border-gray-300 rounded-s-md"
                value={searchValues[item.queryKey] || ""}
                onChange={(e) =>
                  handleSearchChange(item.queryKey, e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearchSubmit(item.queryKey)
                }
              />
              <button
                onClick={() => handleSearchSubmit(item.queryKey)}
                className="bg-[var(--primary)] hover:bg-[var(--secondary)] text-white px-3 py-[11px] rounded-e-md">
                <Search size={16} />
              </button>
            </div>
          ))}

          {/* 🧭 Select Filters */}
          {config.filters?.map((filter, idx) => (
            <div key={idx} className="relative">
              <button
                className="flex items-center gap-2 border border-dashed border-gray-300 px-3 py-2 rounded-md text-sm hover:border-blue-400"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === filter.queryKey ? null : filter.queryKey
                  )
                }>
                {filter.label} <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {openDropdown === filter.queryKey && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 mt-2 bg-white shadow-lg border border-gray-200 rounded-md z-50 w-56 p-2">
                    {/* Search inside dropdown */}
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full border rounded px-2 py-1 text-sm mb-2"
                      value={tempValues[`${filter.queryKey}_search`] || ""}
                      onChange={(e) =>
                        setTempValues((p) => ({
                          ...p,
                          [`${filter.queryKey}_search`]: e.target.value,
                        }))
                      }
                    />
                    <div className="max-h-40 overflow-y-auto text-sm">
                      {filter.options
                        .filter((opt) =>
                          opt.label
                            .toLowerCase()
                            .includes(
                              (
                                tempValues[`${filter.queryKey}_search`] || ""
                              ).toLowerCase()
                            )
                        )
                        .map((opt) => {
                          const selected = (query[filter.queryKey] || "")
                            .split(",")
                            .includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={(e) => {
                                  let values = (query[filter.queryKey] || "")
                                    .split(",")
                                    .filter(Boolean);
                                  if (e.target.checked) {
                                    values.push(opt.value);
                                  } else {
                                    values = values.filter(
                                      (v) => v !== opt.value
                                    );
                                  }
                                  applyQuery(filter.queryKey, values.join(","));
                                }}
                              />
                              {opt.label}
                            </label>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* 📅 Date Range */}
          {config.dateRange?.enabled && (
            <div className="relative">
              <button
                className="flex items-center gap-2 border border-dashed border-gray-300 px-3 py-2 rounded-md text-sm hover:border-blue-400"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "dateRange" ? null : "dateRange"
                  )
                }>
                {query.startDate && query.endDate
                  ? `${query.startDate} → ${query.endDate}`
                  : "Select Date Range"}
              </button>

              {openDropdown === "dateRange" && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg p-3 z-50 w-64">
                  <label className="text-xs text-gray-500">Start Date</label>
                  <input
                    type="date"
                    className="border px-2 py-1 w-full rounded text-sm"
                    onChange={(e) =>
                      setTempValues((p) => ({
                        ...p,
                        startDate: e.target.value,
                      }))
                    }
                  />
                  <label className="text-xs text-gray-500 mt-2 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="border px-2 py-1 w-full rounded text-sm"
                    onChange={(e) =>
                      setTempValues((p) => ({ ...p, endDate: e.target.value }))
                    }
                  />
                  <button
                    className="w-full bg-blue-600 text-white text-sm mt-2 rounded py-1.5 hover:bg-blue-700"
                    onClick={() => {
                      setQuery("startDate", tempValues.startDate || "");
                      setQuery("endDate", tempValues.endDate || "");
                      setOpenDropdown(null);
                    }}>
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 🔢 Number Range */}
          {config.numberRange?.enabled && (
            <div className="relative">
              <button
                className="flex items-center gap-2 border border-dashed border-gray-300 px-3 py-2 rounded-md text-sm hover:border-blue-400"
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "numberRange" ? null : "numberRange"
                  )
                }>
                {query.minValue && query.maxValue
                  ? `${query.minValue} - ${query.maxValue}`
                  : config.numberRange.label}
              </button>

              {openDropdown === "numberRange" && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg p-3 z-50 w-56">
                  <input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Min"
                    className="border px-2 py-1 rounded text-sm mb-2"
                    onChange={(e) =>
                      setTempValues((p) => ({ ...p, minValue: e.target.value }))
                    }
                  />
                  <input
                    type="number"
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Max"
                    className="border px-2 py-1 rounded text-sm"
                    onChange={(e) =>
                      setTempValues((p) => ({ ...p, maxValue: e.target.value }))
                    }
                  />
                  <button
                    className="w-full bg-blue-600 text-white text-sm rounded py-1.5 mt-2 hover:bg-blue-700"
                    onClick={() => {
                      setQuery("minValue", tempValues.minValue || "");
                      setQuery("maxValue", tempValues.maxValue || "");
                      setOpenDropdown(null);
                    }}>
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 🔁 Reset */}
          {config.links && (
            <Button
              variant={config?.links?.[0].variant}
              onClick={() => navigate(config?.links?.[0].href)}
              size=""
              className="py-1.5 px-2"
             >
              {config?.links?.[0].label}
            </Button>
          )}

          {hasActiveQuery && (
            <button
              onClick={resetFilters}
              className="border px-3 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-gray-50">
              <RefreshCw size={16} /> Reset
            </button>
          )}

           {modalButton && (
            <Button
            className="py-1.5 px-2"
              variant={modalButton.variant || "primary"}
              size={modalButton.size || ""}
              onClick={modalButton.onClick}
            >
              {modalButton.label}
            </Button>
          )}

        </div>
      </div>
    </div>
  );
}
