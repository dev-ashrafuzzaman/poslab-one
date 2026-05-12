import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import SmartSelect from "../../../components/common/SmartSelect";

/**
 * PosItemSearch
 * ----------------------------------
 * ✔ Barcode scan (ENTER)
 * ✔ Typing search (async)
 * ✔ Auto focus
 * ✔ Keyboard shortcuts
 * ✔ Cursor pagination supported
 * ✔ Reusable (POS / Stock Transfer)
 */
const PosItemSearch = forwardRef(
  (
    {
      onSelect,
      placeholder = "Scan barcode or search item",
      disabled = false,
      autoFocus = true,
      branchId = null, // optional override
    },
    ref
  ) => {
    const selectRef = useRef(null);

    /* ---------------- Expose Methods ---------------- */
    useImperativeHandle(ref, () => ({
      focus: () => selectRef.current?.focus?.(),
      clear: () => selectRef.current?.clearValue?.(),
      clearAndFocus: () => {
        selectRef.current?.clearValue?.();
        selectRef.current?.focus?.();
      },
    }));

    /* ---------------- Auto Focus ---------------- */
    useEffect(() => {
      if (!autoFocus) return;
      requestAnimationFrame(() => {
        selectRef.current?.focus?.();
      });
    }, [autoFocus]);

    /* ---------------- Keyboard Shortcuts ---------------- */
    useEffect(() => {
      const handleKey = (e) => {
        // F2 → focus search
        if (e.key === "F2") {
          e.preventDefault();
          selectRef.current?.focus?.();
        }

        // ESC → clear + focus
        if (e.key === "Escape") {
          e.preventDefault();
          selectRef.current?.clearValue?.();
          selectRef.current?.focus?.();
        }
      };

      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return (
      <div className="relative">
        <SmartSelect
          ref={selectRef}
          disabled={disabled}
          customRoute="/stocks/pos-items"
          extraParams={{
            branchId, // backend will ignore if null
          }}
          barcode
          preLoad={false}
          debounceTime={150}
          displayField={["sku", "productName"]}
          idField="variantId"
          placeholder={placeholder}
          onChange={(opt) => {
            if (!opt?.raw) return;
            onSelect?.(opt.raw);
          }}
          className="
            text-lg py-3
            border-2 border-gray-300
            focus:border-blue-600
            focus:ring-1 focus:ring-blue-200
          "
        />
      </div>
    );
  }
);

export default PosItemSearch;
