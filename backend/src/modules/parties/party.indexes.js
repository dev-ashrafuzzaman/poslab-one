// src/modules/parties/party.indexes.js

import { ensureIndex } from "../../database/indexManager.js";

export async function partiesIndexes(db) {
  const col = db.collection("parties");

  /* ===============================
     UNIQUE CODE
  =============================== */

  await ensureIndex(
    col,
    { code: 1 },
    {
      unique: true,
      name: "uniq_party_code",
    }
  );

  /* ===============================
     PHONE
  =============================== */

  await ensureIndex(
    col,
    { phone: 1 },
    {
      sparse: true,
      name: "idx_party_phone",
    }
  );

  /* ===============================
     EMAIL
  =============================== */

  await ensureIndex(
    col,
    { email: 1 },
    {
      sparse: true,
      name: "idx_party_email",
    }
  );

  /* ===============================
     TYPE
  =============================== */

  await ensureIndex(
    col,
    { type: 1 },
    {
      name: "idx_party_type",
    }
  );

  /* ===============================
     STATUS
  =============================== */

  await ensureIndex(
    col,
    { status: 1 },
    {
      name: "idx_party_status",
    }
  );

  /* ===============================
     BRANCH + TYPE
  =============================== */

  await ensureIndex(
    col,
    {
      branchCode: 1,
      type: 1,
    },
    {
      name: "idx_party_branch_type",
    }
  );

  /* ===============================
     SEARCH INDEX
  =============================== */

  await ensureIndex(
    col,
    {
      name: "text",
      code: "text",
      phone: "text",
      email: "text",
    },
    {
      name: "idx_party_search_text",
    }
  );

  /* ===============================
     CREATED DATE
  =============================== */

  await ensureIndex(
    col,
    { createdAt: -1 },
    {
      name: "idx_party_createdAt",
    }
  );

  /* ===============================
     BALANCE QUERY
  =============================== */

  await ensureIndex(
    col,
    {
      currentBalance: 1,
    },
    {
      name: "idx_party_balance",
    }
  );

  console.log("✅ Parties indexes ensured");
}