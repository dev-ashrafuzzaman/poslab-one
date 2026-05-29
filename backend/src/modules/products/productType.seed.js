export const seedProductTypes = async (db) => {


  await db.collection("product_types").deleteMany({ isSystem: true });

  const types = [
    {
      name: "Serial",
      code: "01",
      slug: "serial",
      status: "active",
    },

    {
      name: "Non Serial",
      code: "02",
      slug: "non-serial",
      status: "active",
    },

    {
      name: "Service",
      code: "03",
      slug: "service",
      status: "active",
    },

    {
      name: "Digital",
      code: "04",
      slug: "digital",
      status: "active",
    },

    {
      name: "Bundle / Package",
      code: "05",
      slug: "bundle-package",
      status: "active",
    },

    {
      name: "Consumable",
      code: "06",
      slug: "consumable",
      status: "active",
    },
  ];

  const docs = types.map((t) => ({
    name: t.name,
    code: t.code, 
    slug: t.slug,
    status: t.status,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.collection("product_types").insertMany(docs);

  console.log("✅ Product Types Seeded Successfully");
};
