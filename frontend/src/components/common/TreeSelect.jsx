import { useCallback, useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import useAxiosSecure from "@hooks/useAxiosSecure";
import useCurrentUser from "@hooks/useCurrentUser";

const TreeSelect = ({
  collection = "",
  customRoute = "", 
  value,
  onChange,
  multiSelect = false,
  image = false,
  searchFields = ["label"],
  displayField = "label",
  disabled = false,
  placeholder = "Search & select...",
  idField = "_id",
  type = null,
  warehouseId = null,
  all='false'
}) => {
  const axiosSecure = useAxiosSecure();
  const { companyId } = useCurrentUser();
  const [defaultOptions, setDefaultOptions] = useState([]);

  const getDisplayText = useCallback(
    (item) => {
      if (!item) return "";
      if (Array.isArray(displayField)) {
        return displayField.map((f) => item[f] ?? "").filter(Boolean).join(" - ");
      }
      return item[displayField] ?? item.label ?? "";
    },
    [displayField]
  );

  const toOption = useCallback(
    (item) => ({
      value: item[idField]?.toString() || item._id?.toString(),
      label: getDisplayText(item),
      raw: item,
      image: item.image || null,
    }),
    [idField, getDisplayText]
  );

  useEffect(() => {
    if (!companyId || !collection) return;

    const fetchInitial = async () => {
      const route = customRoute || `/${collection}`;
      try {
        const res = await axiosSecure.get(route, {
          params: {
            companyId,
            warehouseId,
            page: 1,
            pageSize: 10,
            all,
            status: true,
            type: type ? JSON.stringify(type) : undefined,
            searchFields: searchFields.join(","),
          },
        });
   
        setDefaultOptions(res.data.result.map(toOption));
      } catch (err) {
        console.error("TreeSelect fetchInitial error:", err);
      }
    };
    fetchInitial();
  }, [companyId, warehouseId, collection, customRoute, idField, searchFields, axiosSecure, toOption, type]);

  const loadOptions = async (inputValue) => {
    if (!companyId || !collection) return [];
    const route = customRoute || `/${collection}`;
    try {
      const res = await axiosSecure.get(route, {
        params: {
          companyId,
          warehouseId,
          search: inputValue,
          all: true,
          status: true,
          type: type ? JSON.stringify(type) : undefined,
          searchFields: searchFields.join(","),
        },
      });
      return res.data.result.map(toOption);
    } catch (err) {
      console.error("TreeSelect loadOptions error:", err);
      return [];
    }
  };

  const customOption = (props) => {
    const { data, innerRef, innerProps, isFocused, isSelected } = props;
    let bg = isSelected ? "#e0f2fe" : isFocused ? "#f3f4f6" : "#fff";
    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          backgroundColor: bg,
          borderBottom: "1px solid #e5e7eb",
          cursor: "pointer",
          fontSize: "14px",
          color: "#111827",
          fontWeight: isSelected ? 500 : 400,
        }}
      >
        {image && data.image && (
          <img
            src={import.meta.env.VITE_BASE_URL + data.image}
            alt={data.label}
            width={40}
            height={40}
            style={{ marginRight: 8, borderRadius: 4 }}
          />
        )}
        {data.label}
      </div>
    );
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={defaultOptions}
      loadOptions={loadOptions}
      isMulti={multiSelect}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={disabled}
      components={{ Option: customOption }}
      styles={{
        control: (base) => ({
          ...base,
          borderRadius: 6,
          padding: 2,
          minHeight: 38,
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
      }}
    />
  );
};

export default TreeSelect;