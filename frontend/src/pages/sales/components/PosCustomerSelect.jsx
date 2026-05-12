import { useEffect, useMemo, useRef } from "react";
import SmartSelect from "../../../components/common/SmartSelect";
import useModalManager from "../../../hooks/useModalManager";
import CustomerCreateModal from "../../parties/customer/CustomerCreateModal";
import { UserPlus, Search } from "lucide-react";

export default function PosCustomerSelect({ value, onChange, error }) {
  const { modals, openModal, closeModal } = useModalManager();
  const selectRef = useRef(null);

  /* ---------------- Keyboard Shortcut (F4 / ESC) ---------------- */
  useEffect(() => {
    const handleKey = (e) => {
      // ignore when any modal open
      if (Object.values(modals).some((m) => m?.isOpen)) return;

      // 🔥 F4 → focus customer select
      if (e.key === "F4") {
        e.preventDefault();
        selectRef.current?.focus();
      }

      // 🔥 ESC → clear + focus
      if (e.key === "Escape") {
        e.preventDefault();
        selectRef.current?.clearValue?.();
        selectRef.current?.focus();
        onChange(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modals, onChange]);

  /* ---------------- Raw customer → SmartSelect value ---------------- */
  const selectedOption = useMemo(() => {
    if (!value) return null;

    return {
      value: value._id,
      label: `${value.phone} — ${value.name}`,
      raw: value,
    };
  }, [value]);

  return (
    <>
      {modals.addCustomer?.isOpen && (
        <CustomerCreateModal
          isOpen={modals.addCustomer.isOpen}
          setIsOpen={() => closeModal("addCustomer")}
          onSuccess={(newCustomer) => {
            onChange(newCustomer);
            closeModal("addCustomer");
          }}
          
        />
      )}

      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Customer
          </label>

          <button
            onClick={() => openModal("addCustomer")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 group">
            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Add New
          </button>
        </div>

        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>

            <SmartSelect
              ref={selectRef}
              customRoute="/customers"
              displayField={["phone", "name"]}
              idField="_id"
              placeholder="Search customer"
              barcode={false}
              minSearchLength={11}
              phoneInstant={true}
              phoneLength={11}
              value={selectedOption}
              onChange={(opt) => onChange(opt?.raw || null)}
              error={error}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg 
                         bg-white text-gray-900
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                         transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </>
  );
}
