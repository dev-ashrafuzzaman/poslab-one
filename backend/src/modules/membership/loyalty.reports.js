// loyalty.reports.js
export async function loyaltySummary(db, { branchId }) {
  return db.collection("loyalty_cycles").aggregate([
    { $match: { status: "COMPLETED" } },
    {
      $group: {
        _id: "$memberId",
        totalCompleted: { $sum: 1 },
      },
    },
  ]).toArray();
}
