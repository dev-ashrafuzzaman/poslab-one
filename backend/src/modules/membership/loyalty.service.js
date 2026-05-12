// loyalty.service.js
import { ObjectId } from "mongodb";
import { canActivateMembership } from "./loyaltyRules.js";
import { nextLoyaltyCount } from "./loyaltyCalculator.js";

/**
 * Loyalty processing after successful sale
 * Must be called INSIDE sale transaction
 */
export async function processLoyaltyAfterSale({
  db,
  session,
  saleId,
  customerId,
  branchId,
  saleAmount,
  saleDate,
}) {
  /* ==========================
     BASIC GUARDS
  ========================== */
  if (!customerId) {
    return { applied: false, reason: "NO_CUSTOMER" };
  }

  const customerObjectId =
    customerId instanceof ObjectId
      ? customerId
      : new ObjectId(customerId);

  const branchObjectId =
    branchId instanceof ObjectId
      ? branchId
      : new ObjectId(branchId);

  /* ==========================
     LOAD MEMBERSHIP
  ========================== */
  const member = await db.collection("memberships").findOne(
    { customerId: customerObjectId },
    { session }
  );

  if (!member) {
    return { applied: false, reason: "NO_MEMBERSHIP" };
  }

  /* ==========================
     LOAD SETTINGS
  ========================== */
  const settings = await db
    .collection("loyalty_settings")
    .findOne({ status: "ACTIVE" }, { session });

  if (!settings) {
    return { applied: false, reason: "NO_SETTINGS" };
  }

  /* ==========================
     ACTIVATE MEMBERSHIP (if needed)
  ========================== */
  let currentStatus = member.status;

  const canActivate = canActivateMembership(saleAmount, settings);

  if (member.status === "PENDING" && canActivate) {
    await db.collection("memberships").updateOne(
      { _id: member._id },
      {
        $set: {
          status: "ACTIVE",
          activatedAt: new Date(),
        },
      },
      { session }
    );

    currentStatus = "ACTIVE";
  }

  if (currentStatus !== "ACTIVE") {
    return { applied: false, reason: "NOT_ACTIVE" };
  }

  /* ==========================
     NORMALIZE DAY (ANTI DUPLICATE)
  ========================== */
  const day = new Date(saleDate);
  day.setHours(0, 0, 0, 0);

  const duplicate = await db.collection("loyalty_activities").findOne(
    {
      memberId: member._id,
      branchId: branchObjectId,
      saleDay: day,
    },
    { session }
  );

  if (duplicate) {
    return { applied: false, reason: "DUPLICATE_DAY" };
  }

  /* ==========================
     MIN DAILY PURCHASE CHECK ✅ FIX
  ========================== */
  if (
    settings.minDailyPurchase &&
    saleAmount < settings.minDailyPurchase
  ) {
    return {
      applied: false,
      reason: "MIN_DAILY_PURCHASE_NOT_MET",
    };
  }

  /* ==========================
     FIND / CREATE RUNNING CYCLE
  ========================== */
  let cycle = await db.collection("loyalty_cycles").findOne(
    {
      memberId: member._id,
      branchId: branchObjectId,
      status: "RUNNING",
    },
    { session }
  );

  if (!cycle) {
    const res = await db.collection("loyalty_cycles").insertOne(
      {
        memberId: member._id,
        branchId: branchObjectId,
        cycleNo: 1,
        requiredCount: settings.requiredCount,
        currentCount: 0,
        status: "RUNNING",
        startedAt: new Date(),
      },
      { session }
    );

    cycle = {
      _id: res.insertedId,
      currentCount: 0,
      requiredCount: settings.requiredCount,
    };
  }

  /* ==========================
     CALCULATE NEXT COUNT
  ========================== */
  const { next, completed } = nextLoyaltyCount(
    cycle.currentCount,
    cycle.requiredCount
  );

  /* ==========================
     INSERT ACTIVITY
  ========================== */
  await db.collection("loyalty_activities").insertOne(
    {
      memberId: member._id,
      branchId: branchObjectId,
      cycleId: cycle._id,
      saleId,
      saleDay: day,
      amount: saleAmount,
      createdAt: new Date(),
    },
    { session }
  );

  /* ==========================
     UPDATE CYCLE
  ========================== */
  await db.collection("loyalty_cycles").updateOne(
    { _id: cycle._id },
    {
      $set: {
        currentCount: next,
        status: completed ? "COMPLETED" : "RUNNING",
        completedAt: completed ? new Date() : null,
      },
    },
    { session }
  );

  /* ==========================
     DONE
  ========================== */
  return {
    applied: true,
    completed,
    currentCount: next,
    requiredCount: cycle.requiredCount,
  };
}


