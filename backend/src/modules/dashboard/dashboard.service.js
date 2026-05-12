import {
  getSummary,
  getSalesChart,
  getLowStock,
  getRecentTransactions,
  getPerformanceMetrics,
} from "./dashboard.aggregations.js";

export const getDashboardService = async ({ db, branchId, from, to }) => {
  const [
    summary,
    salesData,
    lowStockProducts,
    recentTransactions,
    performance,
  ] = await Promise.all([
    getSummary(db, branchId, from, to),
    getSalesChart(db, branchId, from, to),
    getLowStock(db, branchId),
    getRecentTransactions(db, branchId, from, to),
    getPerformanceMetrics(db, branchId, from, to),
  ]);

  return {
    summary,
    salesData,
    lowStockProducts,
    recentTransactions,
    performance,
  };
};
