import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";
import { getSetting } from "../settings/settings.service.js";
import { calculatePoints } from "../settings/settings.service.js";

export const addLoyaltyPoints = async ({
  db,
  customerId,
  invoiceAmount,
  refType,
  refId,
  session
}) => {
  const setting = await getSetting(db, "LOYALTY_POINTS");

  if (!setting?.value?.enabled) return;

  if (!setting.value.applicableOn.includes(refType)) return;

  if (invoiceAmount < setting.value.minInvoiceAmount) return;

  const points = calculatePoints({
    amount: invoiceAmount,
    rule: {
      ...setting.value.earnRule,
      round: setting.value.round
    }
  });

  if (points <= 0) return;

  // 1️⃣ Update customer balance
  await db.collection(COLLECTIONS.CUSTOMERS).updateOne(
    { _id: new ObjectId(customerId) },
    { $inc: { loyaltyPoints: points } },
    { session }
  );

  // 2️⃣ Ledger / history (VERY IMPORTANT)
  await db.collection(COLLECTIONS.LOYALTY_LOGS).insertOne(
    {
      customerId: new ObjectId(customerId),
      points,
      refType,
      refId: new ObjectId(refId),
      invoiceAmount,
      createdAt: new Date()
    },
    { session }
  );
};
