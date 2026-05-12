
export const writeAuditLog = async ({
  db,
  userId = null,
  action, // e.g. SALE_RETURN_CREATE
  collection, // e.g. sales_returns
  documentId = null, // ObjectId
  refType = null, // SALE_RETURN
  refId = null, // returnId / saleId
  payload = {}, // sanitized payload
  branchId = null,
  ipAddress = null,
  userAgent = null,
  status = "SUCCESS", // SUCCESS | FAILED
  session = null,
}) => {
  await db.collection("audit_logs").insertOne(
    {
      userId,
      action,
      collection,
      documentId,
      refType,
      refId,
      branchId,
      payload,
      ipAddress,
      userAgent,
      status,
      createdAt: new Date(),
    },
    session ? { session } : {},
  );
};
