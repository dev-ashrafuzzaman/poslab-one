import { useState } from "react";
import { BoxIcon, Eye } from "lucide-react";

import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import Badge from "../../../components/ui/Badge";
import useTableManager from "../../../hooks/useTableManager";
import useApi from "../../../hooks/useApi";
import StockTransferDetailsModal from "./StockTransferDetailsModal";
import useModalManager from "../../../hooks/useModalManager";
import { useNavigate } from "react-router-dom";

const StockTranaferPage = () => {
  const table = useTableManager("/stocks/transfers");
  const { request } = useApi();
  const { modals, openModal, closeModal } = useModalManager();
  const [invoiceData, setInvoiceData] = useState(null);
  const navigate = useNavigate();
  const handlePrintInvoice = async (row) => {
    const res = await request(`/stocks/transfers/${row._id}`, "GET");
    setInvoiceData(res.data);
    openModal("viewStockDetails");
  };

  const getStatusBadge = (status) => {
    const config = {
      RECEIVED: {
        color: "emerald",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        label: "Received",
      },
      MISMATCH: {
        color: "rose",
        bg: "bg-rose-50",
        text: "text-rose-700",
        label: "Mismatch",
      },
      PENDING: {
        color: "amber",
        bg: "bg-amber-50",
        text: "text-amber-700",
        label: "Pending",
      },
      DEFAULT: {
        color: "blue",
        bg: "bg-blue-50",
        text: "text-blue-700",
        label: "Processing",
      },
    };

    const statusConfig = config[status] || config.DEFAULT;

    return (
      <Badge
        className={`px-3 py-1.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border-0`}
        color={statusConfig.color}
      >
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${statusConfig.bg.replace("bg-", "bg-").replace("-50", "-500")}`}
          />
          {statusConfig.label}
        </div>
      </Badge>
    );
  };

  return (
    <Page
      title="Stock Transfer Manage"
      subTitle="Stock Transfer Manage overview"
    >
      {modals.viewStockDetails?.isOpen && (
        <StockTransferDetailsModal
          isOpen
          setIsOpen={() => closeModal("viewStockDetails")}
          data={invoiceData}
        />
      )}
      <DataTable
        table={table}
        title="Stock Transfer Manage"
        columns={[
          { key: "transferNo", label: "Transfer No" },
          { key: "fromBranchName", label: "From" },
          { key: "toBranchName", label: "To" },
          {
            key: "status",
            label: "Status",
            render: (r) => getStatusBadge(r.status),
          },
          {
            key: "action",
            label: "Action",
            render: (row) => (
              <>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1 action view  rounded hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => handlePrintInvoice(row)}
                    title="View Transfer"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                {
                  row?.status !== "RECEIVED" &&
                  
                    <button
                    className="p-1 action edit  rounded hover:bg-gray-100 disabled:opacity-50"
                    onClick={() =>
                      navigate(`/inventory/receive-transfer/${row._id}`)
                    }
                    title="View Transfer"
                  >
                    <BoxIcon className="w-4 h-4 text-gray-600" />
                  </button>
                }
                </div>
              </>
            ),
          },
        ]}
      />
    </Page>
  );
};

export default StockTranaferPage;
