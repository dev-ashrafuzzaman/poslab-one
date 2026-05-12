import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Page from "../../components/common/Page";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { 
  Calendar, 
  Download, 
  RefreshCw, 
  FileText, 
  User, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Filter,
  ChevronRight,
  Receipt,
  Wallet,
  PieChart,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Search
} from "lucide-react";
import SupplierSelect from "../purchase/components/SupplierSelect";

/* ================= Status Badge ================= */

const StatusBadge = ({ status }) => {
  const map = {
    PAID: { variant: "success", icon: CheckCircle, label: "Paid" },
    PARTIAL: { variant: "warning", icon: AlertCircle, label: "Partial" },
    DUE: { variant: "danger", icon: Clock, label: "Due" },
  };

  const config = map[status] || { variant: "default", icon: AlertCircle, label: status };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1.5 px-3 py-1">
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
};

/* ================= Summary Card ================= */

const SummaryCard = ({ icon: Icon, label, value, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-50 to-white border-blue-100 text-blue-700",
    green: "from-emerald-50 to-white border-emerald-100 text-emerald-700",
    purple: "from-purple-50 to-white border-purple-100 text-purple-700",
    orange: "from-orange-50 to-white border-orange-100 text-orange-700"
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-linear-to-br ${colorClasses[color]} p-5 rounded-xl border shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 bg-white/60 backdrop-blur-sm rounded-lg">
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
      </div>
    </motion.div>
  );
};

/* ================= Table Row ================= */

const TableRow = ({ row, index, isEven }) => {
  const balanceType = row?.runningBalance?.type;
  const balanceAmount = row?.runningBalance?.amount ?? 0;
  const isPositive = balanceType === 'Dr' || balanceType === 'Credit';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`border-t ${isEven ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}
    >
      <td className="p-3 text-gray-500 font-mono text-sm">{row?.sl}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700">{row?.date}</span>
        </div>
      </td>
      <td className="p-3">
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {row?.voucherNo || "-"}
        </span>
      </td>
      <td className="p-3 text-gray-600 max-w-xs truncate">{row?.description}</td>
      <td className="p-3 text-right">
        {row?.debit ? (
          <span className="font-medium text-gray-900">{row?.debit}</span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      <td className="p-3 text-right">
        {row?.credit ? (
          <span className="font-medium text-gray-900">{row?.credit}</span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      <td className="p-3 text-right">
        <span className={`font-medium ${
          isPositive ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {balanceAmount} {balanceType}
        </span>
      </td>
    </motion.tr>
  );
};

/* ================= Main Component ================= */

