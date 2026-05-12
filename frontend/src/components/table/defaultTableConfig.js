// components/table/tableToolbar.config.js
export const SIMPLE_TABLE_TOOLBAR = {
  search: {
    enabled: true,
    placeholder: "Search records...",
  },

  filters: [
    {
      label: "Status",
      queryKey: "status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],
};


export const SIMPLE_TABLE = {
  search: {
    enabled: true,
    placeholder: "Search records...",
  },

  filters: [
    // Select
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      placeholder: "All Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },

    // Multi Select
    {
      type: "multi-select",
      label: "Roles",
      queryKey: "roles",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Manager", value: "manager" },
        { label: "User", value: "user" },
      ],
    },

    // Date
    {
      type: "date",
      label: "Created Date",
      queryKey: "createdAt",
    },

    // Date Range
    {
      type: "date-range",
      label: "Date Range",
      queryKey: {
        from: "startDate",
        to: "endDate",
      },
    },

    // Checkbox
    {
      type: "checkbox",
      label: "Verified Only",
      queryKey: "verified",
    },

    // Radio
    {
      type: "radio",
      label: "Gender",
      queryKey: "gender",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
    },

    // Async Select
    {
      type: "async-select",
      label: "Supplier",
      queryKey: "supplierId",
      endpoint: "/suppliers/options",
      labelField: "name",
      valueField: "_id",
    },
  ],
};