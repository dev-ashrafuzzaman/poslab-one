// modules/accounting/purchase.accounting.js
import { ObjectId } from "mongodb";
import { resolveSystemAccounts } from "../accounting/account.resolver.js";
import { postJournalEntry } from "../accounting/journals/journals.service.js";

export const processPurchaseInvoiceAccounting = async ({
  db,
  session,
  purchaseId,
  invoiceNo,
  calculatedSubTotal,
  shippingCost = 0,
  bankCharge = 0,
  splitPayments = [],
  partyId,
  partyType,
  branchId = null,
  narration = "",
}) => {
  const SYS = await resolveSystemAccounts(db);
  const pId = new ObjectId(partyId);
  const pType = partyType.toLowerCase().trim();

  const baseSubTotal = parseFloat(calculatedSubTotal || 0);
  const baseShipping = parseFloat(shippingCost || 0);
  const baseBankCharge = parseFloat(bankCharge || 0);

  const grandTotal = parseFloat(
    (baseSubTotal + baseShipping + baseBankCharge).toFixed(2),
  );

  const totalPaid = splitPayments.reduce(
    (sum, curr) => sum + parseFloat(curr?.amount || 0),
    0,
  );
  const dueAmount = parseFloat((grandTotal - totalPaid).toFixed(2));

  if (grandTotal <= 0 || totalPaid < 0 || dueAmount < 0) {
    throw new Error(
      "[Accounting Safety Breach] Invalid pricing totals or boundary collision inside procurement payload.",
    );
  }

  const entries = [];

  entries.push({
    accountId: SYS.INVENTORY_ASSET,
    debit: parseFloat(baseSubTotal.toFixed(2)),
    credit: 0,
  });

  if (baseShipping > 0) {
    entries.push({
      accountId: SYS.DELIVERY_FREIGHT,
      debit: parseFloat(baseShipping.toFixed(2)),
      credit: 0,
      narration: `Freight logistics cost for Invoice #${invoiceNo}`,
    });
  }

  if (baseBankCharge > 0) {
    entries.push({
      accountId: SYS.BANK_MFS_CHARGES,
      debit: parseFloat(baseBankCharge.toFixed(2)),
      credit: 0,
      narration: `Transaction fee/charge for Invoice #${invoiceNo}`,
    });
  }

  if (totalPaid > 0) {
    for (const payment of splitPayments) {
      const paymentAmount = parseFloat(payment?.amount || 0);
      if (paymentAmount <= 0) continue;

      entries.push({
        accountId: new ObjectId(payment.accountId),
        debit: 0,
        credit: paymentAmount,
        partyId: pId,
        partyType: pType,
        narration:
          payment.reference?.trim() ||
          `Disbursed allocation against Invoice #${invoiceNo}`,
      });
    }
  }

  if (dueAmount > 0) {
    entries.push({
      accountId: SYS.ACCOUNTS_PAYABLE,
      debit: 0,
      credit: dueAmount,
      partyId: pId,
      partyType: pType,
      narration: `Procurement credit outstanding locked for Invoice #${invoiceNo}`,
    });
  }

  return postJournalEntry({
    db,
    session,
    date: new Date(),
    refType: "PURCHASE",
    refId: new ObjectId(purchaseId),
    narration:
      narration?.trim() ||
      `Procurement voucher successfully balanced for Invoice: ${invoiceNo}`,
    entries,
    branchId: branchId ? new ObjectId(branchId) : null,
  });
};
