//modules/products/product.controller.js
import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { COLLECTIONS } from "../../database/collections.js";
import { generateProductCode } from "../../utils/sku/generateProductCode.js";
import { generateVariantSKU } from "../../utils/sku/generateVariantSKU.js";

/* =========================================================
   GENERATE VARIANT COMBINATIONS
========================================================= */

const generateVariants = (variants = []) => {
  if (!variants.length) return [];

  const result = [];

  const recurse = (index, current) => {
    if (index === variants.length) {
      result.push(current);

      return;
    }

    const variant = variants[index];

    for (const value of variant.values) {
      recurse(index + 1, {
        ...current,

        [variant.name]: value,
      });
    }
  };

  recurse(0, {});

  return result;
};

/* =========================================================
   BUILD VARIANT TITLE
========================================================= */

const buildVariantTitle = (productName, attributes = {}) => {
  return `${productName} - ${Object.values(attributes).join(" / ")}`;
};

/* =========================================================
   CREATE PRODUCT
========================================================= */

export const createProduct = async (req, res, next) => {
  const db = getDB();

  const session = db.client.startSession();

  try {
    const payload = req.body;

    const {
      name,

      productTypeId,

      categoryId,

      subCategoryId,

      brandId,

      unitId,

      barcode,

      model,

      rackNo,

      description,

      variants = [],
    } = payload;

    /* =========================================================
       REQUIRED VALIDATIONS
    ========================================================= */

    if (
      !name ||
      !productTypeId ||
      !categoryId ||
      !subCategoryId ||
      !brandId ||
      !unitId
    ) {
      return res.status(400).json({
        success: false,

        message: "Required fields missing",
      });
    }

    /* =========================================================
       OBJECT ID VALIDATIONS
    ========================================================= */

    const ids = [productTypeId, categoryId, subCategoryId, brandId, unitId];

    const invalidIds = ids.some((id) => !ObjectId.isValid(id));

    if (invalidIds) {
      return res.status(400).json({
        success: false,

        message: "Invalid ids",
      });
    }

    /* =========================================================
       START TRANSACTION
    ========================================================= */

    await session.withTransaction(async () => {
      /* =========================================================
         FIND PRODUCT TYPE
      ========================================================= */

      const productType = await db
        .collection(COLLECTIONS.PRODUCT_TYPES)
        .findOne(
          {
            _id: new ObjectId(productTypeId),

            status: "active",
          },
          {
            session,
          },
        );

      if (!productType) {
        throw new Error("Invalid product type");
      }

      /* =========================================================
         VALIDATE CATEGORY
      ========================================================= */

      const category = await db.collection(COLLECTIONS.CATEGORIES).findOne(
        {
          _id: new ObjectId(categoryId),
        },
        {
          session,
        },
      );

      if (!category) {
        throw new Error("Invalid category");
      }

      /* =========================================================
         VALIDATE BRAND
      ========================================================= */

      const brand = await db.collection(COLLECTIONS.BRANDS).findOne(
        {
          _id: new ObjectId(brandId),
        },
        {
          session,
        },
      );

      if (!brand) {
        throw new Error("Invalid brand");
      }

      /* =========================================================
         VALIDATE UNIT
      ========================================================= */

      const unit = await db.collection(COLLECTIONS.UNITS).findOne(
        {
          _id: new ObjectId(unitId),
        },
        {
          session,
        },
      );

      if (!unit) {
        throw new Error("Invalid unit");
      }

      /* =========================================================
         DUPLICATE CHECK
      ========================================================= */

      const exists = await db.collection(COLLECTIONS.PRODUCTS).findOne(
        {
          name: name.trim(),

          brandId: new ObjectId(brandId),

          categoryId: new ObjectId(categoryId),
        },
        {
          session,
        },
      );

      if (exists) {
        throw new Error("Product already exists");
      }

      /* =========================================================
         GENERATE PRODUCT CODE
      ========================================================= */

      const productCode = await generateProductCode({
        db,

        productTypeCode: productType.code,

        session,
      });

      /* =========================================================
         GENERATE VARIANT COMBINATIONS
      ========================================================= */

      const generatedVariants = generateVariants(variants);

      /* =========================================================
         PRODUCT DOC
      ========================================================= */

      const now = new Date();

      const productDoc = {
        name: name.trim(),

        slug: name.trim().toLowerCase().replace(/\s+/g, "-"),

        productCode,

        productTypeId: new ObjectId(productTypeId),

        categoryId: new ObjectId(categoryId),

        subCategoryId: new ObjectId(subCategoryId),

        brandId: new ObjectId(brandId),

        unitId: new ObjectId(unitId),

        barcode: barcode || null,

        model: model || null,

        rackNo: rackNo || null,

        description: description || null,

        variantSchema: variants,

        hasVariants: generatedVariants.length > 0,

        status: "active",

        createdAt: now,

        updatedAt: now,
      };

      /* =========================================================
         INSERT PRODUCT
      ========================================================= */

      const productRes = await db
        .collection(COLLECTIONS.PRODUCTS)
        .insertOne(productDoc, {
          session,
        });

      const productId = productRes.insertedId;

      /* =========================================================
         CREATE PRODUCT VARIANTS
      ========================================================= */

      const variantDocs = [];

      for (const variant of generatedVariants) {
        const { sku, variantCode } = await generateVariantSKU({
          db,

          productId,

          productCode,

          session,
        });

        variantDocs.push({
          productId,

          productCode,

          sku,

          variantCode,

          title: buildVariantTitle(name, variant),

          attributes: variant,

          barcode: null,

          purchasePrice: 0,

          salePrice: 0,

          stock: 0,

          status: "active",

          createdAt: now,

          updatedAt: now,
        });
      }

      /* =========================================================
         INSERT VARIANTS
      ========================================================= */

      if (variantDocs.length) {
        await db
          .collection(COLLECTIONS.VARIANTS)
          .insertMany(variantDocs, {
            session,
          });
      }

      /* =========================================================
         RESPONSE
      ========================================================= */

      res.status(201).json({
        success: true,

        message: "Product created successfully",

        data: {
          productId,

          productCode,

          totalVariants: variantDocs.length,
        },
      });
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const db = getDB();

    /* ---------------- Pagination ---------------- */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    /* ---------------- Query Params ---------------- */
    const {
      search,
      categoryId,
      parentCategoryId,
      hasVariant,
      status = "active",
      color,
      size,
      sort = "latest",
    } = req.query;

    /* ---------------- Match Builder ---------------- */
    const match = { status };

    if (hasVariant !== undefined) {
      match.hasVariant = hasVariant === "true";
    }

    if (categoryId) {
      match.categoryId = new ObjectId(categoryId);
    }

    /* ---------------- Aggregation ---------------- */
    const pipeline = [
      { $match: match },

      /* 🔗 Sub Category */
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      { $unwind: "$subCategory" },

      /* 🔗 Parent Category */
      {
        $lookup: {
          from: "categories",
          localField: "subCategory.parentId",
          foreignField: "_id",
          as: "parentCategory",
        },
      },
      { $unwind: "$parentCategory" },

      /* 🎯 Parent Category Filter */
      ...(parentCategoryId
        ? [
            {
              $match: {
                "parentCategory._id": new ObjectId(parentCategoryId),
              },
            },
          ]
        : []),

      /* 🔗 Variants */
      {
        $lookup: {
          from: "product_variants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productId", "$$productId"] },
              },
            },

            ...(color ? [{ $match: { "attributes.color": color } }] : []),
            ...(size ? [{ $match: { "attributes.size": size } }] : []),
          ],
          as: "variants",
        },
      },

      /* 🔍 Search */
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { name: { $regex: search, $options: "i" } },
                  { brand: { $regex: search, $options: "i" } },
                  { productCode: { $regex: search, $options: "i" } },
                  { "variants.sku": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      /* 💰 Min Price (for sorting) */
      {
        $addFields: {
          minSalePrice: {
            $cond: [
              { $gt: [{ $size: "$variants" }, 0] },
              { $min: "$variants.salePrice" },
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          defaultCostPrice: {
            $cond: [
              { $gt: [{ $size: "$variants" }, 0] },
              { $min: "$variants.costPrice" },
              null,
            ],
          },
          defaultSalePrice: {
            $cond: [
              { $gt: [{ $size: "$variants" }, 0] },
              { $min: "$variants.salePrice" },
              null,
            ],
          },
        },
      },

      /* ↕ Sorting */
      {
        $sort:
          sort === "price"
            ? { minSalePrice: 1 }
            : sort === "name"
              ? { name: 1 }
              : { createdAt: -1 },
      },

      /* 📄 Facet for pagination */
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1,
                brand: 1,
                productCode: 1,
                unit: 1,
                status: 1,
                defaultCostPrice: 1,
                defaultSalePrice: 1,
                sizeConfig: 1,
                colors: 1,
                hasVariant: 1,
                category: {
                  parent: "$parentCategory.name",
                  sub: "$subCategory.name",
                },
                variants: {
                  $map: {
                    input: "$variants",
                    as: "v",
                    in: {
                      _id: "$$v._id",
                      sku: "$$v.sku",
                      attributes: "$$v.attributes",
                      salePrice: "$$v.salePrice",
                      costPrice: "$$v.costPrice",
                    },
                  },
                },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await db
      .collection("products")
      .aggregate(pipeline)
      .toArray();

    const data = result[0].data;
    const total = result[0].total[0]?.count || 0;

    res.json({
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsForPurchase = async (req, res, next) => {
  try {
    const db = getDB();

    /* ======================
       PAGINATION
    ====================== */
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const { search, categoryId, parentCategoryId } = req.query;

    /* ======================
       BASE MATCH
    ====================== */
    const match = { status: "active" };
    if (categoryId) match.categoryId = new ObjectId(categoryId);

    /* ======================
       PIPELINE
    ====================== */
    const pipeline = [
      { $match: match },

      /* ---------- Sub Category ---------- */
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      { $unwind: "$subCategory" },

      /* ---------- Parent Category ---------- */
      {
        $lookup: {
          from: "categories",
          localField: "subCategory.parentId",
          foreignField: "_id",
          as: "parentCategory",
        },
      },
      { $unwind: "$parentCategory" },

      /* ---------- Parent Filter ---------- */
      ...(parentCategoryId
        ? [
            {
              $match: {
                "parentCategory._id": new ObjectId(parentCategoryId),
              },
            },
          ]
        : []),

      /* ======================
         LAST EFFECTIVE VARIANT PRICES
      ====================== */
      {
        $lookup: {
          from: "product_variants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productId", "$$productId"] },
                status: "active",
              },
            },
            {
              $project: {
                _id: 0,
                size: "$attributes.size",
                color: "$attributes.color",
                costPrice: 1,
                salePrice: 1,
              },
            },
          ],
          as: "variantPrices",
        },
      },

      /* ======================
         UNIFORM PRICE DETECTION
      ====================== */
      {
        $addFields: {
          isUniformLastPrice: {
            $cond: [
              // 🔑 MUST have more than 1 variant
              { $gt: [{ $size: "$variantPrices" }, 1] },
              {
                $eq: [
                  {
                    $size: {
                      $setUnion: [
                        {
                          $map: {
                            input: "$variantPrices",
                            as: "v",
                            in: {
                              cost: "$$v.costPrice",
                              sale: "$$v.salePrice",
                            },
                          },
                        },
                      ],
                    },
                  },
                  1,
                ],
              },
              false,
            ],
          },
        },
      },

      /* ======================
         SEARCH
      ====================== */
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { name: { $regex: search, $options: "i" } },
                  { brand: { $regex: search, $options: "i" } },
                  { productCode: { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      /* ======================
         FACET
      ====================== */
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                name: 1,
                brand: 1,
                productCode: 1,
                unit: 1,
                hasVariant: 1,
                sizeType: 1,
                sizeConfig: 1,
                colors: 1,

                variantPrices: 1,
                isUniformLastPrice: 1,

                category: {
                  parent: "$parentCategory.name",
                  sub: "$subCategory.name",
                },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    /* ======================
       EXECUTE
    ====================== */
    const result = await db
      .collection("products")
      .aggregate(pipeline)
      .toArray();

    const data = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    res.json({
      success: true,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data,
    });
  } catch (err) {
    next(err);
  }
};
