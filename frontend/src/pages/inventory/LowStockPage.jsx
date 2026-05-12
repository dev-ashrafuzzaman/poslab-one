import Page from "../../components/common/Page";
import DataTable from "../../components/table/DataTable";
import useTableManager from "../../hooks/useTableManager";

const LowStockPage = () => {
  const table = useTableManager("/stocks/low");

  return (
    <Page title="Low Stock" subTitle="Branch wise product stock overview">
      <DataTable
        table={table}
        title="Low Stock List"
        columns={[
          {
            key: "branchName",
            label: "Branch",
            render: (r) => (
              <div>
                <strong>{r.branchName}</strong>
                <div className="text-xs text-muted">{r.branchCode}</div>
              </div>
            ),
          },

          {
            key: "productName",
            label: "Product",
            render: (r) => (
              <div>
                <strong>{r.productName}</strong>
                <div className="text-xs text-muted">
                  Size: {r.size}, Color: {r.color}
                </div>
              </div>
            ),
          },

          { key: "sku", label: "SKU" },

          {
            key: "qty",
            label: "Qty",
            render: (r) => (
              <span
                className={`font-semibold ${
                  r.qty === 0 ? "text-red-700" : "text-orange-600"
                }`}>
                {r.qty}
              </span>
            ),
          },

          {
            key: "salePrice",
            label: "Sale Price",
            render: (r) => `৳ ${r.salePrice}`,
          },
        ]}
      />
    </Page>
  );
};

export default LowStockPage;
