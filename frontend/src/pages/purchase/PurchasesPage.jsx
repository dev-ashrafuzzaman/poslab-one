import DataTable from "../../components/table/DataTable";
import useTableManager from "../../hooks/useTableManager";
import { useNavigate } from "react-router-dom";
import Page from "../../components/common/Page";
import { Receipt, RotateCcw } from "lucide-react";
import useModalManager from "../../hooks/useModalManager";
import SupplierPaymentModal from "./SupplierPaymentModal";
import { useState } from "react";

const PurchasesPage = () => {
  const table = useTableManager("/purchases");
  const { modals, openModal, closeModal } = useModalManager();
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const navigate = useNavigate();

  const handlePayment = (purchase) => {
    console.log("ffff");
    setSelectedPurchase(purchase);
    openModal("supplierPayment");
  };
  return (
    <Page title="Purchases" subTitle="Manage supplier purchases">
      {modals.supplierPayment?.isOpen && (
        <SupplierPaymentModal
          isOpen={modals.supplierPayment.isOpen}
          setIsOpen={() => closeModal("supplierPayment")}
          refetch={table.refetch}
          purchase={selectedPurchase}
        />
      )}
      <DataTable
        table={table}
        title="Purchase List"
        columns={[
          { key: "purchaseNo", label: "Purchase No" },
          { key: "invoiceNumber", label: "Invoice No" },
          {
            key: "supplier",
            label: "Supplier",
            render: (row) => row.supplier?.name || "—",
          },
          { key: "totalQty", label: "Qty" },
          { key: "totalAmount", label: "Total" },
          { key: "paidAmount", label: "Paid" },
          { key: "createdAt", label: "Date" },
        ]}
       actions={[
  {
    type: "view",
    label: "Invoice",
    onClick: (row) =>
      navigate(`/purchases/${row._id}/invoice`)
  },
  {
    type: "custom",
    label: "Payment",
    icon: <Receipt size={14} />,
    hidden: (row) => row.dueAmount <= 0, 
    onClick: (row) => handlePayment(row),
  },
  {
    type: "custom",
    label: "Return",
    icon: <RotateCcw size={14} />,
    onClick: (row) =>
      navigate(`/purchase-returns/create?purchaseId=${row._id}`),
  },
]}
      />
    </Page>
  );
};

export default PurchasesPage;
