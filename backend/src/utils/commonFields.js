
/**
 * Build operation context safely
 */
const buildMeta = (prevMeta = {}, context = {}) => {
  const { ipAddress = null, device = null, source = "system" } = context;

  return {
    ...prevMeta,
    ipAddress,
    device,
    source,
  }; 
};

/* ======================================================
   CREATE FIELDS
====================================================== */
/**
 * @param {Object} payload - document fields
 * @param {Object} context - request context
 */
export const withCreateFields = (payload = {}, context = {}) => {
  const { userId = null, branchId = null } = context;

  const now = new Date();

  return {
    ...payload,

    status: "active",
    branchId,

    createdAt: now,
    createdBy: userId,
  };
};

/* ======================================================
   UPDATE FIELDS
====================================================== */
/**
 * @param {Object} payload - fields to update
 * @param {Object} context - request context
 * @param {Object} prevDoc - existing document (optional)
 */
export const withUpdateFields = (payload = {}, context = {}, prevDoc = {}) => {
  return {
    ...payload,

    updatedAt: new Date(),
    updatedBy: context.userId || null,

    meta: buildMeta(prevDoc.meta, context),
  };
};

/* ======================================================
   DELETE FIELDS (SOFT DELETE)
====================================================== */
export const withDeleteFields = (context = {}, prevDoc = {}) => {
  return {
    status: "deleted",

    updatedAt: new Date(),
    updatedBy: context.userId || null,

    meta: buildMeta(prevDoc.meta, context),
  };
};
