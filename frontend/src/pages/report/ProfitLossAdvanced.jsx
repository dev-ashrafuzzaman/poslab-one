import { useState } from "react";
import { Calendar, Printer } from "lucide-react";
import { motion } from "framer-motion";
import Page from "../../components/common/Page";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const today = new Date().toISOString().split("T")[0];

export default function ProfitLossAdvanced() {
  const { axiosSecure } = useAxiosSecure();

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const [compareFrom, setCompareFrom] = useState("");
  const [compareTo, setCompareTo] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(
        "/reports/profit-loss/advanced",
        {
          params: {
            from,
            to,
            compareFrom: compareFrom || undefined,
            compareTo: compareTo || undefined,
          },
        }
      );
      setData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const current = data?.current;
  const cmp = data?.comparative;

  return (
    <Page title="Profit & Loss (Advanced)">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* ================= Filters ================= */}
        <Card className="print:hidden">
          <div className="grid md:grid-cols-5 gap-4 items-end">
            <Input
              type="date"
              label="From Date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              prefix={<Calendar size={16} />}
            />
            <Input
              type="date"
              label="To Date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              prefix={<Calendar size={16} />}
            />
            <Input
              type="date"
              label="Compare From"
              value={compareFrom}
              onChange={(e) => setCompareFrom(e.target.value)}
            />
            <Input
              type="date"
              label="Compare To"
              value={compareTo}
              onChange={(e) => setCompareTo(e.target.value)}
            />

            <div className="flex gap-2">
              <Button onClick={loadReport} disabled={loading}>
                {loading ? "Loading..." : "Generate"}
              </Button>
              {/* <Button
                variant="outlined"
                prefix={<Printer size={16} />}
                onClick={() => window.print()}
              >
                Print
              </Button> */}
            </div>
          </div>
        </Card>

        {/* ================= Report ================= */}
        {data && (
          <div className="a4 bg-white p-8 rounded shadow print:shadow-none">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold uppercase">
                Profit & Loss Statement
              </h1>
              <p className="text-sm text-gray-600">
                Period: {from} → {to}
              </p>
            </div>

            {/* ================= Gross Profit ================= */}
            <div className="mb-6">
              <h2 className="font-semibold border-b pb-1 mb-2">
                Gross Profit
              </h2>

              <Row
                label="Sales Income"
                value={current.sales}
                compare={cmp?.sales}
              />
              <Row
                label="Cost of Goods Sold (COGS)"
                value={-current.cogs}
                compare={cmp ? -cmp.cogs : null}
              />

              <TotalRow
                label="Gross Profit"
                value={current.grossProfit}
                compare={cmp?.grossProfit}
              />
            </div>
{/* ================= Operating Expenses ================= */}

<div className="mb-6">
  <h2 className="font-semibold border-b pb-1 mb-2">
    Operating Expenses
  </h2>

  {current?.expenseBreakdown?.map((e) => (
    <Row
      key={e.code}
      label={e.name}
      value={e.amount}
    />
  ))}

  <TotalRow
    label="Total Operating Expense"
    value={current.operatingExpense}
  />
</div>
            {/* ================= Other Income ================= */}
            <div className="mb-6">
              <h2 className="font-semibold border-b pb-1 mb-2">
                Other Income
              </h2>

              <Row
                label="Other Income"
                value={current.otherIncome}
                compare={cmp?.otherIncome}
              />
            </div>

            {/* ================= Net Profit ================= */}
            <div className="border-t pt-4 mt-6 flex justify-between text-lg font-bold">
              <span>
                {current.netProfit >= 0
                  ? "Net Profit"
                  : "Net Loss"}
              </span>
              <span
                className={
                  current.netProfit >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {current.netProfit.toFixed(2)}
              </span>
            </div>

            {cmp && (
              <div className="text-sm text-gray-600 mt-2">
                Comparative Net:{" "}
                <strong>{cmp.netProfit.toFixed(2)}</strong>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </Page>
  );
}

/* ================= Reusable Rows ================= */

const Row = ({ label, value, compare = null }) => {
  const diff =
    compare !== null ? value - compare : null;

  return (
    <div className="flex justify-between text-sm py-1">
      <span>{label}</span>
      <div className="flex gap-4">
        <span>{value.toFixed(2)}</span>
        {compare !== null && (
          <span
            className={
              diff >= 0
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {diff >= 0 ? "▲" : "▼"}{" "}
            {Math.abs(diff).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

const TotalRow = ({ label, value, compare = null }) => {
  const diff =
    compare !== null ? value - compare : null;

  return (
    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
      <span>{label}</span>
      <div className="flex gap-4">
        <span>{value.toFixed(2)}</span>
        {compare !== null && (
          <span
            className={
              diff >= 0
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {diff >= 0 ? "▲" : "▼"}{" "}
            {Math.abs(diff).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};
