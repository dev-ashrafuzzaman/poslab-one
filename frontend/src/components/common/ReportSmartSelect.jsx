import { useEffect, useState, useRef, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import useApi from "../../hooks/useApi";
import clsx from "clsx";

/**
 * ReportSmartSelect
 * -----------------
 * ✔ Focus করলে initial load (20 items)
 * ✔ Search করলে backend ?search=
 * ✔ Infinite scroll (hasMore)
 * ✔ Large data safe (ERP ready)
 */
export default function ReportSmartSelect({
  label,
  value,
  onChange,

  route,              // "/categories"
  extraParams = {},   // { level: 1 }
  displayField = ["name"],
  valueField = "_id",

  placeholder = "Select...",
  disabled = false,
  limit = 20,
  className = "",
}) {
  const { request } = useApi();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  /* ===============================
     Build Query Params
  =============================== */
  const buildQuery = useCallback((pageNo, searchText = "") => {
    const params = new URLSearchParams({
      page: pageNo,
      limit,
      ...extraParams,
    });

    if (searchText) params.set("search", searchText);

    return `${route}?${params.toString()}`;
  }, [route, limit, extraParams]);

  /* ===============================
     Initial Load (on focus)
  =============================== */
  const loadInitial = useCallback(async () => {
    if (items.length > 0 || loading) return;

    setIsInitialLoad(true);
    setLoading(true);
    try {
      const res = await request(buildQuery(1), "GET", {}, { useToast: false });
      setItems(res?.data || []);
      setHasMore(res?.pagination?.hasMore ?? false);
      setPage(2);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [items.length, loading, request, buildQuery]);

  /* ===============================
     Search
  =============================== */
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await request(
          buildQuery(1, search),
          "GET",
          {},
          { useToast: false }
        );
        setItems(res?.data || []);
        setHasMore(res?.pagination?.hasMore ?? false);
        setPage(2);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open, request, buildQuery]);

  /* ===============================
     Infinite Scroll
  =============================== */
  const handleScroll = useCallback(async (e) => {
    if (!hasMore || loading) return;

    const el = e.target;
    if (el.scrollTop + el.clientHeight + 40 >= el.scrollHeight) {
      setLoading(true);
      try {
        const res = await request(
          buildQuery(page, search),
          "GET",
          {},
          { useToast: false }
        );
        setItems((prev) => [...prev, ...(res?.data || [])]);
        setHasMore(res?.pagination?.hasMore ?? false);
        setPage((p) => p + 1);
      } catch (error) {
        console.error("Load more failed:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [hasMore, loading, page, search, request, buildQuery]);

  /* ===============================
     Outside Click & Key Navigation
  =============================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* ===============================
     Render Label
  =============================== */
  const renderLabel = (item) =>
    displayField.map((f) => item[f]).filter(Boolean).join(" - ");

  return (
    <div 
      className={clsx("relative", className)} 
      ref={containerRef}
    >
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Input Trigger */}
      <div
        className={clsx(
          "flex items-center justify-between w-full px-4 py-3",
          "border border-gray-300 rounded-lg",
          "bg-white text-sm text-gray-900",
          "transition-all duration-200",
          "hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200",
          disabled 
            ? "bg-gray-50 cursor-not-allowed opacity-60" 
            : "cursor-pointer hover:shadow-sm",
          open && "border-blue-500 ring-2 ring-blue-200"
        )}
        onClick={() => {
          if (disabled) return;
          setOpen(!open);
          if (!open) {
            loadInitial();
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }
        }}
      >
        <div className="flex-1 truncate">
          <span className={clsx(
            value ? "text-gray-900" : "text-gray-500",
            "truncate"
          )}>
            {value ? renderLabel(value) : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {loading && isInitialLoad && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          style={{
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
            maxHeight: "320px",
            minWidth: "250px",
          }}
        >
          {/* Search Header */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Items List */}
          <div 
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: "240px" }}
            onScroll={handleScroll}
          >
            {items.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Search className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No results found</p>
                {search && (
                  <p className="text-xs text-gray-400 mt-1">
                    Try a different search term
                  </p>
                )}
              </div>
            ) : (
              <>
                {items.map((item) => {
                  const isSelected = value?.[valueField] === item[valueField];
                  return (
                    <div
                      key={item[valueField]}
                      className={clsx(
                        "px-4 py-3 text-sm transition-colors duration-150 cursor-pointer border-b border-gray-100 last:border-b-0",
                        isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(item);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={clsx(
                          "truncate",
                          isSelected && "font-medium"
                        )}>
                          {renderLabel(item)}
                        </span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Loading Indicator */}
                {loading && (
                  <div className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-sm text-gray-500">
                        {search ? "Searching..." : "Loading more..."}
                      </span>
                    </div>
                  </div>
                )}

                {/* End of List */}
                {!hasMore && items.length > 0 && (
                  <div className="px-4 py-3 text-center">
                    <span className="text-xs text-gray-400">
                      {items.length} items • End of list
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Info */}
          {items.length > 0 && !loading && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">ESC</kbd> to close</span>
                <span>{items.length} items</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}