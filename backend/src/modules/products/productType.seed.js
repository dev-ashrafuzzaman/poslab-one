export const seedProductTypes = async (db) => {
  /**
   * 🔒 SYSTEM MASTER: PRODUCT TYPES
   *
   * code (TT) = 2-digit IMMUTABLE
   * Used in SKU: TT + PPPP + VVV
   *
   * sizeType rules:
   * - TEXT   → uses defaultSizes
   * - NUMBER → uses defaultSizeRange
   * - N/A    → no size
   */

  await db.collection("product_types").deleteMany({ isSystem: true });

  const types = [
    {
      name: "Garments",
      code: "01",
      description: "Clothing items with text sizes",
      sizeType: "TEXT",
      defaultSizes: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    {
      name: "Shoes",
      code: "02",
      description: "Footwear with numeric sizes",
      sizeType: "NUMBER",
      defaultSizeRange: { min: 35, max: 45, step: 1 },
    },
    {
      name: "Pants",
      code: "03",
      description: "Waist-size based bottoms",
      sizeType: "NUMBER",
      defaultSizeRange: { min: 28, max: 40, step: 1 },
    },
    {
      name: "Accessories",
      code: "04",
      description: "Non-size items like belt, bag, cap",
      sizeType: "N/A",
    },
  ];

  const docs = types.map((t) => ({
    name: t.name,
    code: t.code, // 🔑 TT
    description: t.description,
    sizeType: t.sizeType,

    // conditional fields
    defaultSizes: t.sizeType === "TEXT" ? t.defaultSizes : undefined,
    defaultSizeRange:
      t.sizeType === "NUMBER" ? t.defaultSizeRange : undefined,

    status: "active",
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.collection("product_types").insertMany(docs);

  console.log("✅ Product Types Seeded Successfully");
};
