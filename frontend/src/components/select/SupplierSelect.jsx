import { useMemo } from "react";
import { Building2, Plus, User } from "lucide-react";
import useModalManager from "../../hooks/useModalManager";
import ReportSmartSelect from "../common/ReportSmartSelect";

export default function SupplierSelect({
  value,
  onChange,
  error,
  label = "Supplier",
  placeholder = "Search supplier",
  title = "",
  showLabel = true,
  allowCreate = false,
  createModalKey = "addSupplier",
  createModal = null,
}) {
  const { modals, openModal, closeModal } = useModalManager();

  /* ---------------- Selected Option ---------------- */
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return value;
  }, [value]);

  return (
    <>
      {/* ---------------- Create Modal ---------------- */}
      {allowCreate &&
        createModal &&
        modals[createModalKey]?.isOpen &&
        createModal({
          isOpen: modals[createModalKey].isOpen,
          setIsOpen: () => closeModal(createModalKey),
          onSuccess: (newSupplier) => {
            onChange(newSupplier);
            closeModal(createModalKey);
          },
        })}

      <div className="w-full" title={title}>
        {/* ---------------- Header (Conditional Layout) ---------------- */}
        {showLabel && (
          <div className="flex items-center justify-between mb-1.5 select-none">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>

            {allowCreate && (
              <button
                type="button"
                onClick={() => openModal(createModalKey)}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>
        )}

        {/* ---------------- Select ---------------- */}
        <div className="relative w-full">
          {/* Left Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
            <User className="w-4 h-4 text-gray-400" />
          </div>

          <ReportSmartSelect
            route="/parties"
            extraParams={{ type: "supplier" }}
            value={selectedOption}
            onChange={onChange}
            displayField={["name", "phone"]}
            valueField="_id"
            placeholder={placeholder}
            className={`w-full ${error ? "border rounded-lg border-red-500 focus:ring-red-500" : ""}`}
          />
        </div>
      </div>
    </>
  );
}