export default function PartyStatement() {
  const { axiosSecure } = useAxiosSecure();

  const [supplier, setSupplier] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= Generate ================= */

  const generate = async () => {
    if (!supplier?._id) {
      alert("Select supplier first");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosSecure.get(
        `/reports/statement/party/${supplier._id}`,
        {
          params: {
            from: from || undefined,
            to: to || undefined,
          },
        },
      );

      setData(res?.data?.data || res?.data || null);
    } catch (err) {
      console.error("Statement error", err);
      alert("Failed to load statement");
    } finally {
      setLoading(false);
    }
  };



  /* ================= Format Date Range ================= */

  const formatDateRange = (from, to) => {
    if (!from && !to) return "All time";
    if (from && to) return `${from} → ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Until ${to}`;
  };

  return (
    <Page title="Party Statement">
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Party Statement
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                <User className="w-4 h-4" />
                View detailed transaction history and aging analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
        <div className="p-5 bg-white rounded-xl border border-gray-50 shadow-sm">
              <div className="grid md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Select Supplier
                  </label>
                  <SupplierSelect 
                    value={supplier} 
                    onChange={setSupplier}
                    className="border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200/20"
                  />
                </div>

                <div>
                  <Input
                    type="date"
                    label="From Date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    prefix={<Calendar size={16} className="text-gray-400" />}
                    className="border-gray-200 focus:border-indigo-300"
                  />
                </div>

                <div>
                  <Input
                    type="date"
                    label="To Date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    prefix={<Calendar size={16} className="text-gray-400" />}
                    className="border-gray-200 focus:border-indigo-300"
                  />
                </div>

                <Button
                  onClick={generate}
                  disabled={loading}
                  className="h-11 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/25"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Generate</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
        </motion.div>

        {/* Report Section */}
        <AnimatePresence mode="wait">
          {data && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden">
                {/* Report Header */}
                <div className="bg-linear-to-r from-indigo-50/50 to-white p-6 border-b border-indigo-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {data?.party?.name || "-"}
                        </h2>
                        <Badge variant="outline" className="bg-white">
                          {data?.party?.code || "-"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateRange(data?.period?.from, data?.period?.to)}</span>
                        </div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Generated {new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="p-6">
                  <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <SummaryItem
                      icon={Wallet}
                      label="Opening Balance"
                      value={`${data?.summary?.openingBalance?.amount ?? 0} ${data?.summary?.openingBalance?.type ?? ""}`}
                      color="blue"
                    />
                    <SummaryItem
                      icon={TrendingUp}
                      label="Total Debit"
                      value={data?.summary?.totalDebit ?? 0}
                      color="green"
                    />
                    <SummaryItem
                      icon={TrendingDown}
                      label="Total Credit"
                      value={data?.summary?.totalCredit ?? 0}
                      color="orange"
                    />
                    <SummaryItem
                      icon={PieChart}
                      label="Closing Balance"
                      value={`${data?.summary?.closingBalance?.amount ?? 0} ${data?.summary?.closingBalance?.type ?? ""}`}
                      color="purple"
                    />
                  </div>

                  {/* Ledger Statement Table */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Ledger Statement</h3>
                      <div className="flex-1" />
                      <div className="text-xs text-gray-400">
                        {data?.rows?.length || 0} transactions
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b">
                            <th className="p-3 text-left font-medium text-gray-600">SL</th>
                            <th className="p-3 text-left font-medium text-gray-600">Date</th>
                            <th className="p-3 text-left font-medium text-gray-600">Reference</th>
                            <th className="p-3 text-left font-medium text-gray-600">Description</th>
                            <th className="p-3 text-right font-medium text-gray-600">Debit</th>
                            <th className="p-3 text-right font-medium text-gray-600">Credit</th>
                            <th className="p-3 text-right font-medium text-gray-600">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data?.rows?.map((r, idx) => (
                            <TableRow 
                              key={r?.sl} 
                              row={r} 
                              index={idx}
                              isEven={idx % 2 === 0}
                            />
                          ))}
                          {(!data?.rows || data.rows.length === 0) && (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-gray-400">
                                No transactions found for this period
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Invoice Wise Summary */}
                  {data?.invoiceWise?.rows?.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <Receipt className="w-4 h-4 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Invoice Wise Summary</h3>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b">
                              <th className="p-3 text-left font-medium text-gray-600">SL</th>
                              <th className="p-3 text-left font-medium text-gray-600">Invoice</th>
                              <th className="p-3 text-left font-medium text-gray-600">Date</th>
                              <th className="p-3 text-right font-medium text-gray-600">Amount</th>
                              <th className="p-3 text-right font-medium text-gray-600">Paid</th>
                              <th className="p-3 text-right font-medium text-gray-600">Balance</th>
                              <th className="p-3 text-center font-medium text-gray-600">Status</th>
                              <th className="p-3 text-center font-medium text-gray-600">Aging</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data?.invoiceWise?.rows?.map((r, idx) => (
                              <motion.tr
                                key={r?.sl}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                className="border-t hover:bg-purple-50/30 transition-colors"
                              >
                                <td className="p-3 text-gray-500">{r?.sl}</td>
                                <td className="p-3">
                                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                    {r?.invoiceNo || "-"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{r?.date}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-right font-medium">{r?.amount ?? 0}</td>
                                <td className="p-3 text-right text-emerald-600 font-medium">{r?.paid ?? 0}</td>
                                <td className="p-3 text-right font-semibold">{r?.balance ?? 0}</td>
                                <td className="p-3 text-center">
                                  <StatusBadge status={r?.status} />
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant="outline" className="bg-gray-50">
                                    {r?.aging ?? 0} days
                                  </Badge>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Aging Summary */}
                  {data?.agingSummary && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Aging Summary</h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(data?.agingSummary || {}).map(([k, v], idx) => {
                          const colors = [
                            "from-emerald-50 to-white border-emerald-100",
                            "from-blue-50 to-white border-blue-100",
                            "from-amber-50 to-white border-amber-100",
                            "from-rose-50 to-white border-rose-100"
                          ];
                          
                          return (
                            <motion.div
                              key={k}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`bg-linear-to-br ${colors[idx % 4]} p-4 rounded-xl border shadow-sm`}
                            >
                              <div className="text-xs text-gray-500 mb-1">{k} Days</div>
                              <div className="text-xl font-bold text-gray-900">{v}</div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!data && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="p-4 bg-linear-to-br from-indigo-50 to-indigo-100/50 rounded-full mb-4">
                  <Search className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Statement Generated</h3>
                <p className="text-gray-400 text-sm text-center max-w-md mb-6">
                  Select a supplier and date range to generate their statement of accounts
                </p>
                <Button
                  onClick={generate}
                  disabled={!supplier}
                  variant={!supplier ? "outline" : "primary"}
                  className="flex text-white bg-linear-to-r from-indigo-600 to-indigo-700"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Generate Statement
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </Page>
  );
}

/* ================= Summary Item ================= */

const SummaryItem = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: "from-blue-50 to-white border-blue-100",
    green: "from-emerald-50 to-white border-emerald-100",
    orange: "from-orange-50 to-white border-orange-100",
    purple: "from-purple-50 to-white border-purple-100",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-linear-to-br ${colorClasses[color]} p-4 rounded-xl border shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value ?? 0}</div>
    </motion.div>
  );
};