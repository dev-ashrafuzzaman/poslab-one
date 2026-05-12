import { COLLECTIONS } from "./collections.js";

export const createIndexes = async (db) => {
  /* ===========================
     BRANCHES
  ============================ */
  await db
    .collection(COLLECTIONS.BRANCHES)
    .createIndex({ code: 1 }, { unique: true });

  await db
    .collection(COLLECTIONS.BRANCHES)
    .createIndex({ status: 1 });


  /* ===========================
     CATEGORIES
  ============================ */
  await db
    .collection(COLLECTIONS.CATEGORIES)
    .createIndex({ parentId: 1 });

  await db
    .collection(COLLECTIONS.CATEGORIES)
    .createIndex({ level: 1 });

  // Optional (fast category search)
  await db
    .collection(COLLECTIONS.CATEGORIES)
    .createIndex({ name: 1 });


  /* ===========================
     PRODUCTS
  ============================ */
  // 1️⃣ Product identity (business level)
await db.collection(COLLECTIONS.PRODUCTS).createIndex(
  { name: 1, categoryId: 1, productTypeId: 1 },
  {
    unique: true,
    name: "uniq_product_name_category_type",
  }
);

// 2️⃣ SKU global identity (NULL safe)
await db.collection(COLLECTIONS.PRODUCTS).createIndex(
  { sku: 1 },
  {
    unique: true,
    partialFilterExpression: { sku: { $exists: true } },
    name: "uniq_product_sku",
  }
);

// 3️⃣ Common filters
await db.collection(COLLECTIONS.PRODUCTS).createIndex(
  { categoryId: 1 },
  { name: "idx_product_category" }
);

await db.collection(COLLECTIONS.PRODUCTS).createIndex(
  { status: 1 },
  { name: "idx_product_status" }
);

await db.collection(COLLECTIONS.PRODUCTS).createIndex(
  { createdAt: -1 },
  { name: "idx_product_createdAt" }
);
 


  /* ===========================
     VARIANTS
  ============================ */
  // SKU is global identity
  await db.collection(COLLECTIONS.VARIANTS).createIndex(
    { sku: 1 },
    { unique: true }
  );

  // Prevent duplicate variant per product
  await db.collection(COLLECTIONS.VARIANTS).createIndex(
    {
      productId: 1,
      "attributes.size": 1,
      "attributes.color": 1
    },
    { unique: true }
  );

  await db
    .collection(COLLECTIONS.VARIANTS)
    .createIndex({ productId: 1 });

  await db
    .collection(COLLECTIONS.VARIANTS)
    .createIndex({ status: 1 });

  // Search optimization
  await db
    .collection(COLLECTIONS.VARIANTS)
    .createIndex({ "attributes.size": 1 });

  await db
    .collection(COLLECTIONS.VARIANTS)
    .createIndex({ "attributes.color": 1 });

  await db
    .collection(COLLECTIONS.VARIANTS)
    .createIndex({ createdAt: -1 });


  /* ===========================
     ATTRIBUTES (MASTER DATA)
  ============================ */
  // Prevent duplicate attribute like (size, M)
  await db.collection(COLLECTIONS.ATTRIBUTES).createIndex(
    { type: 1, name: 1 },
    { unique: true }
  );

  await db
    .collection(COLLECTIONS.ATTRIBUTES)
    .createIndex({ status: 1 });


  /* ===========================
     STOCKS / INVENTORY
  ============================ */
  // One stock record per variant per branch
  await db.collection(COLLECTIONS.STOCKS).createIndex(
    { branchId: 1, variantId: 1 },
    { unique: true }
  );

  await db
    .collection(COLLECTIONS.STOCKS)
    .createIndex({ branchId: 1 });

  await db
    .collection(COLLECTIONS.STOCKS)
    .createIndex({ variantId: 1 });


  /* ===========================
     PURCHASES
  ============================ */
  await db.collection(COLLECTIONS.PURCHASES).createIndex(
    { purchaseNo: 1 },
    { unique: true }
  );

  await db
    .collection(COLLECTIONS.PURCHASES)
    .createIndex({ branchId: 1 });

  await db
    .collection(COLLECTIONS.PURCHASES)
    .createIndex({ supplierId: 1 });

  await db
    .collection(COLLECTIONS.PURCHASES)
    .createIndex({ createdAt: -1 });


  /* ===========================
     SALES
  ============================ */
  await db.collection(COLLECTIONS.SALES).createIndex(
    { invoiceNo: 1 },
    { unique: true }
  );

  await db
    .collection(COLLECTIONS.SALES)
    .createIndex({ branchId: 1 });

  await db
    .collection(COLLECTIONS.SALES)
    .createIndex({ customerId: 1 });

  await db
    .collection(COLLECTIONS.SALES)
    .createIndex({ createdAt: -1 });


  /* ===========================
     CUSTOMERS
  ============================ */
  await db.collection(COLLECTIONS.CUSTOMERS).createIndex(
    { phone: 1 },
    { unique: true }
  );

  await db
    .collection(COLLECTIONS.CUSTOMERS)
    .createIndex({ status: 1 });


  /* ===========================
     SUPPLIERS
  ============================ */
  await db.collection(COLLECTIONS.SUPPLIERS).createIndex(
    { "contact.phone": 1 },
    { unique: true, sparse: true }
  );


  /* ===========================
     USERS
  ============================ */
  await db.collection(COLLECTIONS.USERS).createIndex(
    { email: 1 },
    { unique: true }
  );

  await db
    .collection(COLLECTIONS.USERS)
    .createIndex({ "branches.branchId": 1 });

  await db
    .collection(COLLECTIONS.USERS)
    .createIndex({ status: 1 });


  /* ===========================
     AUDIT LOGS
  ============================ */
  await db
    .collection(COLLECTIONS.AUDIT_LOGS)
    .createIndex({ action: 1 });

  await db
    .collection(COLLECTIONS.AUDIT_LOGS)
    .createIndex({ refType: 1, refId: 1 });

  await db
    .collection(COLLECTIONS.AUDIT_LOGS)
    .createIndex({ branchId: 1, createdAt: -1 });

  await db
    .collection(COLLECTIONS.AUDIT_LOGS)
    .createIndex({ userId: 1, createdAt: -1 });


  /* ===========================
     LEDGERS
  ============================ */
  await db.collection(COLLECTIONS.LEDGERS).createIndex(
    { branchId: 1, accountId: 1, date: 1 }
  );

  await db.collection(COLLECTIONS.LEDGERS).createIndex(
    { refType: 1, refId: 1 }
  );

  console.log("✅ All indexes created successfully");
};
 