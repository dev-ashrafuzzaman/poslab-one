import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ComposedChart,
  Bar,
  Line,
} from "recharts";
import { useMemo, useState } from "react";
import { formatShortDate } from "../../utils/formatDate";
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

// Metric Card Component
const MetricCard = ({ title, value, change, prefix = "", suffix = "", trend = "up" }) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-emerald-600 dark:text-emerald-400";
    if (trend === "down") return "text-rose-600 dark:text-rose-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <ArrowUpRight className="w-4 h-4" />;
    if (trend === "down") return <ArrowDownRight className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="bg-linear-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {title}
      </p>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ icon: Icon, label, value, subValue, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    emerald: "from-emerald-500 to-green-500",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-violet-500",
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-linear-to-br ${colors[color]} shadow-lg shadow-${color}-500/20`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </span>
            {subValue && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {subValue}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chart Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl p-4 min-w-[200px]">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-6 py-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.name}:
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {entry.name === "Revenue" 
              ? `${entry.value.toLocaleString()}`
              : entry.name === "Orders"
              ? entry.value.toLocaleString()
              : entry.name === "Avg Order Value"
              ? `${entry.value.toLocaleString()}`
              : entry.value}
          </span>
        </div>
      ))}
      
      {/* Quick Insights */}
      {payload.length >= 2 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {payload[1]?.value > 0 
              ? `✨ ${Math.round((payload[0]?.value / payload[1]?.value) * 100) / 100} orders per 1K revenue`
              : "No orders recorded"}
          </p>
        </div>
      )}
    </div>
  );
};

// Main Sales Chart Component
export const SalesChart = ({ data }) => {
  const [metricType, setMetricType] = useState("revenue"); // revenue, orders, conversion


  // Calculate metrics
  const metrics = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        aovGrowth: 0,
        peakDay: null,
      };
    }

    const totalRevenue = data.reduce((sum, item) => sum + (Number(item.sales) || 0), 0);
    const totalOrders = data.reduce((sum, item) => sum + (Number(item.orders) || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Calculate growth (compare last 7 days vs previous 7 days)
    const midPoint = Math.floor(data.length / 2);
    const recentPeriod = data.slice(-midPoint);
    const previousPeriod = data.slice(0, midPoint);

    const recentRevenue = recentPeriod.reduce((sum, item) => sum + (Number(item.sales) || 0), 0);
    const previousRevenue = previousPeriod.reduce((sum, item) => sum + (Number(item.sales) || 0), 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const recentOrders = recentPeriod.reduce((sum, item) => sum + (Number(item.orders) || 0), 0);
    const previousOrders = previousPeriod.reduce((sum, item) => sum + (Number(item.orders) || 0), 0);
    const ordersGrowth = previousOrders > 0 
      ? ((recentOrders - previousOrders) / previousOrders) * 100 
      : 0;

    // Find peak day
    const peakDay = data.reduce((max, item) => 
      (Number(item.sales) || 0) > (Number(max?.sales) || 0) ? item : max, data[0]);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueGrowth,
      ordersGrowth,
      aovGrowth: avgOrderValue,
      peakDay,
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      date: formatShortDate(item.date),
      revenue: Number(item.sales) || 0,
      orders: Number(item.orders) || 0,
      avgOrderValue: item.orders > 0 ? Math.round(item.sales / item.orders) : 0,
      conversionRate: item.visitors ? ((item.orders / item.visitors) * 100).toFixed(1) : null,
    }));
  }, [data]);

  const handleMetricChange = (type) => {
    setMetricType(type);
  };

  // Get chart configuration based on selected metric
  const getChartConfig = () => {
    switch(metricType) {
      case "revenue":
        return {
          mainKey: "revenue",
          mainColor: "#2563EB",
          mainName: "Revenue",
          secondaryKey: "orders",
          secondaryColor: "#10B981",
          secondaryName: "Orders",
          formatter: (value) => `${value.toLocaleString()}`,
        };
      case "orders":
        return {
          mainKey: "orders",
          mainColor: "#10B981",
          mainName: "Orders",
          secondaryKey: "avgOrderValue",
          secondaryColor: "#F59E0B",
          secondaryName: "Avg Order Value",
          formatter: (value) => value.toLocaleString(),
        };
      case "conversion":
        return {
          mainKey: "conversionRate",
          mainColor: "#8B5CF6",
          mainName: "Conversion Rate",
          secondaryKey: "revenue",
          secondaryColor: "#2563EB",
          secondaryName: "Revenue",
          formatter: (value) => `${value}%`,
        };
      default:
        return {
          mainKey: "revenue",
          mainColor: "#2563EB",
          mainName: "Revenue",
          secondaryKey: "orders",
          secondaryColor: "#10B981",
          secondaryName: "Orders",
          formatter: (value) => `${value.toLocaleString()}`,
        };
    }
  };

  const config = getChartConfig();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      {/* Header with Executive Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sales Performance Dashboard
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              Real-time
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comprehensive revenue analysis and performance metrics
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => handleMetricChange("revenue")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              metricType === "revenue"
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => handleMetricChange("orders")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              metricType === "orders"
                ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => handleMetricChange("conversion")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              metricType === "conversion"
                ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Conversion
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard
          icon={DollarSign}
          label="Total Revenue"
          value={`${metrics.totalRevenue.toLocaleString()}`}
          subValue={`${metrics.revenueGrowth > 0 ? '+' : ''}${metrics.revenueGrowth.toFixed(1)}%`}
          color="blue"
        />
        <KPICard
          icon={TrendingUp}
          label="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          subValue={`${metrics.ordersGrowth > 0 ? '+' : ''}${metrics.ordersGrowth.toFixed(1)}%`}
          color="emerald"
        />
        <KPICard
          icon={TrendingDown}
          label="Avg Order Value"
          value={`${metrics.avgOrderValue.toLocaleString()}`}
          subValue="per trxn"
          color="amber"
        />
        {/* <KPICard
          icon={Calendar}
          label="Peak Day"
          value={metrics.peakDay ? formatShortDate(metrics.peakDay.date) : "N/A"}
          subValue={metrics.peakDay ? `$${metrics.peakDay.sales?.toLocaleString()}` : ""}
          color="purple"
        /> */}
      </div>

      {/* Main Chart */}
      <div className="w-full h-96 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            {/* Gradients */}
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
              opacity={0.5}
            />

            {/* Axis */}
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              interval="preserveStartEnd"
              minTickGap={30}
            />

            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={(value) => {
                if (metricType === "conversion") return `${value}%`;
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value;
              }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={(value) => {
                if (metricType === "orders") return value;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value;
              }}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {value}
                </span>
              )}
            />

            {/* Main Metric Area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey={config.mainKey}
              stroke={config.mainColor}
              fill={`url(#${config.mainKey}Gradient)`}
              strokeWidth={3}
              name={config.mainName}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {/* Secondary Metric Bar/Line */}
            {config.secondaryKey === "orders" ? (
              <Bar
                yAxisId="right"
                dataKey={config.secondaryKey}
                fill={config.secondaryColor}
                name={config.secondaryName}
                radius={[4, 4, 0, 0]}
                barSize={20}
                opacity={0.8}
              />
            ) : (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={config.secondaryKey}
                stroke={config.secondaryColor}
                strokeWidth={2}
                name={config.secondaryName}
                dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 6 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer with Quick Insights */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Revenue Trend</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}% vs previous period
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Efficiency</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {metrics.avgOrderValue.toLocaleString()} avg per order
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Peak Performance</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {metrics.peakDay ? formatShortDate(metrics.peakDay.date) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};