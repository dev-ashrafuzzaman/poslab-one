import { useMemo, useRef } from "react";
import SmartSelect from "./SmartSelect";
import { Search } from "lucide-react";

export default function CustomerSelect({ value, onChange, error }) {
  const ref = useRef();

  const selected = useMemo(() => {
    if (!value) return null;
    return {
      value: value._id,
      label: `${value.phone} — ${value.name}`,
      raw: value,
    };
  }, [value]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-400" />
      </div>

      <SmartSelect
        ref={ref}
        customRoute="/pos/customers/search"
        displayField={["phone", "name"]}
        idField="_id"
        minSearchLength={11}
        phoneInstant
        phoneLength={11}
        value={selected}
        onChange={(opt) => onChange(opt?.raw || null)}
        error={error}
        className="pl-10"
      />
    </div>
  );
}
