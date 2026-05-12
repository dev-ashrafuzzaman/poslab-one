import { Fragment, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown, X } from "lucide-react";

export default function MultiSelect({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = "Select options",
  disabled = false,
}) {
  const [query, setQuery] = useState("");

  /* ---------------- FILTER ---------------- */
  const filteredOptions = useMemo(() => {
    if (!query) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  /* ---------------- HELPERS ---------------- */
  const isSelected = (option) =>
    value.some((v) => v.value === option.value);

  const toggleOption = (option) => {
    if (isSelected(option)) {
      onChange(value.filter((v) => v.value !== option.value));
    } else {
      onChange([...value, option]);
    }
  };

  const removeOne = (val) => {
    onChange(value.filter((v) => v.value !== val));
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <Listbox value={value} by="value" multiple disabled={disabled}>
        <div className="relative">
          {/* BUTTON */}
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg border bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
            {value.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {value.map((v) => (
                  <span
                    key={v.value}
                    className="flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                  >
                    {v.label}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOne(v.value);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </span>
          </Listbox.Button>

          {/* DROPDOWN */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {/* SEARCH */}
              <div className="px-2 pb-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-gray-500">
                  No options found
                </div>
              )}

              {filteredOptions.map((option) => {
                const selected = isSelected(option);

                return (
                  <Listbox.Option
                    key={option.value}
                    value={option}
                    onClick={() => toggleOption(option)}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active
                          ? "bg-indigo-50 text-indigo-900"
                          : "text-gray-900"
                      }`
                    }
                  >
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.label}
                      </span>

                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  </Listbox.Option>
                );
              })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {/* CLEAR ALL */}
      {value.length > 0 && !disabled && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-1 flex items-center gap-1 text-xs text-red-500"
        >
          <X className="h-3 w-3" /> Clear All
        </button>
      )}
    </div>
  );
}
