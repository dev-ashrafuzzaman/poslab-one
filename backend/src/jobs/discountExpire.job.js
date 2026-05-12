import { expireDiscounts } from "../modules/inventory/discount/discount.service.js";


/* ======================================================
   DISCOUNT AUTO EXPIRE JOB
====================================================== */
export const runDiscountExpireJob = async (app) => {
  try {
    const db = app.locals.db;

    const { expiredCount } = await expireDiscounts({ db });

    if (expiredCount > 0) {
      console.log(
        `🕒 Discount Expire Job: ${expiredCount} discount(s) expired`
      );
    }
  } catch (err) {
    console.error("❌ Discount Expire Job failed", err);
  }
};
