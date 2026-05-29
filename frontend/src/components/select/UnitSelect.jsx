/* ========================================================================== */
/*                                 UnitSelect.jsx                             */
/* ========================================================================== */

import { useMemo } from "react";
import { Ruler, Plus } from "lucide-react";

import useModalManager from "../../hooks/useModalManager";

import ReportSmartSelect from "../common/ReportSmartSelect";

export default function UnitSelect({
  value,
  onChange,
  error,

  label = "Unit",
  placeholder = "Search unit",

  allowCreate = false,
  createModalKey = "addUnit",
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

          onSuccess: (newUnit) => {
            onChange(newUnit);

            closeModal(createModalKey);
          },
        })}

      <div className="w-full">
        {/* ---------------- Header ---------------- */}
        <div className="flex items-center justify-between mb-2">
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

        {/* ---------------- Select ---------------- */}
        <div className="relative">
          {/* Left Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
            <Ruler className="w-4 h-4 text-gray-400" />
          </div>

          <ReportSmartSelect
            route="/utils/unit"
            value={selectedOption}
            onChange={onChange}
            displayField={["name", "shortName"]}
            valueField="_id"
            placeholder={placeholder}
            className="
              [&>div:first-child]:pl-10
              [&>div:first-child]:rounded-xl
              [&>div:first-child]:border-gray-300
              [&>div:first-child]:min-h-11.5
            "
          />

          {/* Error */}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </>
  );
}
