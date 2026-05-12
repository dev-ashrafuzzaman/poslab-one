import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import SmartSelect from "../../../components/common/SmartSelect";

const TransferItemSearch = forwardRef(
  ({ fromBranchId, onSelect, disabled }, ref) => {
    const selectRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => selectRef.current?.focus?.(),
      clear: () => selectRef.current?.clearValue?.(),
      clearAndFocus: () => {
        selectRef.current?.clearValue?.();
        selectRef.current?.focus?.();
      },
    }));

    useEffect(() => {
      if (!disabled) {
        requestAnimationFrame(() => {
          selectRef.current?.focus?.();
        });
      }
    }, [disabled, fromBranchId]);

    return (
      <SmartSelect
        key={`transfer-search-${fromBranchId || "none"}`}
        ref={selectRef}
        disabled={disabled}
        customRoute="/stocks/transfer-items"
        extraParams={{ fromBranchId }}
        barcode
        debounceTime={150}
        displayField={["sku", "productName"]}
        idField="variantId"
        placeholder={
          disabled
            ? "Select source branch first"
            : "Scan barcode or search item"
        }
        onChange={(opt) => {
          if (opt?.raw) onSelect(opt.raw);
        }}
        className="
          text-lg py-3
          border-2 border-gray-300
          focus:border-blue-600
          focus:ring-1 focus:ring-blue-200
        "
      />
    );
  }
);

export default TransferItemSearch;
