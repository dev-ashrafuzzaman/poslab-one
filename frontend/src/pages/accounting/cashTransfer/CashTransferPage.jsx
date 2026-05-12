import CashTransferCreateModal from "./CashTransferCreateModal";
import useModalManager from "../../../hooks/useModalManager";
import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";
import { useAuth } from "../../../context/useAuth";
import CashTransferReceiveModal from "./CashTransferReceiveModal";
import { useState } from "react";

const CashTransferPage = () => {
  const { modals, openModal, closeModal } = useModalManager();
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const table = useTableManager("/cash-transfer");

  const { user } = useAuth();
  const handleReceive = async (row) => {
    setSelectedTransfer(row);
    openModal("receiveTransfer");
  };

  return (
    <Page
      title="Cash Transfers"
      subTitle="Manage branch to main warehouse transfers"
    >
      {modals.createTransfer?.isOpen && (
        <CashTransferCreateModal
          isOpen={modals.createTransfer.isOpen}
          setIsOpen={() => closeModal("createTransfer")}
          refetch={table.refetch}
        />
      )}
      {modals.receiveTransfer?.isOpen && (
        <CashTransferReceiveModal
          isOpen={modals.receiveTransfer.isOpen}
          setIsOpen={() => closeModal("receiveTransfer")}
          refetch={table.refetch}
          transfer={selectedTransfer}
        />
      )}

      <DataTable
        table={table}
        title="Cash Transfers"
        headerActions={[
          {
            variant: "gradient",
            label: "Create Transfer",
            onClick: () => openModal("createTransfer"),
          },
        ]}
        columns={[
          { key: "transferCode", label: "Transfer Code" },
          { key: "amount", label: "Amount" },
          { key: "fromBranchName", label: "From Branch" },
          { key: "toBranchName", label: "To Branch" },

          { key: "createdByName", label: "Created By" },
          { key: "createdAt", label: "Created Date" },
          { key: "narration", label: "Narration" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`${
                  r.status === "PENDING" ? "status rejected" : "status approved"
                }`}
              >
                {r.status}
              </span>
            ),
          },
          {
            key: "action",
            label: "Action",
            render: (row) => {
              const canReceive =
                row.status === "PENDING" &&
                row.toBranchId === user.branchId &&
                ["Manager", "Accountant", "Admin"].includes(user.roleName);

              if (!canReceive) return null;

              return (
                <button
                  onClick={() => handleReceive(row)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded"
                >
                  Receive
                </button>
              );
            },
          },
        ]}
      />
    </Page>
  );
};

export default CashTransferPage;
