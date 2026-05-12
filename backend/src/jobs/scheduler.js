import cron from "node-cron";
import { runDiscountExpireJob } from "./discountExpire.job.js";

export const startSchedulers = (app) => {
  // Runs every day at 00:05 AM
  cron.schedule("5 0 * * *", async () => {
    await runDiscountExpireJob(app);
  });

  console.log("🕒 Discount scheduler started");
};
