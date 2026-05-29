import { useEffect, useState, useRef, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import useApi from "../../hooks/useApi";
import clsx from "clsx";

export default function ReportSmartSelect({
  label,
  value,
  onChange,
  route,
  extraParams = {},
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
  const listRef = useRef(null);

  const buildQuery = useCallback((pageNo, searchText = "") => {
    const params = new URLSearchParams({
      page: pageNo,
      limit,
      ...extraParams,
    });
    if (searchText) params.set("search", searchText);
    return `${route}?${params.toString()}`;
  }, [route, limit, extraParams]);

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

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await request(buildQuery(1, search), "GET", {}, { useToast: false });
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

  const handleScroll = useCallback(async (e) => {
    if (!hasMore || loading) return;
    const el = e.target;
    if (el.scrollTop + el.clientHeight + 40 >= el.scrollHeight) {
      setLoading(true);
      try {
        const res = await request(buildQuery(page, search), "GET", {}, { useToast: false });
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderLabel = (item) =>
    displayField.map((f) => item[f]).filter(Boolean).join(" - ");

  return (
    <div className={clsx("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 select-none">
          {label}
        </label>
      )}

      {/* Trigger Area - Perfectly Aligned Height */}
      <div
        className={clsx(
          "flex items-center justify-between w-full pl-10 pr-4 h-10", 
          "border border-gray-300 dark:border-gray-600 rounded-lg", 
          "bg-white dark:bg-dark-800 text-sm text-gray-900 dark:text-gray-100",
          "transition-all duration-150 select-none",
          disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : "cursor-pointer hover:border-gray-400",
          open && "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30"
        )}
        onClick={() => {
          if (disabled) return;
          const nextState = !open;
          setOpen(nextState);
          if (nextState) {
            loadInitial();
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      >
        <div className="flex-1 truncate">
          <span className={clsx(value ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-400", "truncate")}>
            {value ? renderLabel(value) : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {loading && isInitialLoad && <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </div>

      {/* Floating Panel Box - Renders perfectly over table contents */}
      {open && !disabled && (
        <div 
          className="absolute left-0 top-[calc(100%+4px)] w-full bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 shadow-xl overflow-hidden"
          style={{ zIndex: 999 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-gray-100 dark:border-dark-700 bg-gray-50/70 dark:bg-dark-900/50">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter..."
                className="w-full pl-8 pr-2.5 h-8 text-xs bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div 
            ref={listRef} 
            className="overflow-y-auto max-h-45" 
            onScroll={handleScroll}
          >
            {items.length === 0 && !loading ? (
              <div className="py-5 text-center text-xs text-gray-400">No results found</div>
            ) : (
              <>
                {items.map((item) => {
                  const isSelected = value?.[valueField] === item[valueField];
                  return (
                    <div
                      key={item[valueField]}
                      className={clsx(
                        "px-4 py-2 text-xs cursor-pointer transition-colors border-b border-gray-50 dark:border-dark-700/30 last:border-b-0",
                        isSelected ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-50 text-gray-700 dark:text-gray-300"
                      )}
                      onClick={() => {
                        onChange(item);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      {renderLabel(item)}
                    </div>
                  );
                })}
                {loading && (
                  <div className="p-2 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-500" /> Loading...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}