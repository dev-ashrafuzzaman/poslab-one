import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import SmartSelect from "../../../components/common/SmartSelect";

const PosItemSearch = forwardRef(({ onSelect }, ref) => {
  const selectRef = useRef(null);

  /* 🔥 Expose focus / clear to parent */
  useImperativeHandle(ref, () => ({
    focus: () => {
      selectRef.current?.focus?.();
    },
    clear: () => {
      selectRef.current?.clearValue?.();
    },
    clearAndFocus: () => {
      selectRef.current?.clearValue?.();
      selectRef.current?.focus?.();
    },
  }));

  /* 🔥 AUTO FOCUS ON POS SCREEN LOAD */
  useEffect(() => {
    requestAnimationFrame(() => {
      selectRef.current?.focus?.();
    });
  }, []);

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
        customRoute="/stocks/pos-items"
        barcode
        displayField={["sku", "productName"]}
        idField="variantId"
        placeholder="Scan barcode or search item"
        onChange={(opt) => {
          if (opt?.raw) onSelect(opt.raw);
        }}
        className="border-2 border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-200 text-lg py-3"
      />
    </div>
  );
});

export default PosItemSearch;
