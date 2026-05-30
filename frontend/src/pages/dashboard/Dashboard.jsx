import React, { useState, useCallback, useEffect } from "react";

import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  RefreshCw,
  AlertCircle,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/useAuth";
import useApi from "../../hooks/useApi";
import { useSearchParams } from "react-router-dom";
import { SalesChart } from "./SalesChart";
import { RecentTransactions } from "./RecentTransactions";
import { LowStockAlert } from "./LowStockAlert";

/* ---------- Date Range Options ---------- */
const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
];

/* ---------- StatCard Component ---------- */
const StatCard = React.memo(({ title, value, icon, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-green-500",
    purple: "from-purple-500 to-violet-500",
    orange: "from-orange-500 to-amber-500",
  };

  const bgColors = {
    blue: "bg-blue-50",
    green: "bg-emerald-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
  };

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <div className={`inline-flex p-3 rounded-xl ${bgColors[color]} mb-4`}>
            <div className={`p-2 rounded-lg bg-linear-to-br ${colors[color]}`}>
              {icon}
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === "number"
              ? title.includes("Revenue")
                ? `${value.toLocaleString()}`
                : value.toLocaleString()
              : value}
          </h3>
        </div>
      </div>
    </div>
  );
});

/* ---------- PerformanceMetrics Component ---------- */
const PerformanceMetrics = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-50 rounded-2xl p-6"
          >
            <p className="text-gray-400">
              No data available
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-100">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Avg. Order Value
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {metrics?.avgOrder?.toLocaleString() || 0}
        </div>
      </div>

      <div className="bg-linear-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-100">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Items per Order
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {metrics?.itemsPerOrder || 0}
        </div>
      </div>

      <div className="bg-linear-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-100">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Total Orders
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {metrics?.orders || 0}
        </div>
      </div>
    </div>
  );
};

/* ---------- API Integration Helper ---------- */
const useDashboardData = () => {
  const { request, loading } = useApi();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const range = searchParams.get("range") || "today";

      const res = await request(
        `/dashboard?range=${range}`,
        "GET",
        {},
        {
          retries: 2,
          useToast: false,
        },
      );

      setData(res?.data || res || null);
      setError(null);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Failed to fetch dashboard data");
    }
  }, [request, searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

/* ---------- Main Dashboard Component ---------- */
export default function Dashboard() {
  const { user } = useAuth?.() ?? {};
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, error, refetch } = useDashboardData();
  const currentrange = searchParams.get("range") || "today";
  const role = user?.roleName;
  const handlerangeChange = (value) => {
    setSearchParams({ range: value });
  };

  const quickActions = [
    {
      label: "New Sale",
      icon: ShoppingBag,
      color: "bg-emerald-500",
      path: "/pos",
    },
    {
      label: "Add Product",
      icon: Package,
      color: "bg-blue-500",
      path: "/products",
    },
    {
      label: "View Reports",
      icon: BarChart3,
      color: "bg-purple-500",
      path: "/reports/sales",
    },
    {
      label: "Stock Reports",
      icon: Package,
      color: "bg-amber-500",
      path: "/reports/stocks",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">
            Failed to load data
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex bg-white rounded-xl p-4 flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || "Admin"}!
            </h1>
          </div>
          <p className="text-gray-600">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={currentrange}
            onChange={(e) => handlerangeChange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button variant="primary" onClick={refetch} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      {role === "Admin" || role === "Manager" || role === "Super Admin" ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions?.map((action, index) => (
            <button
              key={index}
              onClick={() => (window.location.href = action.path)}
              className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`p-3 rounded-lg ${action.color} mb-3 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-gray-900">
                  {action.label}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={data?.summary?.revenue?.value}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={data?.summary?.orders?.value}
          icon={<ShoppingBag className="w-5 h-5 text-white" />}
          color="blue"
        />
        <StatCard
          title="Products"
          value={data?.summary?.products?.value}
          icon={<Package className="w-5 h-5 text-white" />}
          color="purple"
        />
        <StatCard
          title="Customers"
          value={data?.summary?.customers?.value}
          icon={<Users className="w-5 h-5 text-white" />}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <SalesChart data={data?.salesData} />
          <RecentTransactions transactions={data?.recentTransactions} />
        </div>

        {/* Right Column - Alerts & Transactions (1/3 width) */}
        <div className="space-y-6">
          <LowStockAlert products={data?.lowStockProducts} />
        </div>
      </div>

      {/* Performance Metrics - Full Width */}
      <div className="mt-6">
        <PerformanceMetrics metrics={data?.performance} />
      </div>
    </div>
  );
}