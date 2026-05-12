import { calculateCommission } from "./commission.utils.js";
import { resolveCommissionRule } from "./commission.hook.js";

export const createSalesCommission = async ({
  db,
  sale,
}) => {
  if (!sale.salesPersonId) return;

  const employee = await db
    .collection("employees")
    .findOne({ _id: sale.salesPersonId });

  if (!employee) return;

  const rule = await resolveCommissionRule({
    db,
    branchId: sale.branchId,
    role: employee.role,
    salesAmount: sale.netAmount,
  });

  if (!rule) return;

  const commissionAmount = calculateCommission({
    salesAmount: sale.netAmount,
    commissionType: rule.commissionType,
    commissionValue: rule.commissionValue,
  });

  const month = sale.invoiceDate.toISOString().slice(0, 7);

  await db.collection("sales_commissions").insertOne({
    saleId: sale._id,
    invoiceNo: sale.invoiceNo,

    employeeId: employee._id,
    employeeCode: employee.code,
    employeeName: employee.name,

    branchId: sale.branchId,
    branchCode: sale.branchCode,
    branchName: sale.branchName,

    month,

    salesAmount: sale.netAmount,
    commissionType: rule.commissionType,
    commissionValue: rule.commissionValue,
    commissionAmount,

    status: "pending",
    createdAt: new Date(),
  });
};
