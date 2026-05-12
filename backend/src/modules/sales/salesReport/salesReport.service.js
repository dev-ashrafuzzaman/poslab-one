import { ObjectId } from "mongodb";
import { getDB } from "../../../config/db.js";
import { getBDToUTCRange } from "../../../utils/dateRangeBD.js";
import {
  getCategoryProfitReport,
  getDailyInvoiceList,
  getDailySalesTrend,
  getSalespersonSalesReport,
  getTopProductsReport,
} from "./dynamicReport.service.js";

export async function generateSalesReportEnterprise({ filters }) {
  const db = getDB();

  const {
    from,
    to,
    branchId,
    productId,
    categoryId,
    salespersonId,
    groupBy = "product",
  } = filters;

  if (!from || !to) throw new Error("Date range required");

  const { startUTC, endUTC } = getBDToUTCRange(from, to);

  /* =====================================================
     1️⃣ FINANCIAL CORE (ACCOUNTING BASED)
  ===================================================== */

  const journalMatch = {
    date: { $gte: startUTC, $lte: endUTC },
    refType: { $in: ["SALE", "SALE_RETURN", "SALE_COGS", "SALE_RETURN_COGS"] },
  };

  if (branchId) journalMatch.branchId = new ObjectId(branchId);

  const journalAgg = await db
    .collection("journals")
    .aggregate([
      { $match: journalMatch },
      { $unwind: "$entries" },
      {
        $group: {
          _id: "$refType",
          debit: { $sum: "$entries.debit" },
          credit: { $sum: "$entries.credit" },
        },
      },
    ])
    .toArray();

  let grossSales = 0;
  let salesReturn = 0;
  let saleCOGS = 0;
  let returnCOGS = 0;
  let totalDiscount = 0;

  journalAgg.forEach((r) => {
    if (r._id === "SALE") grossSales = r.credit;
    if (r._id === "SALE_RETURN") salesReturn = r.debit;
    if (r._id === "SALE_COGS") saleCOGS = r.debit;
    if (r._id === "SALE_RETURN_COGS") returnCOGS = r.credit;
  });


  /* =====================================================
     2️⃣ OPERATIONAL SALES LAYER
  ===================================================== */

  const saleMatch = {
    createdAt: { $gte: startUTC, $lte: endUTC },
    status: "COMPLETED",
  };

  if (branchId) saleMatch.branchId = new ObjectId(branchId);
  if (salespersonId) saleMatch.salesmanId = new ObjectId(salespersonId);

  const pipeline = [
    { $match: saleMatch },

    {
      $lookup: {
        from: "sale_items",
        localField: "_id",
        foreignField: "saleId",
        as: "items",
      },
    },

    { $unwind: "$items" },

    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    {
      $lookup: {
        from: "product_variants",
        localField: "items.variantId",
        foreignField: "_id",
        as: "variant",
      },
    },
    { $unwind: "$variant" },

    {
      $lookup: {
        from: "categories",
        localField: "product.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },

    {
      $lookup: {
        from: "categories",
        localField: "category.parentId",
        foreignField: "_id",
        as: "parentCategory",
      },
    },
    {
      $unwind: {
        path: "$parentCategory",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (productId)
    pipeline.push({ $match: { "items.productId": new ObjectId(productId) } });

  if (categoryId)
    pipeline.push({
      $match: { "product.categoryId": new ObjectId(categoryId) },
    });

  const rawItems = await db.collection("sales").aggregate(pipeline).toArray();

  /* =====================================================
     3️⃣ LOAD COGS FROM JOURNALS
  ===================================================== */

  const cogsAgg = await db
    .collection("journals")
    .aggregate([
      {
        $match: {
          ...journalMatch,
          refType: "SALE_COGS",
        },
      },
      { $unwind: "$entries" },
      {
        $group: {
          _id: "$refId",
          totalCOGS: { $sum: "$entries.debit" },
        },
      },
    ])
    .toArray();

  const cogsMap = {};
  cogsAgg.forEach((c) => {
    cogsMap[c._id?.toString()] = c.totalCOGS;
  });

  /* =====================================================
     4️⃣ GROUP ITEMS PER SALE (COGS ALLOCATION)
  ===================================================== */

  const saleGrouped = {};

  rawItems.forEach((row) => {
    const saleId = row._id.toString();

    if (!saleGrouped[saleId]) {
      saleGrouped[saleId] = {
        items: [],
        totalRevenue: 0,
      };
    }

    saleGrouped[saleId].items.push(row);
    saleGrouped[saleId].totalRevenue += row.items.lineTotal;
  });

  const enrichedItems = [];

  Object.entries(saleGrouped).forEach(([saleId, data]) => {
    const invoiceCOGS = cogsMap[saleId] || 0;

    data.items.forEach((item) => {
      const gross = item.items.qty * item.items.salePrice;
      const discount = item.items.discount?.amount || 0;
      const net = item.items.lineTotal;

      const ratio =
        data.totalRevenue > 0 ? item.items.lineTotal / data.totalRevenue : 0;

      const allocatedCOGS = invoiceCOGS * ratio;

      enrichedItems.push({
        ...item,
        gross,
        discount,
        net,
        allocatedCOGS,
        profit: net - allocatedCOGS,
      });
    });
  });

  const netSalesOperational = enrichedItems.reduce((sum, r) => sum + r.net, 0);

   totalDiscount = enrichedItems.reduce(
    (sum, r) => sum + (r.discount || 0),
    0,
  );

  const netSalesFinancial = grossSales - totalDiscount - salesReturn;

const netCOGS = saleCOGS - returnCOGS;

const grossProfitFinancial = netSalesFinancial - netCOGS;

const grossMarginFinancial =
  netSalesFinancial > 0
    ? Number(((grossProfitFinancial / netSalesFinancial) * 100).toFixed(2))
    : 0;

  /* =====================================================
     5️⃣ GROUPING (PRODUCT / VARIANT / DAY)
  ===================================================== */

  const grouped = {};

  enrichedItems.forEach((i) => {
    let key;

    if (groupBy === "variant") key = i.variant._id.toString();
    else if (groupBy === "day") key = i.createdAt.toISOString().slice(0, 10);
    else key = i.product._id.toString();

    if (!grouped[key]) {
      grouped[key] = {
        type: groupBy,
        productName: i.product.name,
        sku: i.variant.sku,
        size: i.variant.attributes?.size,
        color: i.variant.attributes?.color,
        categoryName: i.category.name,
        parentCategoryName: i.parentCategory?.name,
        revenue: 0,
        gross: 0,
        discount: 0,
        qty: 0,
        cogs: 0,
        profit: 0,
      };
    }

    grouped[key].revenue += i.net;
    grouped[key].gross += i.gross;
    grouped[key].discount += i.discount;
    grouped[key].qty += i.items.qty;
    grouped[key].cogs += i.allocatedCOGS;
    grouped[key].profit += i.profit;
  });

  const groupedResult = Object.values(grouped).map((g) => ({
    ...g,
    margin: g.revenue > 0 ? (g.profit / g.revenue) * 100 : 0,
  }));

  /* =====================================================
     6️⃣ SALESPERSON ANALYTICS
  ===================================================== */

  const salespersonAgg = await db
    .collection("sales")
    .aggregate([
      { $match: saleMatch },
      {
        $group: {
          _id: "$salesmanId",
          revenue: { $sum: "$grandTotal" },
          orders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
    ])
    .toArray();

  const commissionAgg = await db
    .collection("commission_ledgers")
    .aggregate([
      {
        $match: {
          createdAt: { $gte: startUTC, $lte: endUTC },
          ...(branchId && { branchId: new ObjectId(branchId) }),
        },
      },
      {
        $group: {
          _id: "$employeeId",
          totalCommission: { $sum: "$netCommission" },
        },
      },
    ])
    .toArray();

  const commissionMap = {};
  commissionAgg.forEach((c) => {
    commissionMap[c._id.toString()] = c.totalCommission;
  });

  const salespersonAnalytics = salespersonAgg.map((sp) => ({
    employeeId: sp._id,
    name: sp.employee.name,
    code: sp.employee.code,
    designation: sp.employee.designation,
    revenue: sp.revenue,
    orders: sp.orders,
    commission: commissionMap[sp._id?.toString()] || 0,
    commissionEfficiency:
      sp.revenue > 0
        ? ((commissionMap[sp._id?.toString()] || 0) / sp.revenue) * 100
        : 0,
  }));

  /* =====================================================
     FINAL RESPONSE
  ===================================================== */

  return {
    financialSummary: {
      grossSales,
      salesReturn,
      totalDiscount,
      netSalesFinancial,
      netCOGS,
      grossProfitFinancial,
      grossMarginFinancial,
    },

    operationalSummary: {
      netSalesOperational,
      reconciliationDifference: netSalesFinancial - netSalesOperational,
    },

    topProducts: getTopProductsReport(groupedResult),

    categoryProfit: getCategoryProfitReport(enrichedItems),

    dailySalesTrend: getDailySalesTrend(enrichedItems),

    salespersonReport: getSalespersonSalesReport(salespersonAnalytics),
    groupedResult,
    salespersonAnalytics,
  };
}
