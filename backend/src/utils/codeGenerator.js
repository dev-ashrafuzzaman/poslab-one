export const generateCode = async ({
  db,
  module,             // CUSTOMER | SUPPLIER | PRODUCT | SALE | PURCHASE
  prefix,             // CUS | SUP | PRD | SAL | PUR
  padding = 5,
  scope = "NONE",     // NONE | YEAR | MONTH
  branch = null,      // DHK | CTG | null
  session = null,     // Mongo session (optional)
  preview = false     // true = no increment
}) => {
  /* ===================== 
     VALIDATION 
  ====================== */
  const VALID_SCOPE = ["NONE", "YEAR", "MONTH"];
  if (!VALID_SCOPE.includes(scope)) {
    throw new Error(`Invalid scope: ${scope}`);
  }

  if (!module || !prefix) {
    throw new Error("module and prefix are required");
  }

  /* =====================
     TIME PARTS
  ====================== */
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  /* =====================
     COUNTER KEY (NORMALIZED)
     Format:
     MODULE|BRANCH|SCOPE|PERIOD
  ====================== */
  const keyParts = [
    module,
    branch || "ALL",
    scope,
    scope === "YEAR" ? year :
    scope === "MONTH" ? `${year}${month}` :
    "NONE"
  ];

  const counterKey = keyParts.join("|");

  /* =====================
     DB OPTIONS
  ====================== */
  const options = {
    upsert: true,
    returnDocument: "after"
  };

  if (session) options.session = session;

  /* =====================
     PREVIEW MODE (NO INC)
  ====================== */
  let counterDoc;

  if (preview) {
    counterDoc = await db
      .collection("counters")
      .findOne({ _id: counterKey });

    const nextSeq = (counterDoc?.seq || 0) + 1;
    return buildCode({ prefix, branch, scope, year, month, nextSeq, padding });
  }

  /* =====================
     ATOMIC INCREMENT
  ====================== */
const result = await db.collection("counters").findOneAndUpdate(
  { _id: counterKey },
  {
    $inc: { seq: 1 },
    $setOnInsert: {
      module,
      branch,
      scope,
      createdAt: now,
    },
  },
  {
    upsert: true,
    returnDocument: "after",
    session,
  }
);

  return buildCode({
    prefix,
    branch,
    scope,
    year,
    month,
    nextSeq: result.seq,
    padding
  });
};

/* =====================
   CODE FORMATTER
====================== */
const buildCode = ({
  prefix,
  branch,
  scope,
  year,
  month,
  nextSeq,
  padding
}) => {
  const seq = String(nextSeq).padStart(padding, "0");

  let code = prefix;

  if (branch) code += `-${branch}`;
  if (scope === "YEAR") code += `-${year}`;
  if (scope === "MONTH") code += `-${year}${month}`;

  code += `-${seq}`;
  return code;
};
