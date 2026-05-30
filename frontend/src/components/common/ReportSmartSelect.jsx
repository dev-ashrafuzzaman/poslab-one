import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
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
  onOpenStateChange,
  leftIcon: LeftIcon = null,
}) {
  const { request } = useApi();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const updateDropdownCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  const toggleDropdown = () => {
    if (disabled) return;
    const nextState = !open;
    setOpen(nextState);
    if (onOpenStateChange) onOpenStateChange(nextState);

    if (nextState) {
      updateDropdownCoords();
      loadInitial();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  useEffect(() => {
    if (open) {
      window.addEventListener("scroll", updateDropdownCoords, true);
      window.addEventListener("resize", updateDropdownCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateDropdownCoords, true);
      window.removeEventListener("resize", updateDropdownCoords);
    };
  }, [open, updateDropdownCoords]);

  const buildQuery = useCallback(
    (pageNo, searchText = "") => {
      const params = new URLSearchParams({
        page: pageNo,
        limit,
        ...extraParams,
      });
      if (searchText) params.set("search", searchText);
      return `${route}?${params.toString()}`;
    },
    [route, limit, extraParams],
  );

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
        const res = await request(
          buildQuery(1, search),
          "GET",
          {},
          { useToast: false },
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

  const handleScroll = useCallback(
    async (e) => {
      if (!hasMore || loading) return;
      const el = e.target;
      if (el.scrollTop + el.clientHeight + 40 >= el.scrollHeight) {
        setLoading(true);
        try {
          const res = await request(
            buildQuery(page, search),
            "GET",
            {},
            { useToast: false },
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
    },
    [hasMore, loading, page, search, request, buildQuery],
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !e.target.closest(".smart-select-portal-layer")
      ) {
        setOpen(false);
        if (onOpenStateChange) onOpenStateChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOpenStateChange]);

  const renderLabel = (item) =>
    displayField
      .map((f) => item[f])
      .filter(Boolean)
      .join(" - ");

  return (
    <div className={clsx("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 select-none">
          {label}
        </label>
      )}

      {/* Trigger Area */}
      <div
        className={clsx(
          "flex items-center justify-between w-full pr-4 h-10",
          "border border-gray-300 rounded-lg",
          "bg-white text-sm text-gray-900",
          "transition-all duration-150 select-none",
          disabled
            ? "bg-gray-50 cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-gray-400",
          open && "border-blue-500 ring-2 ring-blue-100",
          LeftIcon ? "pl-3" : "pl-10",
        )}
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 truncate">
          {LeftIcon && (
            <span className="text-gray-400 shrink-0">
              <LeftIcon className="w-4 h-4" />
            </span>
          )}
          <span
            className={clsx(
              value ? "text-gray-900 font-medium" : "text-gray-400",
              "truncate",
            )}
          >
            {value ? renderLabel(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {loading && isInitialLoad && (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {open &&
        !disabled &&
        createPortal(
          <div
            className="smart-select-portal-layer fixed bg-white rounded-lg border border-gray-200 shadow-2xl overflow-hidden"
            style={{
              position: "absolute",
              top: `${coords.top + 4}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
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
                  className="w-full pl-8 pr-2.5 h-8 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div
              ref={listRef}
              className="overflow-y-auto max-h-52 custom-scrollbar"
              onScroll={handleScroll}
            >
              {items.length === 0 && !loading ? (
                <div className="py-5 text-center text-xs text-gray-400">
                  No results found
                </div>
              ) : (
                <>
                  {items.map((item) => {
                    const isSelected = value?.[valueField] === item[valueField];
                    return (
                      <div
                        key={item[valueField]}
                        className={clsx(
                          "px-4 py-2 text-xs cursor-pointer transition-colors border-b border-gray-50 last:border-b-0",
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "hover:bg-gray-50 text-gray-700",
                        )}
                        onClick={() => {
                          onChange(item);
                          setOpen(false);
                          if (onOpenStateChange) onOpenStateChange(false);
                          setSearch("");
                        }}
                      >
                        {renderLabel(item)}
                      </div>
                    );
                  })}
                  {loading && (
                    <div className="p-2.5 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />{" "}
                      Loading...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
