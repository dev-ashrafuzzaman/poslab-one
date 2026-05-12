import { useState } from "react";
import { Calendar, Printer } from "lucide-react";
import Page from "../../components/common/Page";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useAxiosSecure from "../../hooks/useAxiosSecure";

export default function CashFlow() {

  const { axiosSecure } = useAxiosSecure();

  const [from, setFrom] = useState(
    new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0]
  );

  const [to, setTo] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [data, setData] = useState(null);

  const loadReport = async () => {

    const res = await axiosSecure.get(
      "/reports/profit-loss/cash-flow",
      {
        params: { from, to },
      }
    );

    setData(res.data.data);
  };

  const money = (v) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(v || 0);

  return (
    <Page title="Cash Flow Statement">

      <Card className="print:hidden mb-6">
        <div className="flex gap-4 items-end">

          <Input
            type="date"
            label="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            prefix={<Calendar size={16} />}
          />

          <Input
            type="date"
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            prefix={<Calendar size={16} />}
          />

          <Button onClick={loadReport}>
            Generate
          </Button>

          <Button
            variant="outlined"
            prefix={<Printer size={16} />}
            onClick={() => window.print()}
          >
            Print
          </Button>

        </div>
      </Card>

      {data && (

        <div className="a4 bg-white p-8 shadow rounded">

          <h1 className="text-xl font-bold text-center mb-6">
            Cash Flow Statement
          </h1>

          <p className="text-center text-sm text-gray-500 mb-8">
            Period: {data.period.from} → {data.period.to}
          </p>

          {/* OPERATING */}

          <Section title="Operating Activities">

            <Row
              label="Net Profit"
              value={data.operating.netProfit}
            />

            <Row
              label="Increase in Receivable"
              value={-data.operating.adjustments.changeInReceivable}
            />

            <Row
              label="Increase in Inventory"
              value={-data.operating.adjustments.changeInInventory}
            />

            <Row
              label="Increase in Payable"
              value={data.operating.adjustments.changeInPayable}
            />

            <TotalRow
              label="Net Cash from Operating"
              value={data.operating.cashFromOperations}
            />

          </Section>

          {/* FINANCING */}

          <Section title="Financing Activities">

            <Row
              label="Capital Increase"
              value={data.financing.capitalIncrease}
            />

          </Section>

          {/* FINAL */}

          <div className="border-t pt-4 mt-6 flex justify-between font-bold text-lg">

            <span>Net Cash Flow</span>

            <span
              className={
                data.netCashFlow >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {money(data.netCashFlow)}
            </span>

          </div>

        </div>
      )}

    </Page>
  );
}


/* COMPONENTS */

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="font-semibold border-b mb-2">
      {title}
    </h2>
    {children}
  </div>
);

const Row = ({ label, value }) => (

  <div className="flex justify-between text-sm py-1">
    <span>{label}</span>
    <span>{value?.toFixed(2)}</span>
  </div>

);

const TotalRow = ({ label, value }) => (

  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
    <span>{label}</span>
    <span>{value?.toFixed(2)}</span>
  </div>

);