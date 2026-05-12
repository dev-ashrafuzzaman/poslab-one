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
