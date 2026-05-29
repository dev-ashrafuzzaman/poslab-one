/* ========================================================================== */
/*                              CategorySelect.jsx                            */
/* ========================================================================== */

import { useEffect, useMemo } from "react";
import { FolderTree, Plus } from "lucide-react";

import useModalManager from "../../hooks/useModalManager";

import ReportSmartSelect from "../common/ReportSmartSelect";

export default function CategorySelect({
  value,
  onChange,
  error,

  /* ---------------- Category Config ---------------- */
  level = 1,
  parentId = null,

  /* ---------------- UI ---------------- */
  label = "Category",
  placeholder = "Search category",

  /* ---------------- Create ---------------- */
  allowCreate = false,
  createModalKey = "addCategory",
  createModal = null,

  disabled = false,
}) {
  const { modals, openModal, closeModal } = useModalManager();

  /* -------------------------------------------------------------------------- */
  /*                             SELECTED OPTION                                */
  /* -------------------------------------------------------------------------- */

  const selectedOption = useMemo(() => {
    if (!value) return null;

    return value;
  }, [value]);

  /* -------------------------------------------------------------------------- */
  /*                           AUTO CLEAR SUB CATEGORY                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    // level 2+ requires parent
    if (level > 1 && !parentId && value) {
      onChange(null);
    }
  }, [level, parentId, value, onChange]);

  /* -------------------------------------------------------------------------- */
  /*                               FINAL DISABLED                               */
  /* -------------------------------------------------------------------------- */

  const isDisabled = useMemo(() => {
    if (level > 1 && !parentId) return true;

    return disabled;
  }, [level, parentId, disabled]);

  return (
    <>
      {/* ---------------- Create Modal ---------------- */}
      {allowCreate &&
        createModal &&
        modals[createModalKey]?.isOpen &&
        createModal({
          isOpen: modals[createModalKey].isOpen,

          setIsOpen: () => closeModal(createModalKey),

          onSuccess: (newCategory) => {
            onChange(newCategory);

            closeModal(createModalKey);
          },
        })}

      <div className="w-full">
        {/* ---------------- Header ---------------- */}
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>

          {allowCreate && !isDisabled && (
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
            <FolderTree className="w-4 h-4 text-gray-400" />
          </div>

          <ReportSmartSelect
            route="/categories"
            extraParams={{
              level,

              ...(parentId && {
                parentId,
              }),
            }}
            value={selectedOption}
            onChange={onChange}
            displayField={["name"]}
            valueField="_id"
            disabled={isDisabled}
            placeholder={
              isDisabled ? "Select parent category first" : placeholder
            }
            className="
              [&>div:first-child]:pl-10
              [&>div:first-child]:rounded-xl
              [&>div:first-child]:border-gray-300
              [&>div:first-child]:min-h-11.5
            "
          />

          {/* ---------------- Error ---------------- */}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </>
  );
}
