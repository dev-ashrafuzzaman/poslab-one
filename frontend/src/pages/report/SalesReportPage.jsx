import { useForm, Controller, useWatch } from "react-hook-form";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Page from "../../components/common/Page";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import ReportSmartSelect from "../../components/common/ReportSmartSelect";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useAuth } from "../../context/useAuth";
import {
  BarChart3,
  RefreshCw,
  Filter,
  Calendar,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Users,
  Tags,
  Activity,
  ChevronRight,
  Sparkles,
  Grid3x3,
  Table as TableIcon,
  AlertCircle,
  Award,
  Target,
  CheckCircle2,
  Receipt,
  PieChart,
  Medal,
  Crown,
  Star,
  Trophy,
  TrendingUp as TrendingIcon,
  Wallet,
  LineChart,
  Download,
  Printer,
  Eye,
  EyeOff,
  Settings,
  Zap,
  Gift,
  CreditCard,
  BarChart,
  CircleDollarSign,
  Gem,
  Rocket,
  Flame,
  Heart,
  ThumbsUp,
  UsersRound,
  Store,
  CalendarDays,
  BadgePercent,
  Landmark,
  Scale,
  Coins,
  ArrowLeftRight,
  ReceiptText,
  ShoppingBag,
  Truck,
  PackageCheck,
  PackageOpen,
  BarChartHorizontal,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "lucide-react";

// ==================== UTILITIES ====================
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "৳0";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("en-BD").format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "0%";
  return `${Number(value).toFixed(1)}%`;
};

const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Crown className="w-4 h-4 text-amber-500" />;
    case 2:
      return <Medal className="w-4 h-4 text-gray-400" />;
    case 3:
      return <Medal className="w-4 h-4 text-amber-700" />;
    default:
      return <span className="text-xs text-gray-400">#{rank}</span>;
  }
};

const getRankColor = (rank) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200";
    case 2:
      return "bg-gradient-to-r from-gray-50 to-gray-100/50 border-gray-200";
    case 3:
      return "bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-200";
    default:
      return "bg-white border-gray-100";
  }
};

// ==================== COMPONENTS ====================
const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend = null,
  subValue,
}) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
    rose: "from-rose-500 to-rose-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  const lightColors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg border ${lightColors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
              trend >= 0
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-rose-50 text-rose-600 border border-rose-200"
            }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </motion.div>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {subValue && (
        <p className="text-xs font-medium text-indigo-600 mt-1">{subValue}</p>
      )}
    </motion.div>
  );
};

