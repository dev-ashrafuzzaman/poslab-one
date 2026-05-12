import { getDB } from "../../../config/db.js";
import { reprintSaleService, reprintSalesReturnService } from "./sales.reprint.service.js";

export const reprintSale = async (req, res, next) => {
  try {
    const result = await reprintSaleService({
      db: getDB(),
      saleId: req.params.saleId,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const reprintSaleByInvoice = async (req, res, next) => {
  try {
    const result = await reprintSaleService({
      db: getDB(),
      invoiceNo: req.params.invoiceNo,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


export const reprintSalesReturn = async (req, res, next) => {
  try {
    const db = getDB();

    const result = await reprintSalesReturnService({
      db, 
      salesReturnId: req.params.salesReturnId,
      returnInvoiceNo: req.query.returnInvoiceNo,
      user: req.user,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};