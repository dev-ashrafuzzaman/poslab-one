// discounts/discount.cron.js
import { getBDNow } from "./discount.utils.js";

export const expireDiscounts = async ({ db }) => {
  const now = getBDNow();

  const res = await db.collection("discounts").updateMany(
    {
      status: "active",
      isLifetime: false,
      endDate: { $lt: now },
    },
    {
      $set: {
        status: "inactive",
        expiredAt: now,
      },
    }
  );

  return res.modifiedCount;
};
