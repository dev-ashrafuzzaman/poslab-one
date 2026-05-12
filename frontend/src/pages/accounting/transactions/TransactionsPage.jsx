import Page from "../../../components/common/Page";
import DataTable from "../../../components/table/DataTable";
import useTableManager from "../../../hooks/useTableManager";

const TransactionsPage = () => {
  const table = useTableManager("/accounts/transactions");

  return (
    <Page
      title="Transactions"
      subTitle="Manage your organization transactions"
    >
      <DataTable
        table={table}
        title="Transactions"
        columns={[
          { key: "voucherNo", label: "Voucher No" },

          {
            key: "date",
            label: "Date",
            render: (r) =>
              new Date(r.date).toLocaleString("en-BD", {
                dateStyle: "medium",
                timeStyle: "short",
              }),
          },

          { key: "refType", label: "Type" },

          { key: "accountName", label: "Account" },

          { key: "branchName", label: "Branch" },

          {
            key: "partyName",
            label: "Party",
            render: (r) =>
              r.partyName ? (
                <>
                  {r.partyName}
                  {r.partyType && (
                    <small style={{ display: "block", color: "#888" }}>
                      {r.partyType}
                    </small>
                  )}
                </>
              ) : (
                "-"
              ),
          },

          {
            key: "debit",
            label: "Debit",
            render: (r) =>
              r.debit ? (
                <span style={{ color: "green", fontWeight: 600 }}>
                  {r.debit.toLocaleString()}
                </span>
              ) : (
                "-"
              ),
          },

          {
            key: "credit",
            label: "Credit",
            render: (r) =>
              r.credit ? (
                <span style={{ color: "red", fontWeight: 600 }}>
                  {r.credit.toLocaleString()}
                </span>
              ) : (
                "-"
              ),
          }
        ]}
      />
    </Page>
  );
};

export default TransactionsPage;