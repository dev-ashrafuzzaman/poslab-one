export const masterTableToolbar = {
  title: "Faces Management",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📅 Date Range Filter
  dateRange: {
    enabled: true,
    label: "Date Range",
    startKey: "startDate",
    endKey: "endDate",
    placeholder: "Select date range...",
  },

  // 🔢 Number Range Filter
  numberRange: {
    enabled: true,
    label: "Amount Range",
    minKey: "minValue",
    maxKey: "maxValue",
    placeholder: "Enter number range...",
  },

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      type: "select",
      label: "Type",
      queryKey: "type",
      options: [
        { label: "All", value: "all" },
        { label: "Verified", value: "verified" },
        { label: "Unverified", value: "unverified" },
      ],
    },
  ],

  // 🔗 Navigation or quick actions
  links: [
    {
      type: "link",
      label: "➕ Add New Face",
      href: "/faces/add",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    view: { enabled: true },
    print: { enabled: true },
    export: { enabled: true },
    reset: { enabled: true },
  },
};

export const ATT_TABLE_TOOLBAR = {
  search: {
    enabled: true,
    placeholder: "Search records...",
  },

  filters: [
    {
      label: "Type",
      queryKey: "view",
      options: [
        { label: "Summary Report", value: "summary" },
        { label: "Daily Details", value: "details" },
      ],
    },
  ],
};


export const facesTableToolbar = {
  title: "Faces Management",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],
  links: [
    {
      type: "link",
      variant: "danger",
      label: "Close",
      href: "/journal/entries",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    reset: { enabled: true },
  },
};
export const companyTableToolbar = {
  title: "Companies Management",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],

  links: [
    {
      type: "link",
      variant: "danger",
      label: "Close",
      href: "/journal/entries",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    reset: { enabled: true },
  },
};
export const locationTableToolbar = {
  title: "Locations Management",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],

  links: [
    {
      type: "link",
      variant: "danger",
      label: "Close",
      href: "/journal/entries",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    reset: { enabled: true },
  },
};
export const accountTypeTableToolbar = {
  title: "Account Types Management",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],

  links: [
    {
      type: "link",
      variant: "danger",
      label: "Close",
      href: "/journal/entries",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    reset: { enabled: true },
  },
};
export const ledgerTableToolbar = {
  title: "General Ledger Management",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],

  links: [
    {
      type: "link",
      variant: "danger",
      label: "Close",
      href: "/journal/entries",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    reset: { enabled: true },
  },
};
export const subsidiaryTableToolbar = {
  title: "Subsidiaries Management",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],

  links: [
    {
      type: "link",
      variant: "danger",
      label: "Close",
      href: "/journal/entries",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    reset: { enabled: true },
  },
};
export const journalTableToolbar = {
  title: "List of JV",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],

  links: [
    {
      type: "link",
      variant: "danger",
      label: "Close",
      href: "/journal/entries",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    reset: { enabled: true },
  },
};
export const usersTableToolbar = {
  title: "Users Management",

  // 🔍 Search input(s)
  search: [
    {
      type: "search",
      label: "Search User",
      queryKey: "q",
      placeholder: "Search by name or ID...",
    },
  ],

  // 📦 Filters (Dropdowns / Multi-selects)
  filters: [
    {
      type: "select",
      label: "Status",
      queryKey: "status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ],

  links: [
    {
      type: "link",
      label: "Add New User",
      href: "/settings/users/create",
    },
    {
      type: "link",
      variant: "danger",
      label: "Close",
      href: "/journal/entries",
    },
  ],

  // ⚙️ Action buttons (only show when true)
  actions: {
    reset: { enabled: true },
  },
};
