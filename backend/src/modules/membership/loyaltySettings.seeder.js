export async function seedLoyaltySettings(db) {
  const now = new Date();

  const SETTINGS_UPDATE = {
    minActivationAmount: 2000,      // Membership activate
    minDailyPurchase: 1000,         // Loyalty count eligible
    requiredCount: 6,               // Steps to complete cycle
    maxRewardValue: 2000,           // Max flat discount
    productDiscountPercent: 10,          
    rewardType: "FLAT",             // FLAT | PRODUCT
    resetMode: "AUTO",              // AUTO | MANUAL

    conflictRules: {
      allowWithProductDiscount: true,
      allowWithBillDiscount: false,
    },

    status: "ACTIVE",
    updatedAt: now,                 // ✅ always update
  };

  await db.collection("loyalty_settings").updateOne(
    { status: "ACTIVE" },
    {
      $set: SETTINGS_UPDATE,
      $setOnInsert: {
        createdAt: now,             // ✅ insert time only
      },
    },
    { upsert: true }
  );

  console.log("✅ Loyalty settings seeded / synced");
}
