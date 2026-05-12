import { BoxIcon, Eye, ReceiptPoundSterling, ScanBarcode } from "lucide-react";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import AuditCreateModal from "./AuditCreateModal";
import { useNavigate } from "react-router-dom";

const StockAuditsListPage = () => {
  const navigate = useNavigate();
  const table = useTableManager("/audits");
  const { modals, openModal, closeModal } = useModalManager();

  return (
    <Page title="Stock Audits" subTitle="Inventory audit history & management">
      {modals.createAudit?.isOpen && (
        <AuditCreateModal
          isOpen={modals.createAudit.isOpen}
          setIsOpen={() => closeModal("createAudit")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Stock Audits"
        headerActions={[
          {
            variant: "gradient",
            label: "New Audit",
            onClick: () => openModal("createAudit"),
          },
        ]}
        columns={[
          { key: "auditNo", label: "Audit No" },
          { key: "status", label: "Status" },
          {
            key: "startedAt",
            label: "Started At",
            render: (r) => new Date(r.startedAt).toLocaleString(),
          },
          {
            key: "submittedAt",
            label: "Submitted At",
            render: (r) =>
              r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "-",
          },
          {
            key: "action",
            label: "Action",
            render: (row) => (
              <>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1 action view  rounded hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => navigate(`/stock-audit/report/${row._id}`)}
                    title="View Report"
                  >
                    <ReceiptPoundSterling className="w-4 h-4 text-gray-600" />
                  </button>
                  {row.status !== "SUBMITTED" && (
                    <button
                      className="p-1 action edit  rounded hover:bg-gray-100 disabled:opacity-50"
                      onClick={() => navigate(`/stock-audit/scan/${row._id}`)}
                      title="View Transfer"
                    >
                      <ScanBarcode className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </>
            ),
          },
        ]}
      />
    </Page>
  );
};

export default StockAuditsListPage;
