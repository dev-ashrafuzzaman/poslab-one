// purchase/components/SupplierSelect.jsx
import { useEffect, useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import useApi from "../../../hooks/useApi";

export default function SupplierSelect({ value, onChange }) {
  const { request } = useApi();
  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    request("/suppliers?limit=20", "GET").then(res =>
      setList(res?.data || [])
    );
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between bg-white"
      >
        <div className="flex items-center gap-3">
          <Building2 size={18} className="text-gray-400" />
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value?.name || "Select Supplier"}
          </span>
        </div>
        <ChevronDown size={18} className="text-gray-400" />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
            {list.map(s => (
              <div
                key={s._id}
                onClick={() => {
                  onChange(s);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                  value?._id === s._id ? "bg-blue-50" : ""
                }`}
              >
                <div className="font-medium text-gray-900">{s.name}</div>
                {s.email && (
                  <div className="text-sm text-gray-500 mt-1">{s.email}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}