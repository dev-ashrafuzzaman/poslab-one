import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";

const DiscountsPage = () => {
  const table = useTableManager("/discounts");

  return (
    <Page title="Discounts" subTitle="Discounts overview">
      <DataTable
        table={table}
        title="Discount Campaigns"
        columns={[
          {
            key: "name",
            label: "Campaign Name",
            render: (r) => (
              <div>
                <strong className="text-gray-900">{r.name}</strong>
                <div className="text-xs text-muted">
                  Priority: {r.priority}
                </div>
              </div>
            ),
          },

          {
            key: "type",
            label: "Type",
            render: (r) => (
              <span className="badge badge-info">
                {r.type}
              </span>
            ),
          },

          {
            key: "value",
            label: "Value",
            render: (r) =>
              r.type === "PERCENT"
                ? `${r.value}%`
                : `৳${r.value}`,
          },

          {
            key: "targetType",
            label: "Target",
            render: (r) => (
              <span className="badge badge-secondary">
                {r.targetType}
              </span>
            ),
          },

          {
            key: "startDate",
            label: "Start Date",
            render: (r) =>
              new Date(r.startDate).toLocaleDateString(),
          },

          {
            key: "endDate",
            label: "End Date",
            render: (r) =>
              r.isLifetime ? (
                <span className="text-green-600 font-semibold">
                  Lifetime
                </span>
              ) : (
                new Date(r.endDate).toLocaleDateString()
              ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`status ${r.status === "active" ? "approved" : "rejected"
                  }`}>
                {r.status === "active" ? "Active" : "Inactive"}
              </span>
            ),
          },
        ]}
        actions={[
          // { type: "edit", label: "Edit" },
          {
            type: "status",
            label: "Change Status",
            api: (row) => `/discounts/${row._id}/status`,
          },
          {
            type: "delete",
            label: "Delete",
            api: (row) => `/discounts/${row._id}`,
          },
        ]}
      />
    </Page>
  );
};

export default DiscountsPage;
