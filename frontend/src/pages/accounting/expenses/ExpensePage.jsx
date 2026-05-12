import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useModalManager from "../../../hooks/useModalManager";
import useTableManager from "../../../hooks/useTableManager";
import { formatBDDateTime } from "../../../utils/formatDate";
import ExpenseCreateModal from "./ExpenseCreateModal";

export default function ExpensePage() {
  const table = useTableManager("/expenses");
  const { modals, openModal, closeModal } = useModalManager();
  return (
    <Page title="Expenses" subTitle="Manage business expenses">
      {modals.createExpense?.isOpen && (
        <ExpenseCreateModal
          isOpen={modals.createExpense.isOpen}
          setIsOpen={() => closeModal("createExpense")}
          refetch={table.refetch}
        />
      )}

      <DataTable
        table={table}
        title="Expense List"
        headerActions={[
          {
            label: "Add Expense",
            variant: "gradient",
            onClick: () => openModal("createExpense"),
          },
        ]}
        columns={[
          {
            key: "createdAt",
            label: "Date",
          },
          { key: "category", label: "Category" },
          { key: "amount", label: "Amount" },
          { key: "referenceNo", label: "Reference" },
          { key: "payment", label: "Payment Method" },
          { key: "description", label: "Description" },
          { key: "status", label: "Status" },
        ]}
      />
    </Page>
  );
}
