import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { toast } from "sonner";
import useAxiosSecure from "../../hooks/useAxiosSecure";

/* ---------------- Utils ---------------- */
const isNumeric = (v) => /^[0-9]+$/.test(v);

/**
 * SmartSelect v2 – Clean & Optimized
 * ----------------------------------
 * ✔ Preload support
 * ✔ POS barcode scan (ENTER)
 * ✔ ERP async search
 * ✔ Phone instant select
 * ✔ Infinite scroll
 * ✔ Cache aware
 * ✔ Keyboard-first
 */
const SmartSelect = forwardRef(
  (
    {
      /* API */
      customRoute,
      extraParams = {},

      /* Value */
      value,
      onChange,

      /* UI */
      placeholder = "Search...",
      disabled = false,

      /* Mapping */
      displayField = ["name"],
      idField = "_id",

      /* Pagination */
      pageSize = 10,

      /* NEW */
      preLoad = false,

      /* POS */
      barcode = false,
      skuLength = 9,

      /* ERP */
      minSearchLength = 1,

      /* Phone instant */
      phoneInstant = false,
      phoneLength = 10,
    },
    ref,
  ) => {
    const { axiosSecure } = useAxiosSecure();

    const selectRef = useRef(null);
    const cacheRef = useRef(new Map());

    const [menuOpen, setMenuOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    /* ---------------- Label Builder ---------------- */
    const getLabel = useCallback(
      (item) =>
        displayField
          .map((f) => item?.[f])
          .filter(Boolean)
          .join(" — "),
      [displayField],
    );

    const toOption = useCallback(
      (item) => ({
        value: item[idField],
        label: getLabel(item),
        raw: item,
      }),
      [idField, getLabel],
    );

    /* ---------------- Fetch ---------------- */
    const fetchOptions = useCallback(
      async (search = "", pageNo = 1) => {
        const cacheKey = `${customRoute}_${search}_${pageNo}`;

        if (cacheRef.current.has(cacheKey)) {
          return cacheRef.current.get(cacheKey);
        }

        setLoading(true);
        try {
          const res = await axiosSecure.get(customRoute, {
            params: {
              search,
              page: pageNo,
              limit: pageSize,
              ...extraParams,
            },
          });

          const rows = res.data?.data || [];
          const mapped = rows.map(toOption);

          cacheRef.current.set(cacheKey, mapped);
          setHasMore(Boolean(res.data?.pagination?.hasMore));

          return mapped;
        } catch {
          toast.error("Failed to load data");
          return [];
        } finally {
          setLoading(false);
        }
      },
      [axiosSecure, customRoute, pageSize, extraParams, toOption],
    );

    /* ---------------- Preload ---------------- */
    useEffect(() => {
      if (!preLoad) return;

      (async () => {
        setPage(1);
        const data = await fetchOptions("", 1);
        setOptions(data);
      })();
    }, [preLoad, fetchOptions]);

    /* ---------------- Async Loader ---------------- */
    const loadOptions = useMemo(
      () =>
        debounce(async (input, cb) => {
          if (!barcode && input.length < minSearchLength) {
            cb(preLoad ? options : []);
            return;
          }

          setPage(1);
          const data = await fetchOptions(input, 1);
          setOptions(data);
          cb(data);
        }, 300),
      [fetchOptions, barcode, minSearchLength, preLoad, options],
    );

    useEffect(() => () => loadOptions.cancel(), [loadOptions]);

    /* ---------------- Selected Value Mapper ---------------- */
    const selectedOption = useMemo(() => {
      if (!value) return null;

      // already option হলে 그대로 দাও (backward safety)
      if (value?.value && value?.label) {
        return value;
      }

      // raw object → option
      return {
        value: value[idField],
        label: getLabel(value),
        raw: value,
      };
    }, [value, idField, getLabel]);

    /* ---------------- Infinite Scroll ---------------- */
    const handleScrollBottom = async () => {
      if (!hasMore || loading) return;

      const nextPage = page + 1;
      const more = await fetchOptions(inputValue, nextPage);

      setOptions((prev) => [...prev, ...more]);
      setPage(nextPage);
    };

    /* ---------------- POS Barcode ---------------- */
    const handleEnter = async () => {
      if (!barcode || inputValue.length < skuLength) return;

      const result = await fetchOptions(inputValue, 1);

      if (result.length) {
        onChange(result[0]);
      } else {
        toast.error("Item not found");
      }

      resetInput();
    };

    /* ---------------- Phone Instant ---------------- */
    const handlePhoneInstant = useCallback(
      async (val) => {
        const result = await fetchOptions(val, 1);

        if (result.length === 1) {
          onChange(result[0]);
          resetInput();
        } else if (!result.length) {
          toast.error("Customer not found");
        }
      },
      [fetchOptions, onChange],
    );

    /* ---------------- Helpers ---------------- */
    const resetInput = () => {
      setInputValue("");
      setMenuOpen(false);
      selectRef.current?.blur();
      selectRef.current?.focus();
    };

    /* ---------------- Render ---------------- */
    return (
      <AsyncSelect
        ref={(el) => {
          selectRef.current = el;
          if (ref) ref.current = el;
        }}
        menuIsOpen={menuOpen}
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
        cacheOptions={false}
        defaultOptions={preLoad ? options : false}
        loadOptions={loadOptions}
        onMenuScrollToBottom={handleScrollBottom}
        value={selectedOption}
        onChange={onChange}
        placeholder={placeholder}
        isDisabled={disabled}
        isLoading={loading}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        inputValue={inputValue}
        onInputChange={(val, meta) => {
          if (meta.action === "input-change") {
            setInputValue(val);
          }
          if (meta.action === "set-value" || meta.action === "menu-close") {
            setInputValue("");
          }

          setInputValue(val);

          if (phoneInstant && isNumeric(val) && val.length >= phoneLength) {
            handlePhoneInstant(val);
          }
        }}
        onKeyDown={(e) => {
          if (barcode && e.key === "Enter") {
            e.preventDefault();
            handleEnter();
          }
        }}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: 42,
            borderRadius: 10,
            fontSize: 15,
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    );
  },
);

export default React.memo(SmartSelect);
