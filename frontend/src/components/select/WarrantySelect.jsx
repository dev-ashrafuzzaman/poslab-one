import { useMemo } from "react";
import { Building2, Plus } from "lucide-react";
import useModalManager from "../../hooks/useModalManager";
import ReportSmartSelect from "../common/ReportSmartSelect";

export default function WarrantySelect({
  value,
  onChange,
  error,
  label = "Warranty",
  placeholder = "Search Warranty",
  title = "", 
  showLabel = true, 
  allowCreate = false,
  createModalKey = "addWarranty",
  createModal = null,
}) {
  const { modals, openModal, closeModal } = useModalManager();

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return value;
  }, [value]);

  return (
    <>
      {allowCreate &&
        createModal &&
        modals[createModalKey]?.isOpen &&
        createModal({
          isOpen: modals[createModalKey].isOpen,
          setIsOpen: () => closeModal(createModalKey),
          onSuccess: (newBrand) => {
            onChange(newBrand);
            closeModal(createModalKey);
          },
        })}

      <div className="w-full" title={title}>
        {showLabel && (
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {allowCreate && (
              <button
                type="button"
                onClick={() => openModal(createModalKey)}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>
        )}

        <div className="relative w-full">
          {/* Left Side Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
            <Building2 className="w-4 h-4 text-gray-400" />
          </div>

          <ReportSmartSelect
            route="/utils/warranty"
            value={selectedOption}
            onChange={onChange}
            displayField={["name", "durationDays"]}
            valueField="_id"
            placeholder={placeholder}
            className="w-full"
          />

          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </>
  );
}