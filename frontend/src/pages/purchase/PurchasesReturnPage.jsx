import Page from "../../components/common/Page";
import DataTable from "../../components/table/DataTable";
import useTableManager from "../../hooks/useTableManager";
import { useNavigate } from "react-router-dom";

const PurchasesReturnPage = () => {
  const table = useTableManager("/purchases/return");
  const navigate = useNavigate();

  return (
    <Page title="Purchase Returns" subTitle="Manage supplier purchase returns">
      <DataTable
        table={table}
        title="Purchase Return List"
        columns={[
          { key: "returnNo", label: "Return No" },
          {
            key: "purchase",
            label: "Purchase No",
            render: (row) => row.purchase?.purchaseNo || "—",
          },
          {
            key: "supplier",
            label: "Supplier",
            render: (row) => row.supplier?.name || "—",
          },
          { key: "totalQty", label: "Qty" },
          { key: "totalAmount", label: "Amount" },
          { key: "createdAt", label: "Date" },
        ]}
        actions={[
          {
            type: "view",
            label: "Return Invoice",
            onClick: (row) => navigate(`/purchase-returns/${row._id}/invoice`),
          },
        ]}
      />
    </Page>
  );
};

export default PurchasesReturnPage;
