import { useEffect, useMemo } from "react";
import { FolderTree, Plus } from "lucide-react";
import useModalManager from "../../hooks/useModalManager";
import ReportSmartSelect from "../common/ReportSmartSelect";

export default function CategorySelect({
  value,
  onChange,
  error,
  level = 1,
  parentId = null,
  label = "Category",
  placeholder = "Search category",
  title = "",
  showLabel = true,   
  allowCreate = false,
  createModalKey = "addCategory",
  createModal = null,

  disabled = false,
}) {
  const { modals, openModal, closeModal } = useModalManager();

  /* ----------------Selected Option ---------------- */
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return value;
  }, [value]);

  /* ---------------- Auto Clear Sub Category ---------------- */
  useEffect(() => {
    if (level > 1 && !parentId && value) {
      onChange(null);
    }
  }, [level, parentId, value, onChange]);

  /* ---------------- Final Disabled ---------------- */
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

      <div className="w-full" title={title}>
        {/* ---------------- Header (Conditional Layout) ---------------- */}
        {showLabel && (
          <div className="flex items-center justify-between mb-1.5 select-none">
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
        )}

        {/* ---------------- Select ---------------- */}
        <div className="relative w-full">
          {/* Left Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
            <FolderTree className="w-4 h-4 text-gray-400" />
          </div>

          <ReportSmartSelect
            route="/categories"
            extraParams={{
              level,
              ...(parentId && { parentId }),
            }}
            value={selectedOption}
            onChange={onChange}
            displayField={["name"]}
            valueField="_id"
            disabled={isDisabled}
            placeholder={isDisabled ? "Select parent category first" : placeholder}
            className="w-full"
          />

          {/* ---------------- Error ---------------- */}
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </>
  );
}