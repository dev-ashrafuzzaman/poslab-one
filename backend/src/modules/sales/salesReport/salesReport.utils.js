export function calculateMargin(netSales, cogs) {
  const profit = netSales - cogs;
  const margin = netSales > 0 ? (profit / netSales) * 100 : 0;

  return {
    grossProfit: profit,
    marginPercent: Number(margin.toFixed(2)),
  };
}