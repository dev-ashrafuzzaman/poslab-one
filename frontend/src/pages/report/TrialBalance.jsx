import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Calendar, RefreshCw, TrendingUp, TrendingDown, X, Filter, Printer, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Page from "../../components/common/Page";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const formatToApiDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

const formatSingleLineBalance = (row) => {
  const isDebitSide = row.closingDebit > 0;
  const isCreditSide = row.closingCredit > 0;
  
  if (!isDebitSide && !isCreditSide) return "0";
  
  const amount = isDebitSide ? row.closingDebitRounded : row.closingCreditRounded;
  const formattedNumber = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
  
  if (isCreditSide) {
    return `(${formattedNumber})`;
  }
  
  return formattedNumber;
};

const formatSummaryCardCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
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

  const getAccountTypeColor = (type) => {
    const colors = {
      ASSET: "bg-blue-50 text-blue-700 border-blue-200",
      LIABILITY: "bg-red-50 text-red-700 border-red-200",
      EQUITY: "bg-purple-50 text-purple-700 border-purple-200",
      INCOME: "bg-green-50 text-green-700 border-green-200",
      EXPENSE: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colors[type?.toUpperCase()] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <Page title="Trial Balance">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 select-none">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trial Balance Engine</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Verify global ledger symmetry, floating point deltas, and cross-ledger offsets instantly.
            </p>
          </div>
          
          {tbData && (
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-xl border ${tbData.metaSummary?.isBalanced ? 'bg-emerald-50/60 text-emerald-700 border-emerald-200' : 'bg-rose-50/60 text-rose-700 border-rose-200'}`}>
                <div className="flex items-center gap-2">
                  {tbData.metaSummary?.isBalanced ? (
                    <TrendingUp size={16} className="text-emerald-600" />
                  ) : (
                    <TrendingDown size={16} className="text-rose-600" />
                  )}
                  <span className="font-bold text-sm">
                    {tbData.metaSummary?.isBalanced ? "Ledger Balanced" : "Discrepancy Warning"}
                  </span>
                </div>
                <div className="text-[11px] font-medium opacity-90 mt-0.5">
                  {tbData.metaSummary?.isBalanced ? "Debits precisely match Credit lines." : "Action required: Audit recent general journals."}
                </div>
              </div>
            </div>
          )}
        </div>

        <Card className="print:hidden border border-gray-200 shadow-xs bg-gray-50/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 select-none">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-500" />
                    Target Balance Date *
                  </div>
                </label>
                <Controller
                  name="TBDate"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" {...field} className="w-full bg-white font-mono text-sm" />
                  )}
                />
              </div>

              {showComparison && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 select-none">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-500" />
                      Comparison Balance Date
                    </div>
                  </label>
                  <Controller
                    name="comparisonTBDate"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input type="date" {...field} className="w-full bg-white pr-8 font-mono text-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            reset({ comparisonTBDate: "" });
                            setShowComparison(false);
                          }}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
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
                    className="w-full md:w-auto h-10 border-dashed text-xs font-semibold border-gray-300 hover:bg-white text-gray-600"
                  >
                    + Compare Historic Range
                  </Button>
                </div>
              )}

              <div className="flex items-end">
                <Button 
                  onClick={handleSubmit(onSubmit)} 
                  disabled={loading}
                  className="w-full md:w-auto h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin mr-2" /> Processing Pipeline...
                    </>
                  ) : (
                    <>
                      <Filter size={14} className="mr-2" /> Execute Ledger Matrix
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto justify-end">
              <Button
                variant="outlined"
                onClick={handleReset}
                className="h-10 bg-white hover:bg-gray-50 text-xs text-gray-600"
              >
                <RefreshCw size={13} className="mr-1.5 text-gray-400" /> Reset
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/journal/entries")}
                className="h-10 bg-white hover:bg-gray-50 text-xs text-gray-600"
              >
                Dismiss Terminal
              </Button>
            </div>
          </div>
        </Card>

        {tbData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden select-none">
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aggregate Dr Position</p>
                <p className="text-2xl font-black text-blue-600 font-mono mt-1">
                  {formatSummaryCardCurrency(tbData.metaSummary?.totalDebitRaw || 0)}
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aggregate Cr Position</p>
                <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
                  {formatSummaryCardCurrency(tbData.metaSummary?.totalCreditRaw || 0)}
                </p>
              </div>

              <div className={`border p-4 rounded-xl shadow-xs bg-white ${tbData.metaSummary?.isBalanced ? 'border-emerald-200' : 'border-rose-200'}`}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delta Variance System</p>
                <p className={`text-2xl font-black font-mono mt-1 ${tbData.metaSummary?.isBalanced ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatSummaryCardCurrency(Math.abs((tbData.metaSummary?.totalDebitRaw || 0) - (tbData.metaSummary?.totalCreditRaw || 0)))}
                </p>
              </div>
            </div>

            <Card className="border border-gray-200 overflow-hidden shadow-xs">
              <div className="bg-white px-6 py-5 border-b border-gray-200 select-none">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-md font-bold text-gray-900 tracking-tight uppercase">
                      {tbData.company?.name || "ENTERPRISE CORE TRIAL BALANCE WORKFLOW"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      Accounting Snapshot Window Layer • Period Lock: {tbData.TBDate}
                      {tbData.comparisonTBDate && ` vs Delta Range Reference: ${tbData.comparisonTBDate}`}
                    </p>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-[11px] uppercase font-bold text-gray-400">Statement Render Timestamp</div>
                    <div className="text-xs font-semibold text-gray-700 mt-0.5">{new Date().toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-600 text-[11px] font-bold uppercase font-mono tracking-wider border-b border-gray-200 select-none">
                      <th className="p-4 w-[15%]">General Ledger Code</th>
                      <th className="p-4 w-[40%]">Account Particular Description</th>
                      <th className="p-4 w-[15%]">CoA Layer Type</th>
                      {tbData.comparisonTBDate && <th className="p-4 w-[15%] text-right">Historical Reference</th>}
                      <th className="p-4 w-[15%] text-right">Net Closing Balance (BDT)</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-100 text-sm font-mono">
                    {tbData.rows?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors duration-75 align-middle">
                        <td className="p-4 font-semibold text-gray-500 tracking-tight">{row.code}</td>
                        
                        <td className="p-4">
                          <div className="font-bold text-gray-900 tracking-tight">{row.name}</div>
                        </td>
                        
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase select-none ${getAccountTypeColor(row.type)}`}>
                            {row.type}
                          </span>
                        </td>
                        
                        {tbData.comparisonTBDate && (
                          <td className="p-4 text-right text-gray-600 font-bold">
                            {row.previousBalance ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(row.previousBalance)) : "-"}
                          </td>
                        )}
                        
                        <td className={`p-4 text-right font-black text-md ${row.closingCredit > 0 ? 'text-rose-600' : 'text-blue-700'}`}>
                          {formatSingleLineBalance(row)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  
                  <tfoot className="bg-gray-900 border-t border-gray-800 text-white font-mono font-black select-none">
                    <tr>
                      <td colSpan={tbData.comparisonTBDate ? 4 : 3} className="p-4 text-right text-xs uppercase tracking-wider text-gray-400">
                        Balanced Core Ledger Matrix Sum Totals:
                      </td>
                      <td className="p-4 text-right text-md font-extrabold tracking-tight text-emerald-400">
                        {tbData.metaSummary?.totalDebitFormatted}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </Page>
  );
};

export default TrialBalance;