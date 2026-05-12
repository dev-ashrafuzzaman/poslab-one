import { useForm, Controller, useWatch } from "react-hook-form";
import { useMemo, useState, useEffect } from "react";
import Page from "../../components/common/Page";
import Button from "../../components/ui/Button";
import ReportSmartSelect from "../../components/common/ReportSmartSelect";
import useAxiosSecure from "../../hooks/useAxiosSecure";

import {
  BarChart3,
  RefreshCw,
  Printer,
  Calendar,
  Building2,
  Tags,
  User,
  TrendingUp,
  Package,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Users,
  ShoppingCart,
  Receipt,
  FileText,
  PieChart,
  LineChart,
  Activity,
  ChevronDown,
  ChevronRight,
  DownloadCloud,
  Filter,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Award,
  TrendingDown,
  Sparkles,
  Layers,
  Grid3x3,
  Table as TableIcon,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Wallet,
  CreditCard,
  Landmark,
  ReceiptText,
  Calculator,
  PiggyBank,
  Ban,
  CircleDollarSign,
  ArrowLeftRight,
  Home,
  Zap,
  Coffee,
  Car,
  Phone,
  Wifi,
  Droplet,
  HardHat,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

// Modern Card Component
const MetricCard = ({ title, value, change, icon: Icon, color = "blue", trend = null, loading = false, subtitle }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    purple: "from-purple-500 to-purple-600",
    gray: "from-gray-500 to-gray-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  const lightColors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600",
    gray: "bg-gray-50 text-gray-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-linear-to-br ${colors[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl ${lightColors[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend !== null && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </>
        )}
      </div>
    </div>
  );
};

