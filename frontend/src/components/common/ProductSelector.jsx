// ProductSelect.jsx
import React, { useRef, useState, useMemo } from "react";
import AsyncSelect from "react-select/async";
import Fuse from "fuse.js";

const ProductSelect = ({
  onChange,
  multiSelect = false,
  image = false,
  mockData = [],
  dataType = "flat", // "tree" or "flat"
  value,
  searchFields = ["label"], // brand, sku ইত্যাদি
  displayField = "label",
  disabled,
  placeholder = "Search & select...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const selectRef = useRef();

  const getDisplayText = (data) => {
    if (!data) return "";
    if (Array.isArray(displayField)) {
      return displayField
        .map((field) => (data[field] ?? "").toString())
        .filter(Boolean)
        .join(" - ");
    }
    return data[displayField] ?? data.label ?? "";
  };

  /** -------------------------
   * 🔎 Fuse.js Config & Memo
   * ------------------------- */
  const fuse = useMemo(() => {
    const list = dataType === "tree"
      ? mockData.flatMap((g) =>
          (g.options || []).map((opt) => ({ ...opt, __group: g.label }))
        )
      : mockData;

    return new Fuse(list, {
      keys: [
        ...searchFields,
        { name: "searchSerials", weight: 0.7 }, // serials এও সার্চ হবে
      ],
      threshold: 0.35,   // 0=exact, 1=loose (adjust as you like)
      distance: 100,     // typo allowance
      ignoreLocation: true,
    });
  }, [mockData, searchFields, dataType]);

  const filterOptions = (rawInput) => {
    const input = (rawInput || "").trim();
    if (!input) return dataType === "tree" ? mockData : mockData;

    // Fuse search
    const results = fuse.search(input).map((r) => r.item);

    // exact serial priority
    const norm = input.toLowerCase();
    const exactIndex = results.findIndex((x) =>
      Array.isArray(x.searchSerials)
        ? x.searchSerials.some((s) => s.toLowerCase() === norm)
        : false
    );

    let list = [...results];
    if (exactIndex > -1) {
      const exact = { ...list[exactIndex] };
      const matched = exact.searchSerials.find(
        (s) => s.toLowerCase() === norm
      );
      exact.__matchedSerial = matched;
      list.splice(exactIndex, 1);
      list = [exact, ...list];
    }

    if (dataType === "tree") {
      // Group অনুযায়ী আবার সাজানো
      const groups = {};
      list.forEach((item) => {
        const g = item.__group || "Others";
        if (!groups[g]) groups[g] = [];
        groups[g].push(item);
      });
      return Object.entries(groups).map(([label, options]) => ({
        label,
        options,
      }));
    }

    return list;
  };

  const loadOptions = (inVal, callback) => {
    setTimeout(() => callback(filterOptions(inVal)), 150);
  };

  /** -------- Custom UI -------- */
  const customOption = (props) => {
    const { data, innerRef, innerProps, isFocused, isSelected } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: isFocused ? "#f3f4f6" : "#fff",
          borderBottom: "1px solid #e5e7eb",
          fontSize: 14,
          cursor: "pointer",
          fontWeight: isSelected ? 500 : 400,
        }}
      >
        {image && data.image && (
          <img
            src={import.meta.env.VITE_BASE_URL + data.image}
            alt={getDisplayText(data)}
            width={50}
            height={50}
            style={{ marginRight: 10, borderRadius: 4 }}
          />
        )}
        <div>
          <span>{getDisplayText(data)}</span>
          {data.__matchedSerial && (
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              Serial matched: {data.__matchedSerial}
            </span>
          )}
        </div>
      </div>
    );
  };

  const customMultiValueLabel = ({ data }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {image && data.image && (
        <img
          src={import.meta.env.VITE_BASE_URL + data.image}
          alt={getDisplayText(data)}
          width={24}
          height={24}
          style={{ marginRight: 5, borderRadius: 3 }}
        />
      )}
      {getDisplayText(data)}
    </div>
  );

  /** Barcode/Enter Key → first best match auto select */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const filtered = filterOptions(inputValue);
      let toSelect = null;
      if (Array.isArray(filtered) && filtered.length > 0) {
        // tree হলে প্রথম গ্রুপের প্রথম item
        if (dataType === "tree") {
          const flat = filtered.flatMap((g) => g.options || []);
          if (flat.length > 0) toSelect = flat[0];
        } else toSelect = filtered[0];
      }
      if (toSelect) {
        onChange(multiSelect ? [toSelect] : toSelect);
        setInputValue("");
      }
    }
  };

  return (
    <AsyncSelect
      ref={selectRef}
      cacheOptions
      defaultOptions={mockData}
      loadOptions={loadOptions}
      isMulti={multiSelect}
      value={value}
      onChange={(val) => {
        onChange(val);
        setInputValue("");
      }}
      placeholder={placeholder}
      inputValue={inputValue}
      onInputChange={(val, { action }) =>
        action === "input-change" && setInputValue(val)
      }
      onKeyDown={handleKeyDown}
      isDisabled={disabled}
      components={{
        Option: customOption,
        MultiValueLabel: multiSelect ? customMultiValueLabel : undefined,
      }}
      styles={{
        control: (base) => ({
          ...base,
          borderRadius: 6,
          padding: 2,
          minHeight: "38px",
          borderColor: "#d1d5db",
          boxShadow: "none",
          "&:hover": { borderColor: "#9ca3af" },
        }),
        menu: (base) => ({
          ...base,
          borderRadius: 6,
          marginTop: 2,
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          zIndex: 100,
        }),
        menuList: (base) => ({ ...base, paddingTop: 0, paddingBottom: 0 }),
      }}
    />
  );
};

export default ProductSelect;