import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Calendar, FileDown, Printer, RefreshCw, TrendingUp, TrendingDown, X, Download, Filter } from "lucide-react";
import { motion } from "framer-motion";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Page from "../../components/common/Page";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNavigate } from "react-router-dom";

const formatToApiDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const TrialBalance = () => {
  const navigate = useNavigate();
  const { axiosSecure } = useAxiosSecure();
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      TBDate: new Date().toISOString().split("T")[0],
      comparisonTBDate: "",
    },
  });

  const [tbData, setTbData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const watchComparisonDate = watch("comparisonTBDate");

  const onSubmit = async (formData) => {
    if (!formData.TBDate) {
      return alert("Please select a Trial Balance Date first");
    }

    setLoading(true);

    try {
      const params = {
        TBDate: formatToApiDate(formData.TBDate),
      };
      if (formData.comparisonTBDate) {
        params.comparisonTBDate = formatToApiDate(formData.comparisonTBDate);
      }

      const res = await axiosSecure.get("/reports/trial-balance/", { params });

      if (res?.data?.data) {
        setTbData(res.data.data);
      } else {
        setTbData(null);
      }
    } catch (err) {
      console.error("Trial Balance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setTbData(null);
    setShowComparison(false);
  };

  const exportToExcel = () => {
    // Excel export logic here
  };

  const exportToPDF = () => {
    // PDF export logic here
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      Asset: "bg-blue-100 text-blue-800",
      Liability: "bg-red-100 text-red-800",
      Equity: "bg-purple-100 text-purple-800",
      Revenue: "bg-green-100 text-green-800",
      Expense: "bg-amber-100 text-amber-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <Page title="Trial Balance">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 🔹 Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
            <p className="text-gray-600 mt-1">Review and verify account balances before closing</p>
          </div>
          
          {tbData && (
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${tbData.isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center gap-2">
                  {tbData.isBalanced ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span className="font-semibold">
                    {tbData.isBalanced ? "Balanced" : "Unbalanced"}
                  </span>
                </div>
                <div className="text-xs mt-0.5">
                  {tbData.isBalanced ? "Debits = Credits" : "Check for discrepancies"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🔹 Control Panel */}
        <Card className="print:hidden border border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    Trial Balance Date
                  </div>
                </label>
                <Controller
                  name="TBDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      {...field}
                      className="w-full"
                    />
                  )}
                />
              </div>

              {showComparison && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Comparison Date
                    </div>
                  </label>
                  <Controller
                    name="comparisonTBDate"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          className="w-full pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            reset({ comparisonTBDate: "" });
                            setShowComparison(false);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  />
                </div>
              )}

              {!showComparison && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setShowComparison(true)}
                    className="w-full md:w-auto"
                  >
                    + Add Comparison
                  </Button>
                </div>
              )}

              <div className="col-span-full md:col-span-1 flex items-end gap-2">
                <Button 
                  onClick={handleSubmit(onSubmit)} 
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Filter size={16} className="mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outlined"
                prefix={<RefreshCw size={16} />}
                onClick={handleReset}
                className="hover:bg-gray-50"
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/journal/entries")}
                className="hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        </Card>

        {/* 🔹 Report */}
        {tbData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
              <div className="bg-linear-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Debit</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {formatCurrency(tbData.totalDebit)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-blue-700 font-bold">DR</span>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Credit</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {formatCurrency(tbData.totalCredit)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                    <span className="text-green-700 font-bold">CR</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                tbData.isBalanced 
                  ? 'bg-linear-to-r from-green-50 to-green-100 border-green-200' 
                  : 'bg-linear-to-r from-red-50 to-red-100 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Difference</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      tbData.isBalanced ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {formatCurrency(Math.abs(tbData.totalDebit - tbData.totalCredit))}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    tbData.isBalanced ? 'bg-green-200' : 'bg-red-200'
                  }`}>
                    {tbData.isBalanced ? (
                      <TrendingUp className="text-green-700" size={20} />
                    ) : (
                      <TrendingDown className="text-red-700" size={20} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Card */}
            <Card className="border border-gray-200 overflow-hidden">
              {/* Report Header */}
              <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {tbData.company?.name || "Richwear Trial Balance"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Trial Balance • As of {tbData.TBDate}
                      {tbData.comparisonTBDate && (
                        <span className="text-gray-500">
                          {" "}vs {tbData.comparisonTBDate}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Report Date</div>
                      <div className="font-medium">{new Date().toLocaleDateString()}</div>
                    </div>
                    
                    {/* <div className="print:hidden flex gap-2">
                      <Button
                        variant="outlined"
                        size="sm"
                        prefix={<Printer size={14} />}
                        onClick={() => window.print()}
                      >
                        Print
                      </Button>
                      <Button
                        variant="outlined"
                        size="sm"
                        prefix={<Download size={14} />}
                        onClick={exportToExcel}
                      >
                        Export
                      </Button>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        GL Code
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Account Name
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      {tbData.comparisonTBDate && (
                        <th className="text-right p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Previous
                        </th>
                      )}
                      <th className="text-right p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Debit (DR)
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Credit (CR)
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-200">
                    {tbData?.rows?.map((row, i) => (
                      <tr 
                        key={i}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4">
                          <div className="font-mono text-sm font-medium text-gray-900">
                            {row.code}
                          </div>
                        </td>
                        
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{row.name}</div>
                          {row.description && (
                            <div className="text-xs text-gray-500 mt-1">{row.description}</div>
                          )}
                        </td>
                        
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(row.type)}`}>
                            {row.type}
                          </span>
                        </td>
                        
                        {tbData.comparisonTBDate && (
                          <td className="p-4 text-right">
                            <div className="text-gray-900">
                              {formatCurrency(row.previousBalance || 0)}
                            </div>
                            {row.balanceChange && (
                              <div className={`text-xs ${row.balanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {row.balanceChange >= 0 ? '↗' : '↘'} {Math.abs(row.balanceChange)}%
                              </div>
                            )}
                          </td>
                        )}
                        
                        <td className="p-4 text-right">
                          {row.closingDebit > 0 ? (
                            <div className="font-medium text-blue-700">
                              {formatCurrency(row.closingDebit)}
                            </div>
                          ) : (
                            <div className="text-gray-400">—</div>
                          )}
                        </td>
                        
                        <td className="p-4 text-right">
                          {row.closingCredit > 0 ? (
                            <div className="font-medium text-green-700">
                              {formatCurrency(row.closingCredit)}
                            </div>
                          ) : (
                            <div className="text-gray-400">—</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={tbData.comparisonTBDate ? 4 : 3} className="p-4 text-right font-semibold text-gray-900">
                        Total
                      </td>
                      <td className="p-4 text-right font-bold text-blue-900">
                        {formatCurrency(tbData.totalDebit)}
                      </td>
                      <td className="p-4 text-right font-bold text-green-900">
                        {formatCurrency(tbData.totalCredit)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Report Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                      <span>Debit Accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600" />
                      <span>Credit Accounts</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="font-medium">{tbData.rows?.length || 0}</span> Accounts
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tbData.isBalanced
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tbData.isBalanced ? "✓ Balanced" : "⚠ Unbalanced"}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 🔹 Empty State */}
        {!tbData && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="border border-gray-200">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Trial Balance Generated</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Select a trial balance date and generate your report to view account balances and verify ledger accuracy.
                </p>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  className="mx-auto"
                >
                  Generate Your First Report
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </Page>
  );
};

export default TrialBalance;