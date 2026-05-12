import Page from "../../components/common/Page";
import DataTable from "../../components/table/DataTable";
import useTableManager from "../../hooks/useTableManager";

const StockPage = () => {
  const table = useTableManager("/stocks");

  return (
    <Page title="Stock" subTitle="Branch wise product stock overview">
      <DataTable
        table={table}
        title="Stock List"
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
          { key: "productName", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "size", label: "Size" },
          {
            key: "color",
            label: "Color",
            render: (r) => <span className="badge">{r.color}</span>,
          },
          {
            key: "qty",
            label: "Qty",
            render: (r) => (
              <strong className={r.qty < 5 ? "text-red-600" : ""}>
                {r.qty}
              </strong>
            ),
          },
       
          {
            key: "salePrice",
            label: "Sale Price",
            render: (r) => `${r.salePrice}`,
          },
        ]}
        // actions={[
        //   {
        //     type: "view",
        //     label: "View History",
        //   },
        // ]}
      />
    </Page>
  );
};

export default StockPage;
