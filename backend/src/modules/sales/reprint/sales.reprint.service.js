import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../../database/collections.js";
import { ensureObjectId } from "../../../utils/ensureObjectId.js";
import { roundMoney } from "../../../utils/money.js";

export const reprintSaleService = async ({ db, saleId, invoiceNo, user }) => {
  /* ---------------- Sale ---------------- */
  const saleQuery = saleId
    ? { _id: new ObjectId(saleId) }
    : { invoiceNo };

  const sale = await db.collection("sales").findOne(saleQuery);

  if (!sale) {
    throw new Error("Sale not found");
  }

  /* ---------------- Branch ---------------- */
  const branch = await db.collection("branches").findOne({
    _id: sale.branchId,
  });

  /* ---------------- Customer ---------------- */
  let customer = null;
  if (sale.customerId) {
    customer = await db.collection("customers").findOne({
      _id: sale.customerId,
    });
  }

  /* ---------------- Items ---------------- */
  const saleItems = await db
    .collection("sale_items")
    .find({ saleId: sale._id })
    .toArray();

  /* ---------------- Payments ---------------- */
  const payments = await db
    .collection("sale_payments")
    .find({ saleId: sale._id })
    .toArray();

  /* ---------------- VAT ---------------- */
  const vatConfig = await db.collection("tax_configs").findOne({
    appliesTo: "SALE",
    status: "active",
  });
  const vatRate = vatConfig ? Number(vatConfig.rate) : 0;

  /* =================================================
   * 🔥 FINAL RESPONSE (100% SAME AS CREATE SALE)
   * ================================================= */
  return {
    success: true,
    message: "Sales invoice reprint",

    data: {
      sale: {
        saleId: sale._id,
        invoiceNo: sale.invoiceNo,
        type: sale.type,
        status: sale.status ,
        date: sale.createdAt,
        createdBy: sale.createdBy || user?.name || "ERP SYSTEM",
      },

      branch: {
        branchId: branch?._id || null,
        code: branch?.code || null,
        name: branch?.name || null,
        phone: branch?.phone || null,
        address: branch?.address || null,
      },

      customer: customer
        ? {
            customerId: customer._id,
            name: customer.name,
            phone: customer.phone || null,
            address: customer.address || null,
          }
        : {
            customerId: null,
            name: "Walk-in Customer",
            phone: null,
            address: null,
          },

      items: saleItems.map((i) => ({
        sku: i.sku,
        qty: i.qty,
        unitPrice: i.salePrice,
        discount: i.discount,
        vat: i.taxAmount,
        lineTotal: i.lineTotal,
      })),

      summary: {
        subTotal: sale.subTotal,
        itemDiscount: sale.itemDiscount,
        billDiscount: sale.billDiscount,
        taxAmount: sale.taxAmount,
        grandTotal: sale.grandTotal,
        paidAmount: sale.paidAmount,
        dueAmount: sale.dueAmount,
      },

      payments: payments.map((p) => ({
        method: p.method,
        amount: p.amount,
        reference: p.reference || null,
      })),

      print: {
        currency: "BDT",
        vatRate,
        footerNote: "Thank you for shopping with us!",
        printedAt: new Date(), // optional but useful
      },
    },
  };
};

export const reprintSalesReturnService = async ({
  db,
  salesReturnId,
  returnInvoiceNo,
  user,
}) => {
  /* ---------------- Sales Return ---------------- */
  const returnQuery = salesReturnId
    ? { _id: ensureObjectId(salesReturnId, "salesReturnId") }
    : { returnInvoiceNo };

  const salesReturn = await db
    .collection(COLLECTIONS.SALES_RETURNS)
    .findOne(returnQuery);

  if (!salesReturn) {
    throw new Error("Sales return not found");
  }

  /* ---------------- Original Sale ---------------- */
  const sale = await db.collection(COLLECTIONS.SALES).findOne({
    _id: salesReturn.saleId,
  });

  /* ---------------- Branch ---------------- */
  const branch = await db.collection(COLLECTIONS.BRANCHES).findOne({
    _id: salesReturn.branchId,
  });

  /* ---------------- Customer ---------------- */
  let customer = null;
  if (sale?.customerId) {
    customer = await db.collection(COLLECTIONS.CUSTOMERS).findOne({
      _id: sale.customerId,
    });
  }

  /* ---------------- Return Items ---------------- */
  const returnItems = await db
    .collection(COLLECTIONS.SALES_RETURN_ITEMS)
    .find({ salesReturnId: salesReturn._id })
    .toArray();

  /* ---------------- VAT (same config as sale) ---------------- */
  const vatConfig = await db.collection("tax_configs").findOne({
    appliesTo: "SALE",
    status: "active",
  });
  const vatRate = vatConfig ? Number(vatConfig.rate) : 0;

  /* =================================================
   * 🔥 FINAL RESPONSE (SALE PRINT COMPATIBLE)
   * ================================================= */
  return {
    success: true,
    message: "Sales return invoice reprint",

    data: {
      sale: {
        saleId: salesReturn.saleId,
        invoiceNo: salesReturn.returnInvoiceNo, // 🔥 important
        type: "RETURN",
        status: salesReturn.status,
        date: salesReturn.createdAt,
        createdBy: salesReturn.createdBy || user?.name || "ERP SYSTEM",

        // helpful references
        originalInvoiceNo: sale?.invoiceNo || null,
      },

      branch: {
        branchId: branch?._id || null,
        code: branch?.code || null,
        name: branch?.name || null,
        phone: branch?.phone || null,
        address: branch?.address || null,
      },

      customer: customer
        ? {
            customerId: customer._id,
            name: customer.name,
            phone: customer.phone || null,
            address: customer.address || null,
          }
        : {
            customerId: null,
            name: "Walk-in Customer",
            phone: null,
            address: null,
          },

      /* ---------- ITEMS (RETURNED ITEMS) ---------- */
      items: returnItems.map((i) => ({
        sku: i.sku,
        qty: i.qty, 
        unitPrice: roundMoney(i.refundAmount / i.qty),
        discount: 0, 
        vat: 0,
        lineTotal: i.refundAmount,
      })),

      /* ---------- SUMMARY ---------- */
      summary: {
        subTotal: salesReturn.refundAmount,
        itemDiscount: 0,
        billDiscount: 0,
        taxAmount: 0,
        grandTotal: salesReturn.refundAmount,
        paidAmount: salesReturn.refundAmount,
        dueAmount: 0,
      },

      payments: [
        {
          method: salesReturn.refundMethod || "CASH",
          amount: salesReturn.refundAmount,
          reference: null,
        },
      ],

      print: {
        currency: "BDT",
        vatRate,
        footerNote: "Sales return processed successfully",
        printedAt: new Date(),
      },
    },
  };
};