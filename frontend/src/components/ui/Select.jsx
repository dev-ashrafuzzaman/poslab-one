import React, { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { sizeMap } from "../../constants/uiConfig";

export default function Select({
  label,                     // ✅ ADD
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  searchable = false,
  size = "md",
  disabled = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div className={`relative ${className}`}>
      {/* ================= LABEL ================= */}
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          {/* ================= BUTTON ================= */}
          <Listbox.Button
            className={`relative w-full cursor-default border border-gray-300 bg-white text-left focus:outline-none focus:ring-1 focus:ring-[var(--secondary)] transition-all duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed ${sizeMap[size]}`}
          >
            <span
              className={`block truncate ${
                !value ? "text-gray-400" : "text-gray-800"
              }`}
            >
              {value
                ? options.find((o) => o.value === value)?.label
                : placeholder}
            </span>

            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronsUpDown size={16} className="text-gray-500" />
            </span>
          </Listbox.Button>

          {/* ================= DROPDOWN ================= */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none">
              {/* SEARCH */}
              {searchable && (
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--secondary)]"
                  />
                </div>
              )}

              {/* OPTIONS */}
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  No results found
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <Listbox.Option
                    key={opt.value}
                    value={opt.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-blue-100 text-[var(--primary)]"
                          : "text-gray-900"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {opt.label}
                        </span>

                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--primary)]">
                            <Check size={16} />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