const RankCard = ({ rank, item, type = "product" }) => {
  const rankColors = {
    1: {
      bg: "from-amber-50 to-amber-100/30",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "text-amber-500",
    },
    2: {
      bg: "from-gray-50 to-gray-100/30",
      border: "border-gray-200",
      text: "text-gray-700",
      icon: "text-gray-500",
    },
    3: {
      bg: "from-orange-50 to-orange-100/30",
      border: "border-orange-200",
      text: "text-orange-700",
      icon: "text-orange-500",
    },
  };

  const colors = rankColors[rank] || {
    bg: "from-gray-50 to-white",
    border: "border-gray-100",
    text: "text-gray-600",
    icon: "text-gray-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`bg-linear-to-r ${colors.bg} border ${colors.border} rounded-xl p-4 hover:shadow-md transition-all`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {rank === 1 && <Crown className={`w-8 h-8 ${colors.icon}`} />}
          {rank === 2 && <Medal className={`w-8 h-8 ${colors.icon}`} />}
          {rank === 3 && <Award className={`w-8 h-8 ${colors.icon}`} />}
          {rank > 3 && (
            <div
              className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold ${colors.text}`}
            >
              #{rank}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-semibold ${colors.text}`}>{item.name}</h4>
            <span className="text-xs bg-white px-2 py-1 rounded-full border">
              {type === "product" ? item.category : item.code}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="font-bold text-gray-900">
                {formatCurrency(item.revenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {type === "product" ? "Quantity" : "Orders"}
              </p>
              <p className="font-medium text-gray-700">
                {formatNumber(type === "product" ? item.qty : item.orders)}
              </p>
            </div>
          </div>
          {type === "product" && (
            <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Profit</span>
                <span
                  className={`font-medium ${item.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {formatCurrency(item.profit)}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Margin</span>
                <span
                  className={`font-medium ${item.margin >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {formatPercent(item.margin)}
                </span>
              </div>
            </div>
          )}
          {type === "salesperson" && (
            <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Avg Order</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(item.avgOrderValue)}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Efficiency</span>
                <span className="font-medium text-indigo-600">
                  {item.efficiency?.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DataTable = ({ columns, data, onRowClick }) => {
  if (!data?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-gray-100 p-12 text-center"
      >
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1">
                    {col.icon && <col.icon className="w-3.5 h-3.5" />}
                    {col.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onRowClick?.(row)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render ? col.render(row, idx) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const RankingSection = ({
  title,
  items,
  type,
  icon: Icon,
  color = "indigo",
}) => {
  const colors = {
    indigo: "from-indigo-50 to-indigo-100/30 border-indigo-200",
    amber: "from-amber-50 to-amber-100/30 border-amber-200",
    emerald: "from-emerald-50 to-emerald-100/30 border-emerald-200",
    purple: "from-purple-50 to-purple-100/30 border-purple-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-linear-to-br ${colors[color]} rounded-xl border p-5`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 bg-white rounded-lg border border-${color}-200`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <div className="flex-1" />
        <Badge variant="outline" className="bg-white">
          {items.length} items
        </Badge>
      </div>

      <div className="space-y-3">
        {items.slice(0, 5).map((item, idx) => (
          <RankCard key={idx} rank={idx + 1} item={item} type={type} />
        ))}
      </div>
    </motion.div>
  );
};

const Badge = ({ variant = "default", className = "", children }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    outline: "border border-gray-200 bg-white",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// ==================== MAIN COMPONENT ====================
export default function SalesReportPage() {
  const { axiosSecure } = useAxiosSecure();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [activeTab, setActiveTab] = useState("overview");
  const [showRankings, setShowRankings] = useState(true);

  // Data states
  const [reportData, setReportData] = useState({
    financialSummary: null,
    operationalSummary: null,
    groupedResult: [],
    salespersonAnalytics: [],
    dailySalesTrend: [],
    categoryProfit: [],
    topProducts: [],
  });

  const { control, reset, setValue, getValues } = useForm({
    defaultValues: {
      groupBy: "product",
      branch: null,
      category: null,
      salesperson: null,
      from: "",
      to: "",
    },
  });

  const filters = useWatch({ control });
  const userRole = user?.roleName || user?.role;
  const canSelectBranch = ["Super Admin", "Admin"].includes(userRole);

  // Set default branch for non-admin users
  useEffect(() => {
    if (!canSelectBranch && user?.branchId && !filters.branch) {
      setValue("branch", { _id: user.branchId, name: user.branchName });
    }
  }, [canSelectBranch, user, filters.branch, setValue]);

  // ==================== DATA TRANSFORMATION ====================
  const transformedData = useMemo(() => {
    const {
      financialSummary,
      groupedResult,
      salespersonAnalytics,
      dailySalesTrend,
    } = reportData;

    // Calculate net sales (after discount)
    const netSales = financialSummary?.netSalesFinancial || 0;
    const grossSales = financialSummary?.grossSales || 0;
    const totalDiscount = financialSummary?.totalDiscount || 0;
    const salesReturn = financialSummary?.salesReturn || 0;
    const grossProfit = financialSummary?.grossProfitFinancial || 0;
    const grossMargin = financialSummary?.grossMarginFinancial || 0;

    // Summary metrics
    const summary = {
      // Revenue metrics
      grossSales,
      netSales,
      totalDiscount,
      salesReturn,

      // Profit metrics
      grossProfit,
      grossMargin,
      cogs: financialSummary?.netCOGS || 0,

      // Operational metrics
      totalOrders:
        salespersonAnalytics?.reduce((sum, sp) => sum + (sp.orders || 0), 0) ||
        0,
      totalProductsSold:
        groupedResult?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0,
      uniqueProducts: groupedResult?.length || 0,
      avgOrderValue:
        netSales /
        (salespersonAnalytics?.reduce((sum, sp) => sum + (sp.orders || 0), 0) ||
          1),

      // Return rate
      returnRate: grossSales ? (salesReturn / grossSales) * 100 : 0,
      discountRate: grossSales ? (totalDiscount / grossSales) * 100 : 0,
    };

    // Transform grouped results for display with ranking
    const products =
      groupedResult?.map((item) => ({
        id: item.sku,
        name: item.productName,
        sku: item.sku,
        category: item.categoryName,
        qty: item.qty,
        revenue: item.revenue,
        gross: item.gross,
        discount: item.discount,
        cogs: item.cogs,
        profit: item.profit,
        margin: item.margin,
        rank: 0,
        contribution: (item.revenue / netSales) * 100,
      })) || [];

    // Sort by revenue for rankings
    const productsByRevenue = [...products].sort(
      (a, b) => b.revenue - a.revenue,
    );
    const productsByProfit = [...products].sort((a, b) => b.profit - a.profit);
    const productsByQuantity = [...products].sort((a, b) => b.qty - a.qty);

    // Add rankings
    productsByRevenue.forEach((p, idx) => (p.rankRevenue = idx + 1));
    productsByProfit.forEach((p, idx) => (p.rankProfit = idx + 1));
    productsByQuantity.forEach((p, idx) => (p.rankQuantity = idx + 1));

    // Transform salesperson data with ranking
    const salespeople =
      salespersonAnalytics?.map((sp) => ({
        id: sp.employeeId,
        name: sp.name,
        code: sp.code,
        orders: sp.orders,
        revenue: sp.revenue,
        commission: sp.commission,
        efficiency: sp.commissionEfficiency,
        avgOrderValue: sp.revenue / (sp.orders || 1),
        contribution: (sp.revenue / netSales) * 100,
      })) || [];

    // Sort salespeople
    const salespeopleByRevenue = [...salespeople].sort(
      (a, b) => b.revenue - a.revenue,
    );
    const salespeopleByOrders = [...salespeople].sort(
      (a, b) => b.orders - a.orders,
    );
    const salespeopleByEfficiency = [...salespeople].sort(
      (a, b) => b.efficiency - a.efficiency,
    );

    // Add rankings
    salespeopleByRevenue.forEach((p, idx) => (p.rankRevenue = idx + 1));
    salespeopleByOrders.forEach((p, idx) => (p.rankOrders = idx + 1));
    salespeopleByEfficiency.forEach((p, idx) => (p.rankEfficiency = idx + 1));

    // Daily trend
    const dailyTrend =
      dailySalesTrend?.map((day) => ({
        date: new Date(day.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: day.revenue,
        qty: day.qty,
      })) || [];

    return {
      summary,
      products: productsByRevenue,
      topProducts: productsByRevenue,
      topProductsByProfit: productsByProfit,
      topProductsByQuantity: productsByQuantity,
      salespeople: salespeopleByRevenue,
      topSalespeople: salespeopleByRevenue,
      topSalespeopleByOrders: salespeopleByOrders,
      topSalespeopleByEfficiency: salespeopleByEfficiency,
      dailyTrend,
      financialSummary,
    };
  }, [reportData]);

  // ==================== API CALL ====================
  const handleGenerate = async () => {
    if (canSelectBranch && !filters.branch?._id) {
      setError("Please select a branch");
      return;
    }
    if (!filters.from || !filters.to) {
      setError("Date range is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        branchId: canSelectBranch ? filters.branch?._id : user?.branchId,
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy,
        categoryId: filters.category?._id,
        salespersonId: filters.salesperson?._id,
      };

      const { data } = await axiosSecure.post("sales/reports", payload);
      setReportData(data);
      setGenerated(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setReportData({
      financialSummary: null,
      operationalSummary: null,
      groupedResult: [],
      salespersonAnalytics: [],
      dailySalesTrend: [],
      categoryProfit: [],
      topProducts: [],
    });
    setGenerated(false);
    setError(null);
  };

  // ==================== TABLE COLUMNS ====================
  const productColumns = [
    {
      key: "rank",
      label: "Rank",
      icon: Trophy,
      render: (row, idx) => (
        <div className="flex items-center gap-1">{getRankIcon(idx + 1)}</div>
      ),
    },
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Package className="w-3 h-3" />
            {row.sku}
          </div>
        </div>
      ),
    },
    { key: "category", label: "Category", icon: Tags },
    {
      key: "qty",
      label: "Qty",
      icon: ShoppingCart,
      render: (row) => formatNumber(row.qty),
    },
    {
      key: "revenue",
      label: "Net Sales",
      icon: DollarSign,
      render: (row) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(row.revenue)}
        </span>
      ),
    },
    {
      key: "profit",
      label: "Profit",
      icon: TrendingUp,
      render: (row) => (
        <span
          className={
            row.profit >= 0
              ? "text-emerald-600 font-medium"
              : "text-rose-600 font-medium"
          }
        >
          {formatCurrency(row.profit)}
        </span>
      ),
    },
    {
      key: "margin",
      label: "Margin",
      icon: Percent,
      render: (row) => (
        <Badge variant={row.margin >= 0 ? "success" : "danger"}>
          {formatPercent(row.margin)}
        </Badge>
      ),
    },
    {
      key: "contribution",
      label: "Contribution",
      icon: PieChart,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{formatPercent(row.contribution)}</span>
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${row.contribution}%` }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
        </div>
      ),
    },
  ];

  const salespersonColumns = [
    {
      key: "rank",
      label: "Rank",
      icon: Trophy,
      render: (row, idx) => (
        <div className="flex items-center gap-1">{getRankIcon(idx + 1)}</div>
      ),
    },
    {
      key: "name",
      label: "Sales Person",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {row.code}
          </div>
        </div>
      ),
    },
    {
      key: "orders",
      label: "Orders",
      icon: ShoppingCart,
      render: (row) => formatNumber(row.orders),
    },
    {
      key: "revenue",
      label: "Sales",
      icon: DollarSign,
      render: (row) => formatCurrency(row.revenue),
    },
    {
      key: "avgOrderValue",
      label: "Avg Order",
      icon: BarChart,
      render: (row) => formatCurrency(row.avgOrderValue),
    },
    {
      key: "commission",
      label: "Commission",
      icon: Gift,
      render: (row) => formatCurrency(row.commission),
    },
    {
      key: "efficiency",
      label: "Efficiency",
      icon: Zap,
      render: (row) => (
        <Badge
          variant={
            row.efficiency > 70
              ? "success"
              : row.efficiency > 40
                ? "warning"
                : "danger"
          }
        >
          {row.efficiency?.toFixed(1)}%
        </Badge>
      ),
    },
    {
      key: "contribution",
      label: "Contribution",
      icon: PieChart,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{formatPercent(row.contribution)}</span>
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${row.contribution}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>
      ),
    },
  ];

  const dailyColumns = [
    {
      key: "date",
      label: "Date",
      icon: Calendar,
      render: (row) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {row.date}
        </div>
      ),
    },
    {
      key: "qty",
      label: "Quantity",
      icon: ShoppingCart,
      render: (row) => formatNumber(row.qty),
    },
    {
      key: "revenue",
      label: "Revenue",
      icon: DollarSign,
      render: (row) => formatCurrency(row.revenue),
    },
  ];

  return (
    <Page title="Sales Report">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Sales Report
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <Activity className="w-4 h-4" />
                Track, analyze, and optimize sales performance
              </p>
            </div>
          </div>

          {generated && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowRankings(!showRankings)}
                className="border-gray-200"
              >
                {showRankings ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {showRankings ? "Hide" : "Show"} Rankings
              </Button>
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <h2 className="font-medium text-gray-700">Report Filters</h2>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Branch */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" />
                    Branch{" "}
                    {canSelectBranch && (
                      <span className="text-rose-500">*</span>
                    )}
                  </label>
                  {canSelectBranch ? (
                    <Controller
                      name="branch"
                      control={control}
                      render={({ field }) => (
                        <ReportSmartSelect
                          route="/branches"
                          displayField={["name"]}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select branch"
                          className="w-full"
                        />
                      )}
                    />
                  ) : (
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center gap-2">
                      <Store className="w-4 h-4 text-gray-400" />
                      {user?.branchName || "Your Branch"}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <Tags className="w-3.5 h-3.5" />
                    Category
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <ReportSmartSelect
                        route="/categories"
                        displayField={["name"]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="All categories"
                        className="w-full"
                      />
                    )}
                  />
                </div>

                {/* Sales Person */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Sales Person
                  </label>
                  <Controller
                    name="salesperson"
                    control={control}
                    render={({ field }) => (
                      <ReportSmartSelect
                        route="/employees"
                        extraParams={{ role: "Salesman" }}
                        displayField={["name"]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="All sales people"
                        className="w-full"
                      />
                    )}
                  />
                </div>

                {/* Group By */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <Grid3x3 className="w-3.5 h-3.5" />
                    Group By
                  </label>
                  <Controller
                    name="groupBy"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { label: "Product", value: "product" },
                          { label: "Variant", value: "variant" },
                          { label: "Day", value: "day" },
                        ]}
                        className="w-full"
                      />
                    )}
                  />
                </div>

                {/* Date Range */}
                <div className="lg:col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Controller
                        name="from"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="date"
                            {...field}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                          />
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <Controller
                        name="to"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="date"
                            {...field}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-rose-50 rounded-lg flex items-center gap-2 text-rose-600 text-sm border border-rose-200"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                <Button
                  onClick={handleGenerate}
                  disabled={
                    loading ||
                    !filters.from ||
                    !filters.to ||
                    (canSelectBranch && !filters.branch?._id)
                  }
                  className="bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/25"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg text-sm"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {generated && transformedData.summary && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Gross Sales"
                  value={formatCurrency(transformedData.summary.grossSales)}
                  subtitle="Before discounts & returns"
                  icon={TrendingUp}
                  color="blue"
                  trend={5.2}
                />
                <MetricCard
                  title="Net Sales"
                  value={formatCurrency(transformedData.summary.netSales)}
                  subtitle="After discounts & returns"
                  icon={DollarSign}
                  color="emerald"
                  trend={3.8}
                />
                <MetricCard
                  title="Gross Profit"
                  value={formatCurrency(transformedData.summary.grossProfit)}
                  subtitle={`Margin: ${formatPercent(transformedData.summary.grossMargin)}`}
                  icon={PieChart}
                  color="purple"
                  subValue={`COGS: ${formatCurrency(transformedData.summary.cogs)}`}
                />
                <MetricCard
                  title="Total Orders"
                  value={formatNumber(transformedData.summary.totalOrders)}
                  subtitle={`Avg: ${formatCurrency(transformedData.summary.avgOrderValue)}`}
                  icon={ShoppingCart}
                  color="amber"
                  subValue={`${formatNumber(transformedData.summary.uniqueProducts)} unique products`}
                />
              </div>

              {/* Second Row Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <BadgePercent className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-medium text-gray-700">
                      Discount Analysis
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Discount</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(transformedData.summary.totalDiscount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount Rate</span>
                      <Badge variant="warning">
                        {formatPercent(transformedData.summary.discountRate)}
                      </Badge>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(transformedData.summary.discountRate, 100)}%`,
                        }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-rose-50 to-white p-5 rounded-xl border border-rose-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <ArrowLeftRight className="w-4 h-4 text-rose-600" />
                    </div>
                    <h3 className="font-medium text-gray-700">
                      Return Analysis
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sales Return</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(transformedData.summary.salesReturn)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Return Rate</span>
                      <Badge variant="danger">
                        {formatPercent(transformedData.summary.returnRate)}
                      </Badge>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(transformedData.summary.returnRate, 100)}%`,
                        }}
                        className="h-full bg-rose-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <PackageCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-medium text-gray-700">
                      Inventory Impact
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Products Sold</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(
                          transformedData.summary.totalProductsSold,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unique Items</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(transformedData.summary.uniqueProducts)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">COGS</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(transformedData.summary.cogs)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rankings Section */}
              {showRankings && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <RankingSection
                    title="Top Products by Revenue"
                    items={transformedData.topProducts}
                    type="product"
                    icon={Trophy}
                    color="amber"
                  />
                  <RankingSection
                    title="Top Sales Performers"
                    items={transformedData.topSalespeople}
                    type="salesperson"
                    icon={Crown}
                    color="emerald"
                  />
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-100">
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {[
                    {
                      id: "overview",
                      label: "Overview",
                      icon: Activity,
                      color: "indigo",
                    },
                    {
                      id: "products",
                      label: "Products",
                      icon: Tags,
                      color: "blue",
                    },
                    {
                      id: "salespeople",
                      label: "Sales Team",
                      icon: Users,
                      color: "emerald",
                    },
                    {
                      id: "daily",
                      label: "Daily Trend",
                      icon: Calendar,
                      color: "amber",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium flex items-center gap-2 relative transition-colors ${
                        activeTab === tab.id
                          ? `text-${tab.color}-600`
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-600`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Top Products by Different Metrics */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-r from-blue-50 to-white">
                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          Top Products by Revenue
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {transformedData.topProducts
                          .slice(0, 5)
                          .map((product, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    idx === 0
                                      ? "bg-amber-100 text-amber-700"
                                      : idx === 1
                                        ? "bg-gray-100 text-gray-600"
                                        : idx === 2
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-gray-50 text-gray-500"
                                  }`}
                                >
                                  {idx === 0
                                    ? "🥇"
                                    : idx === 1
                                      ? "🥈"
                                      : idx === 2
                                        ? "🥉"
                                        : `#${idx + 1}`}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {product.sku}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {formatCurrency(product.revenue)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatNumber(product.qty)} units
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>

                    {/* Top Products by Profit */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-linear-to-r from-emerald-50 to-white">
                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          Top Products by Profit
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {transformedData.topProductsByProfit
                          ?.slice(0, 5)
                          .map((product, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    idx === 0
                                      ? "bg-emerald-100 text-emerald-700"
                                      : idx === 1
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-gray-50 text-gray-500"
                                  }`}
                                >
                                  {idx === 0
                                    ? "💰"
                                    : idx === 1
                                      ? "💎"
                                      : idx === 2
                                        ? "⭐"
                                        : `#${idx + 1}`}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {product.category}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-medium ${product.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {formatCurrency(product.profit)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatPercent(product.margin)} margin
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-indigo-50 text-indigo-700 border-indigo-200"
                        >
                          <Package className="w-3.5 h-3.5 mr-1" />
                          {transformedData.products.length} Products
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          <DollarSign className="w-3.5 h-3.5 mr-1" />
                          Total:{" "}
                          {formatCurrency(transformedData.summary.netSales)}
                        </Badge>
                      </div>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode("table")}
                          className={`p-1.5 rounded transition-all ${
                            viewMode === "table"
                              ? "bg-white shadow-sm text-indigo-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <TableIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-1.5 rounded transition-all ${
                            viewMode === "grid"
                              ? "bg-white shadow-sm text-indigo-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Grid3x3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {viewMode === "table" ? (
                      <DataTable
                        columns={productColumns}
                        data={transformedData.products}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {transformedData.products.map((product, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`bg-white rounded-xl border ${getRankColor(idx + 1)} p-4 hover:shadow-lg transition-all`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                                    idx === 0
                                      ? "bg-amber-100 text-amber-700"
                                      : idx === 1
                                        ? "bg-gray-100 text-gray-700"
                                        : idx === 2
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-indigo-50 text-indigo-600"
                                  }`}
                                >
                                  {idx === 0
                                    ? "🥇"
                                    : idx === 1
                                      ? "🥈"
                                      : idx === 2
                                        ? "🥉"
                                        : `#${idx + 1}`}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {product.sku}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white">
                                {product.category}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">Revenue</p>
                                <p className="font-bold text-gray-900">
                                  {formatCurrency(product.revenue)}
                                </p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500">
                                  Quantity
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatNumber(product.qty)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-500">Profit</p>
                                <p
                                  className={`font-medium ${product.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {formatCurrency(product.profit)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Margin</p>
                                <Badge
                                  variant={
                                    product.margin >= 0 ? "success" : "danger"
                                  }
                                >
                                  {formatPercent(product.margin)}
                                </Badge>
                              </div>
                              <div className="col-span-2 mt-2 pt-2 border-t border-dashed border-gray-200">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">
                                    Contribution
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {formatPercent(product.contribution)}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${product.contribution}%`,
                                    }}
                                    className="h-full bg-indigo-500 rounded-full"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Sales People Tab */}
                {activeTab === "salespeople" && (
                  <DataTable
                    columns={salespersonColumns}
                    data={transformedData.salespeople}
                  />
                )}

                {/* Daily Trend Tab */}
                {activeTab === "daily" && (
                  <DataTable
                    columns={dailyColumns}
                    data={transformedData.dailyTrend}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!generated && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
              <div className="p-4 bg-linear-to-br from-indigo-50 to-indigo-100/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Report Generated
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                Select filters and generate a report to see detailed sales
                analytics, rankings, and performance metrics
              </p>
              <Button
                onClick={handleGenerate}
                disabled={!filters.from || !filters.to}
                className="bg-linear-to-r from-indigo-600 to-indigo-700 mx-auto"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Your First Report
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Page>
  );
}
