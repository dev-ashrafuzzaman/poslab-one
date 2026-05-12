// components/table/TableToolbar.jsx
import { Search, RefreshCw } from "lucide-react";

export default function TableToolbar({
  title,
  tabs = [],
  activeTab,
  onTabChange,
  config = {},
  table,
}) {
  const { query = {}, setQuery, resetQuery } = table;

  return (
    <div className="bg-white rounded-xl border border-gray-200  px-6 py-4 flex items-center justify-between">
      {/* Left: Title + Tabs */}
      <div className="flex items-center gap-4">
        {title && (
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        )}

        {tabs.length > 0 && (
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  onTabChange?.(t.value);
                  setQuery(t.queryKey || "status", t.value);
                }}
                className={`
                  px-3 py-1.5 text-sm rounded-md border
                  ${
                    activeTab === t.value
                      ? "bg-gray-100 border-gray-300 text-gray-900"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }
                `}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Search + Filters + Reset */}
      <div className="flex items-center gap-2">
        {/* 🔍 Search */}
        {config.search?.enabled && (
          <div className="relative flex items-center">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              defaultValue={query.search || ""}
              placeholder={config.search.placeholder || "Search..."}
              className="
                 pl-11 pr-4 py-2.5 w-full
                  border border-gray-300 rounded-lg text-sm
                  bg-gray-50/50 focus:bg-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                  transition-all duration-200
                  placeholder:text-gray-400
              "
              onKeyDown={(e) =>
                e.key === "Enter" && setQuery("search", e.target.value)
              }
            />
          </div>
        )}

        {/* 🔽 Filters */}
        {config.filters?.map((f) => (
          <select
            key={f.queryKey}
            value={query[f.queryKey] || ""}
            onChange={(e) => setQuery(f.queryKey, e.target.value)}
            className="
           flex items-center gap-2 text-sm font-medium px-3 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors
            ">
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        {/* 🔁 Reset */}
        {Object.keys(query).length > 0 && (
          <button
            onClick={resetQuery}
            className="
             flex items-center gap-2
                px-4 py-2.5 text-sm font-medium
                border border-gray-300 rounded-lg
                text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400
                active:bg-gray-100
                transition-all duration-150
                group
            ">
            <RefreshCw size={14} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
