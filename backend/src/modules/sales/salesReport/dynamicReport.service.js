export function getTopProductsReport(groupedResult) {

  const topProducts = [...groupedResult]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return topProducts.map(p => ({
    product: p.productName,
    revenue: p.revenue,
    qty: p.qty,
    profit: p.profit,
    margin: p.margin
  }));

}

export function getCategoryProfitReport(enrichedItems) {

  const categoryMap = {};

  enrichedItems.forEach(i => {

    const key = i.category._id.toString();

    if (!categoryMap[key]) {
      categoryMap[key] = {
        categoryName: i.category.name,
        revenue: 0,
        profit: 0,
        qty: 0
      };
    }

    categoryMap[key].revenue += i.net;
    categoryMap[key].profit += i.profit;
    categoryMap[key].qty += i.items.qty;

  });

  return Object.values(categoryMap)
    .map(c => ({
      ...c,
      margin: c.revenue > 0 ? (c.profit / c.revenue) * 100 : 0
    }))
    .sort((a, b) => b.profit - a.profit);

}

export function getDailySalesTrend(enrichedItems) {

  const dailyMap = {};

  enrichedItems.forEach(i => {

    const date = i.createdAt.toISOString().slice(0,10);

    if (!dailyMap[date]) {
      dailyMap[date] = {
        date,
        revenue: 0,
        qty: 0
      };
    }

    dailyMap[date].revenue += i.net;
    dailyMap[date].qty += i.items.qty;

  });

  return Object.values(dailyMap).sort(
    (a,b)=> new Date(a.date) - new Date(b.date)
  );

}

export function getSalespersonSalesReport(salespersonAnalytics){

  return salespersonAnalytics
    .sort((a,b)=>b.revenue-a.revenue)
    .map(sp=>({

      name: sp.name,
      code: sp.code,
      orders: sp.orders,
      revenue: sp.revenue,
      commission: sp.commission,
      commissionEfficiency: sp.commissionEfficiency
 
    }));

}

export function getDailyInvoiceList(invoiceList){

  return invoiceList
    .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
    .map(inv=>({

      invoiceNo: inv.invoiceNo,
      date: inv.createdAt,
      total: inv.grandTotal,
      paid: inv.paidAmount,
      due: inv.dueAmount,
      salesmanId: inv.salesmanId

    }));

}