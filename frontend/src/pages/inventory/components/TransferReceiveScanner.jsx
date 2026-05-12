import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

/**
 * TransferReceiveScanner (Headless)
 * ---------------------------------
 * ✔ No API
 * ✔ No SmartSelect
 * ✔ Barcode-first
 * ✔ Local resolve only
 * ✔ Ultra fast
 */
const TransferReceiveScanner = forwardRef(
  ({ items = [], onScan, disabled = false }, ref) => {
    const inputRef = useRef(null);
    const [value, setValue] = useState("");

    /* ===============================
       Imperative API
    =============================== */
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => setValue(""),
      clearAndFocus: () => {
        setValue("");
        inputRef.current?.focus();
      },
    }));

    /* ===============================
       Auto Focus
    =============================== */
    useEffect(() => {
      if (!disabled) {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }, [disabled]);

    /* ===============================
       Resolve scanned value
    =============================== */
    const resolveItem = (code) => {
      return items.find(
        (i) =>
          i.variant?.sku === code ||
          String(i.variant?._id) === code
      );
    };

    /* ===============================
       Handle ENTER (Barcode scan)
    =============================== */
    const handleKeyDown = (e) => {
      if (e.key !== "Enter") return;

      const code = value.trim();
      if (!code) return;

      const found = resolveItem(code);

      if (found) {
        onScan(found);
      }

      setValue("");
    };

    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "Receiving not allowed"
              : "Scan barcode and press Enter"
          }
          className={`
            w-full
            text-lg
            px-4 py-3
            rounded-xl
            border-2
            outline-none
            transition
            ${
              disabled
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
            }
          `}
          autoComplete="off"
          spellCheck="false"
        />

        {!disabled && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            ⏎ Enter
          </div>
        )}
      </div>
    );
  }
);

export default TransferReceiveScanner;
