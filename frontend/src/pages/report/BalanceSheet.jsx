import { useEffect, useState } from "react";
import { Calendar, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import Page from "../../components/common/Page";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const BalanceSheet = () => {
  const { axiosSecure } = useAxiosSecure();

  const [data, setData] = useState(null);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);

    try {
      const res = await axiosSecure.get(
        "/reports/balance-sheet",
        {
          params: { to: date },
        }
      );

      setData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(amount);

  const getAccountTypeColor = (type) => {
    const colors = {
      asset: "text-blue-600",
      liability: "text-red-600",
      equity: "text-purple-600",
    };

    return colors[type];
  };

  if (!data) return null;

  return (
    <Page title="Balance Sheet">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              Balance Sheet
            </h1>
            <p className="text-gray-500 text-sm">
              As of {new Date(data.asOf).toLocaleDateString()}
            </p>
          </div>

          <div
            className={`px-3 py-2 rounded ${
              data.totals.isBalanced
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {data.totals.isBalanced ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}

              {data.totals.isBalanced
                ? "Balanced"
                : "Unbalanced"}
            </div>
          </div>
        </div>

        {/* FILTER */}
        <Card>
          <div className="flex gap-4 items-end">
            <Input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

            <Button
              onClick={fetchReport}
              disabled={loading}
            >
              {loading ? "Loading..." : "Generate"}
            </Button>
          </div>
        </Card>

        {/* BALANCE SHEET */}
        <Card>
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ASSETS */}
            <div>
              <h2 className="font-semibold mb-4 text-blue-700">
                Assets
              </h2>

              {data.assets.current.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1"
                >
                  <span>{a.name}</span>
                  <span>
                    {formatCurrency(a.amount)}
                  </span>
                </div>
              ))}

              <div className="border-t mt-3 pt-2 flex justify-between font-semibold">
                <span>Total Assets</span>
                <span>
                  {formatCurrency(data.totals.assets)}
                </span>
              </div>
            </div>

            {/* LIABILITIES */}
            <div>
              <h2 className="font-semibold mb-4 text-red-700">
                Liabilities
              </h2>

              {data.liabilities.current.map((l, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1"
                >
                  <span>{l.name}</span>
                  <span>
                    {formatCurrency(l.amount)}
                  </span>
                </div>
              ))}

              <div className="border-t mt-3 pt-2 flex justify-between font-semibold">
                <span>Total Liabilities</span>
                <span>
                  {formatCurrency(
                    data.totals.liabilities
                  )}
                </span>
              </div>
            </div>

            {/* EQUITY */}
            <div>
              <h2 className="font-semibold mb-4 text-purple-700">
                Equity
              </h2>

              {data.equity.map((e, i) => (
                <div
                  key={i}
                  className="flex justify-between py-1"
                >
                  <span>{e.name}</span>
                  <span>
                    {formatCurrency(e.amount)}
                  </span>
                </div>
              ))}

              <div className="border-t mt-3 pt-2 flex justify-between font-semibold">
                <span>Total Equity</span>
                <span>
                  {formatCurrency(data.totals.equity)}
                </span>
              </div>

              <div className="border-t mt-4 pt-2 flex justify-between font-bold">
                <span>
                  Liabilities + Equity
                </span>
                <span>
                  {formatCurrency(
                    data.totals.liabilitiesPlusEquity
                  )}
                </span>
              </div>
            </div>

          </div>
        </Card>

        {/* SUMMARY */}
        <Card>
          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm">
                Total Assets
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(data.totals.assets)}
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded">
              <div className="text-sm">
                Total Liabilities
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(
                  data.totals.liabilities
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded">
              <div className="text-sm">
                Equity
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(data.totals.equity)}
              </div>
            </div>

          </div>
        </Card>
      </motion.div>
    </Page>
  );
};

export default BalanceSheet;