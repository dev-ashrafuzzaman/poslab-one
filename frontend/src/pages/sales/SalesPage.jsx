import Page from "../../components/common/Page";
import DataTable from "../../components/table/DataTable";
import useTableManager from "../../hooks/useTableManager";
import useModalManager from "../../hooks/useModalManager";
import { useState } from "react";
import PosInvoiceModal from "./components/invoice/PosInvoiceModal";
import { Printer } from "lucide-react";
import useApi from "../../hooks/useApi";
import SalesReturnCreateModal from "./SalesReturnCreateModal";

const SalesPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const [invoiceData, setInvoiceData] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(null);

  const table = useTableManager("/sales");
  const { request } = useApi();
console.log(table)
  const handlePrintInvoice = async (row) => {
    const res = await request(`/sales/${row._id}/reprint`, "GET");
    setInvoiceData(res.data);
    openModal("printPosInvoice");
  };

  return (
    <Page title="Sales" subTitle="Manage your organization sales">
      {/* Print */}
      {modals.printPosInvoice?.isOpen && (
        <PosInvoiceModal
          isOpen
          setIsOpen={() => closeModal("printPosInvoice")}
          data={invoiceData}
        />
      )}

      {/* Sales Return */}
      {modals.createSaleReturn?.isOpen && selectedSaleId && (
        <SalesReturnCreateModal
          open
          setOpen={() => {
            closeModal("createSaleReturn");
            setSelectedSaleId(null);
          }}
          saleId={selectedSaleId}
          onSuccess={() => table.refetch()}
        />
      )}

      <DataTable
        table={table}
        title="Sales"
        columns={[
          { key: "invoiceNo", label: "Invoice" },
          { key: "subTotal", label: "Sub Total" },
          { key: "itemDiscount", label: "Discount" },
          { key: "grandTotal", label: "Grand Total" },
          { key: "createdAt", label: "Created At" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                {r.status}
              </span>
            ),
          },
          {
            key: "action",
            label: "Action",
            render: (row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrintInvoice(row)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded">
                  Print
                </button>

                <button
                  onClick={() => {
                    setSelectedSaleId(row._id);
                    openModal("createSaleReturn");
                  }}
                  className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded">
                  Return
                </button>
              </div>
            ),
          },
        ]}
      />
    </Page>
  );
};

export default SalesPage;
