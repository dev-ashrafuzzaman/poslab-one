import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Input from "./Input";

/*
  Headless Async Select
  --------------------
  loadOptions(search, page) => Promise<{ label, value }[]>
*/

export default function AsyncSelect({
  label,
  placeholder = "Search...",
  loadOptions,
  value,
  onChange,
  error,
  disabled = false,
  limit = 10,
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  /* -----------------------------
     Load options (API)
  ------------------------------ */
  const fetchOptions = useCallback(
    async (search = "") => {
      setLoading(true);
      try {
        const res = await loadOptions(search, 1, limit);
        setOptions(res || []);
      } catch (e) {
        console.error(e);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [loadOptions, limit]
  );

  /* -----------------------------
     Open & load default (click)
  ------------------------------ */
  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setHighlight(-1);

    if (options.length === 0) {
      fetchOptions("");
    }
  };

  /* -----------------------------
     Debounced search
  ------------------------------ */
  useEffect(() => {
    if (!open) return;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchOptions(query);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, open, fetchOptions]);

  /* -----------------------------
     Close on outside click
  ------------------------------ */
  useEffect(() => {
    const handleClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
        setHighlight(-1);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  /* -----------------------------
     Keyboard navigation
  ------------------------------ */
  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) =>
        Math.min(h + 1, options.length - 1)
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }

    if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      selectOption(options[highlight]);
    }

    if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  };

  /* -----------------------------
     Select option
  ------------------------------ */
  const selectOption = (opt) => {
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
    setHighlight(-1);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={handleKeyDown}
    >
      <Input
        label={label}
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        error={error}
        onFocus={openDropdown}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Loading...
            </div>
          )}

          {!loading && options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">
              No results found
            </div>
          )}

          {!loading &&
            options.map((opt, idx) => (
              <div
                key={opt.value}
                onMouseDown={() => selectOption(opt)}
                className={`px-3 py-2 text-sm cursor-pointer
                  ${
                    idx === highlight
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
              >
                {opt.label}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
