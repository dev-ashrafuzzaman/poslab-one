import { useState } from "react";
import Page from "../../components/common/Page";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Calendar } from "lucide-react";
import SupplierSelect from "../purchase/components/SupplierSelect";

/* ---------- Status Badge ---------- */
const StatusBadge = ({ status }) => {
  const map = {
    PAID: "success",
    PARTIAL: "warning",
    DUE: "danger",
  };
  return <Badge variant={map[status] || "default"}>{status}</Badge>;
};

export default function SupplierInvoiceStatement() {
  const { axiosSecure } = useAxiosSecure();

  const [supplier, setSupplier] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------- Generate Report ---------- */
  const generate = async () => {
    if (!supplier?._id) {
      alert("Please select a supplier");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosSecure.get(
        `/reports/statement/party-invoice/${supplier._id}`,
        {
          params: {
            from: from || undefined,
            to: to || undefined,
          },
        }
      );
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Supplier Invoice Statement">
      {/* ================= Filters ================= */}
      <Card className="mb-6">
        <div className="grid md:grid-cols-4 gap-4 items-end">
          {/* Supplier Select (Your Component) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <SupplierSelect
              value={supplier}
              onChange={setSupplier}
            />
          </div>

          {/* From Date */}
          <Input
            type="date"
            label="From Date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            prefix={<Calendar size={16} />}
          />

          {/* To Date */}
          <Input
            type="date"
            label="To Date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            prefix={<Calendar size={16} />}
          />

          <Button
            onClick={generate}
            disabled={loading || !supplier}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </Card>

      {/* ================= Report ================= */}
      {data && (
        <Card>
          {/* Header */}
          <div className="mb-4">
            <h2 className="font-semibold text-lg">
              {data.party.name} ({data.party.code})
            </h2>
            <p className="text-sm text-gray-600">
              Period: {data.period.from} → {data.period.to}
            </p>
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-4 gap-4 mb-6 text-sm">
            <SummaryItem
              label="Total Invoices"
              value={data.summary.totalInvoices}
            />
            <SummaryItem
              label="Total Credit"
              value={data.summary.totalCredit}
            />
            <SummaryItem
              label="Total Debit"
              value={data.summary.totalDebit}
            />
            <SummaryItem
              label="Net Balance"
              value={`${data.summary.netBalance.amount} ${data.summary.netBalance.type}`}
            />
          </div>

          {/* Aging Summary */}
          {data.summary.agingSummary && (
            <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
              {Object.entries(data.summary.agingSummary).map(
                ([k, v]) => (
                  <div
                    key={k}
                    className="p-3 border rounded bg-gray-50"
                  >
                    <div className="text-xs text-gray-500">
                      {k} Days
                    </div>
                    <div className="font-semibold">
                      {v}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Table */}
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">SL</th>
                <th className="p-2">Invoice No</th>
                <th className="p-2">Date</th>
                <th className="p-2 text-right">Invoice Amount</th>
                <th className="p-2 text-right">Paid</th>
                <th className="p-2 text-right">Balance</th>
                <th className="p-2">Status</th>
                <th className="p-2">Aging</th>
              </tr>
            </thead>

            <tbody>
              {data.rows.map((r) => (
                <tr
                  key={r.sl}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-2">{r.sl}</td>
                  <td className="p-2">{r.invoiceNo}</td>
                  <td className="p-2">{r.invoiceDate}</td>
                  <td className="p-2 text-right">
                    {r.invoiceAmount}
                  </td>
                  <td className="p-2 text-right">
                    {r.credit}
                  </td>
                  <td className="p-2 text-right">
                    {r.balance.amount} {r.balance.type}
                  </td>
                  <td className="p-2">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-2">{r.agingBucket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Page>
  );
}

/* ---------- Summary Item ---------- */
const SummaryItem = ({ label, value }) => (
  <div className="p-3 border rounded bg-gray-50">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
);