// Modern Data Grid Component
const DataGrid = ({ columns, data, loading, onRowClick, emptyMessage }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
          <Receipt className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">{emptyMessage || "No expense records found for the selected criteria"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((row, idx) => (
        <div
          key={idx}
          onClick={() => onRowClick?.(row)}
          className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">
                  #{idx + 1}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{row.category || row.expenseHead}</h4>
                {row.count > 1 && <p className="text-xs text-gray-500 mt-0.5">{row.count} transactions</p>}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {columns.map((col) => {
              if (col.key === 'category' || col.key === 'expenseHead') return null;
              
              const value = row[col.key];
              const formatted = col.format === 'currency' 
                ? formatCurrency(value)
                : col.format === 'percent'
                ? formatPercent(value)
                : formatNumber(value);

              return (
                <div key={col.key}>
                  <p className="text-xs text-gray-500 mb-1">{col.label}</p>
                  <p className={`text-sm font-semibold ${
                    col.key === 'total' || col.key === 'amount' ? 'text-rose-600' : 'text-gray-900'
                  }`}>
                    {formatted}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Formatting Utilities
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat('en-US').format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Get icon for expense category
const getCategoryIcon = (category) => {
  const categoryLower = category?.toLowerCase() || '';
  if (categoryLower.includes('rent')) return Home;
  if (categoryLower.includes('utility') || categoryLower.includes('electric')) return Zap;
  if (categoryLower.includes('water')) return Droplet;
  if (categoryLower.includes('internet') || categoryLower.includes('wifi')) return Wifi;
  if (categoryLower.includes('phone') || categoryLower.includes('mobile')) return Phone;
  if (categoryLower.includes('travel') || categoryLower.includes('transport')) return Car;
  if (categoryLower.includes('food') || categoryLower.includes('coffee')) return Coffee;
  if (categoryLower.includes('salary') || categoryLower.includes('wage')) return HardHat;
  if (categoryLower.includes('office') || categoryLower.includes('stationery')) return Briefcase;
  return Receipt;
};

export default function ExpenseReportPage() {
  const { axiosSecure } = useAxiosSecure();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const { control, reset } = useForm({
    defaultValues: {
      branch: null,
      from: "2026-02-01",
      to: "2026-03-31",
    },
  });

  const filters = useWatch({ control });

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categorySummary, setCategorySummary] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRow, setSelectedRow] = useState(null);

  // Get user role on mount
  useEffect(() => {
    const role = user?.roleName;
    setUserRole(role);
  }, [user]);
console.log("userRole",userRole)
  /* ================= GENERATE ================= */
  const handleGenerate = async () => {
    if (!filters.from || !filters.to) {
      setError("Date range is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('startDate', filters.from);
      params.append('endDate', filters.to);
      
      // Only Super Admin and Admin can select branch
      if (userRole === 'Super Admin' || userRole === 'Admin') {
        if (filters.branch?._id) {
          params.append('branchId', filters.branch._id);
        }
      } else {
        // For other roles, use their assigned branch
        const userBranch = user?.branchId || localStorage.getItem('userBranch');
        if (userBranch) {
          params.append('branchId', userBranch);
        }
      }

      const res = await axiosSecure.get(`/expenses/report?${params.toString()}`);
      console.log("exreport", res);
      
      // Transform backend response
      transformResponse(res.data);
      
      setGenerated(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // Transform backend response to frontend format
  const transformResponse = (data) => {
    // Set summary from the first item in summary array
    if (data.summary && data.summary.length > 0) {
      setSummary(data.summary[0]);
    }

    // Set category summary
    if (data.categorySummary) {
      setCategorySummary(data.categorySummary);
      
      // Transform category summary to rows format for display
      const categoryRows = data.categorySummary.map(item => ({
        category: item.category,
        total: item.total,
        count: item.count || 1,
        percentage: ((item.total / (data.summary[0]?.totalExpense || 1)) * 100).toFixed(1),
      }));
      setRows(categoryRows);
    }

    // Set payment summary
    if (data.paymentSummary) {
      setPaymentSummary(data.paymentSummary);
    }
  };

  const handleReset = () => {
    reset({
      branch: null,
      from: "2026-02-01",
      to: "2026-03-31",
    });
    setRows([]);
    setSummary(null);
    setCategorySummary([]);
    setPaymentSummary([]);
    setGenerated(false);
    setError(null);
    setSelectedRow(null);
  };

  /* ================= COLUMNS ================= */
  const columns = useMemo(() => {
    return [
      { key: "category", label: "Expense Category", icon: Tags, format: "string" },
      { key: "total", label: "Amount", icon: DollarSign, format: "currency" },
      { key: "count", label: "Transactions", icon: Receipt, format: "number" },
      { key: "percentage", label: "% of Total", icon: Percent, format: "percent" },
    ];
  }, []);

  // Summary cards data
  const summaryCards = useMemo(() => {
    if (!summary) return [];

    const totalExpense = summary.totalExpense || 0;
    const totalTransactions = summary.totalTransactions || 0;
    const avgPerTransaction = totalTransactions > 0 ? totalExpense / totalTransactions : 0;
    
    // Calculate category with highest expense
    const topCategory = categorySummary.length > 0 
      ? categorySummary.reduce((max, item) => item.total > max.total ? item : max, categorySummary[0])
      : null;

    return [
      {
        title: "Total Expenses",
        value: formatCurrency(totalExpense),
        icon: DollarSign,
        color: "rose",
        subtitle: `${formatNumber(totalTransactions)} transactions`,
      },
      {
        title: "Average per Transaction",
        value: formatCurrency(avgPerTransaction),
        icon: Calculator,
        color: "blue",
        subtitle: "Avg expense amount",
      },
      {
        title: "Payment Methods",
        value: formatNumber(paymentSummary.length),
        icon: CreditCard,
        color: "purple",
        subtitle: `${paymentSummary.length} different methods`,
      },
      {
        title: "Expense Categories",
        value: formatNumber(categorySummary.length),
        icon: Layers,
        color: "amber",
        subtitle: "Active categories",
      },
      {
        title: "Top Category",
        value: topCategory?.category || "N/A",
        icon: getCategoryIcon(topCategory?.category),
        color: "indigo",
        subtitle: topCategory ? formatCurrency(topCategory.total) : "No data",
      },
      {
        title: "Largest Expense",
        value: topCategory ? formatCurrency(topCategory.total) : formatCurrency(0),
        icon: TrendingUp,
        color: "emerald",
        subtitle: topCategory?.category || "N/A",
      },
    ];
  }, [summary, categorySummary, paymentSummary]);

  // Check if user can see branch filter
  const canSelectBranch = userRole === 'Super Admin' || userRole === 'Admin';

  return (
    <Page title="Expense Analytics">
      <div className={`transition-all duration-300 ${fullscreen ? 'max-w-full' : 'max-w-7xl mx-auto'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-rose-600 to-orange-600 rounded-2xl blur-xl opacity-20" />
              <div className="relative p-3 bg-linear-to-r from-rose-600 to-orange-600 rounded-2xl shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Expense Analytics
              </h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Track and analyze business expenses
                {generated && summary && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-rose-600 font-medium">
                      {formatCurrency(summary.totalExpense)} total expenses
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className={`mb-8 transition-all duration-300 ${showFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0 overflow-hidden'}`}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-rose-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Expense Report Parameters</h2>
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Filters Grid - Only Branch (for admins) and Date Range */}
              <div className={`grid grid-cols-1 ${canSelectBranch ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5 mb-6`}>
                {/* Branch Filter - Only for Super Admin and Admin */}
                {canSelectBranch && (
                  <div className="relative z-30">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Branch
                    </label>
                    <Controller
                      name="branch"
                      control={control}
                      render={({ field }) => (
                        <ReportSmartSelect
                          route="/branches"
                          displayField={["code", "name"]}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="All Branches"
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                )}

                {/* Date Range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    From Date <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="from"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    To Date <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="to"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Hidden branch field for non-admin users */}
              {!canSelectBranch && (
                <input type="hidden" name="branch" value={user?.branchId || ''} />
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={loading || !filters.from || !filters.to}
                    className="bg-linear-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate Expense Report
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl"
                  >
                    Reset Filters
                  </Button>
                </div>

                {/* {generated && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl"
                    >
                      <DownloadCloud className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {generated && summary && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {summaryCards.map((card, idx) => (
                <MetricCard key={idx} {...card} />
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-100">
              <nav className="flex gap-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'categories', label: 'Category Breakdown', icon: Layers, count: categorySummary.length },
                  { id: 'payment', label: 'Payment Methods', icon: CreditCard, count: paymentSummary.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all relative ${
                      activeTab === tab.id
                        ? 'text-rose-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                        activeTab === tab.id
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-rose-600 to-orange-600" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* View Mode Toggle (for categories tab) */}
            {activeTab === 'categories' && rows.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{rows.length}</span> expense categories
                </p>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white text-rose-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="mt-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-rose-50 rounded-lg">
                          <Layers className="w-4 h-4 text-rose-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Top Category</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {categorySummary[0]?.category || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {categorySummary[0] && formatCurrency(categorySummary[0].total)}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Top Payment Method</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {paymentSummary[0]?.payment || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {paymentSummary[0] && formatCurrency(paymentSummary[0].total)}
                      </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Receipt className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Total Transactions</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalTransactions)}</p>
                      <p className="text-xs text-gray-500 mt-1">Across all categories</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Calculator className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Avg per Transaction</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary.totalExpense / summary.totalTransactions)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Overall average</p>
                    </div>
                  </div>

                  {/* Category Breakdown Preview */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Top Expense Categories</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {categorySummary.slice(0, 5).map((item, idx) => {
                        const Icon = getCategoryIcon(item.category);
                        return (
                          <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-400 w-6">#{idx + 1}</span>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <Icon className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{item.category}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-rose-600">{formatCurrency(item.total)}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {((item.total / summary.totalExpense) * 100).toFixed(1)}% of total
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Methods Preview */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Payment Method Distribution</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {paymentSummary.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-400 w-6">#{idx + 1}</span>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                {item.payment === 'Cash' ? (
                                  <CircleDollarSign className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <Landmark className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.payment}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-600">{formatCurrency(item.total)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {((item.total / summary.totalExpense) * 100).toFixed(1)}% of total
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Categories Tab */}
              {activeTab === 'categories' && (
                viewMode === 'grid' ? (
                  <DataGrid
                    columns={columns}
                    data={rows}
                    loading={loading}
                    onRowClick={setSelectedRow}
                    emptyMessage="No expense categories found for the selected filters"
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            {columns.map((col) => (
                              <th key={col.key} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                  <col.icon className="w-4 h-4" />
                                  {col.label}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {loading ? (
                            <tr>
                              <td colSpan={columns.length} className="px-6 py-12 text-center">
                                <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-3" />
                                <p className="text-gray-500">Loading data...</p>
                              </td>
                            </tr>
                          ) : rows.length === 0 ? (
                            <tr>
                              <td colSpan={columns.length} className="px-6 py-12 text-center">
                                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No data available</p>
                              </td>
                            </tr>
                          ) : (
                            rows.map((row, idx) => {
                              const Icon = getCategoryIcon(row.category);
                              return (
                                <tr 
                                  key={idx} 
                                  className="hover:bg-gray-50 transition-colors cursor-pointer" 
                                  onClick={() => setSelectedRow(row)}
                                >
                                  <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-gray-50 rounded-lg">
                                        <Icon className="w-4 h-4 text-gray-600" />
                                      </div>
                                      <span className="font-medium text-gray-900">{row.category}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    <span className="font-semibold text-rose-600">{formatCurrency(row.total)}</span>
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    <span className="text-gray-700">{formatNumber(row.count)}</span>
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    <span className="text-gray-700">{row.percentage}%</span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payment' && paymentSummary.length > 0 && (
                <div className="space-y-4">
                  {paymentSummary.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                            idx === 0 ? 'bg-linear-to-br from-amber-100 to-amber-50 text-amber-600' :
                            'bg-linear-to-br from-gray-100 to-gray-50 text-gray-600'
                          }`}>
                            {item.payment === 'Cash' ? (
                              <CircleDollarSign className="w-6 h-6" />
                            ) : (
                              <Landmark className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{item.payment}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Payment Method</p>
                          </div>
                        </div>
                        {idx === 0 && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                            Most Used
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                          <p className="text-xl font-bold text-rose-600">{formatCurrency(item.total)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Percentage</p>
                          <p className="text-xl font-bold text-gray-900">
                            {((item.total / summary.totalExpense) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Rank</p>
                          <p className="text-xl font-bold text-gray-900">#{idx + 1}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-rose-500 h-2 rounded-full" 
                            style={{ width: `${(item.total / summary.totalExpense) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}