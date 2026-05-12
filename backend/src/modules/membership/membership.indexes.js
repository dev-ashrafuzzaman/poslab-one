export async function membershipsIndexes(db) {
  const col = db.collection("memberships");
  const acol = db.collection("loyalty_activities");

  await col.createIndex(
    { memberCode: 1 },
    { unique: true, name: "uniq_member_code" }
  );

  await col.createIndex(
    { customerId: 1 },
    { unique: true, name: "uniq_customer_membership" }
  );

  await col.createIndex(
    { branchId: 1 },
    { name: "idx_membership_branch" }
  );
  await acol.createIndex(
     { memberId: 1, branchId: 1, saleDay: 1 },
    { unique: true }
  );
  await acol.createIndex(
 { memberId: 1, branchId: 1, status: 1 }
  );
}
