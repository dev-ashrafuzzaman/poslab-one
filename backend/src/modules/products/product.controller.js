//modules/products/product.controller.js
import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";
import { COLLECTIONS } from "../../database/collections.js";
import { generateProductCode } from "../../utils/sku/generateProductCode.js";
import { generateVariantSKU } from "../../utils/sku/generateVariantSKU.js";
import { GoogleGenAI } from "@google/genai";

/**
 * Clean & Build Variant Document Title
 * @param {string} productName
 * @param {object} variant
 * @returns {string}
 */

export const aiGenerateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Initial product name is required" });
    }

    const rawName = name.trim();

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(200)
        .json({ success: true, optimizedName: fallbackTitleCase(rawName) });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // 💡 এআই ইঞ্জিন প্রম্পট আপগ্রেড (ইন্টেলিজেন্ট ক্যাটালগ রুলস)
      const systemPrompt = `
        You are an expert catalog compliance officer for an enterprise ERP handling CCTV, IT Hardware, Mobile, and Electrical inventory assets.
        Your job is to polish, standardise, and convert messy or incomplete raw input text into a high-quality, professional product display name.

        Strict Formatting Execution Rules:
        1. Fix any spelling and casing mistakes instantly (e.g., "hikvision" -> "Hikvision", "surveylance" -> "Surveillance").
        2. Format should follow standard hierarchy: [Brand/Manufacturer] + [Model/Series/Capacity if typed] + [Technical Identifier/Specs] + [Standard Product Core Name].
        3. CRITICAL - If the input is too brief or generic (e.g., "Surveillance Internal Hard Drive"), DO NOT return it as it is. Re-architect it into a clean enterprise standard by polishing the keywords. For example, convert "Surveillance Internal Hard Drive" to "Premium Surveillance Internal Hard Disk Drive".
        4. Eliminate all informal gibberish words, unnecessary spaces, or promotional slangs like "best item", "low price", "100% genuine".
        5. Return ONLY the final formatted string text. Do NOT wrap in markdown quotes, backticks, and provide zero conversational explanation.
      `;

      // 💡 gemini-2.5-flash ব্যবহার করা সবচেয়ে বুদ্ধিমানের কাজ হবে
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemPrompt}\nRaw Input Name to Optimize: "${rawName}"`,
      });

      const optimizedName =
        aiResponse?.text?.trim().replace(/^"|"$/g, "") || rawName;

      return res.status(200).json({
        success: true,
        optimizedName: optimizedName,
      });
    } catch (aiError) {
      console.error(
        "🚨 AI Engine Quota/Error caught. Applying TitleCase Fallback...",
      );
      return res.status(200).json({
        success: true,
        optimizedName: fallbackTitleCase(rawName),
      });
    }
  } catch (error) {
    console.error("Fatal Product Controller Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server processing failure" });
  }
};

function fallbackTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const buildVariantTitle = (
  brandName,
  productName,
  modelName,
  variant,
  warrantyName = "",
) => {
  let title = "";
  const cleanBrand = brandName.trim();
  const cleanProduct = productName.trim();

  if (cleanProduct.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
    title = cleanProduct;
  } else {
    title = `${cleanBrand} ${variant && variant.attributeValue && variant.attributeValue.trim() ? `${variant.attributeValue.trim()} ` : ""}${cleanProduct}`;
  }
  return title;
};

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
      barcode: masterBarcode,
      model: masterModel,
      rackNo,
      description,
      warrantyId: masterWarrantyId,
      variants = [],
    } = payload;
    const idsToValidate = [productTypeId, categoryId, brandId, unitId];
    if (subCategoryId) idsToValidate.push(subCategoryId);
    if (masterWarrantyId) idsToValidate.push(masterWarrantyId);

    if (idsToValidate.some((id) => !ObjectId.isValid(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid MongoDB Object IDs format.",
      });
    }

    let transactionResult = null;

    await session.withTransaction(async () => {
      const productType = await db
        .collection(COLLECTIONS.PRODUCT_TYPES)
        .findOne(
          { _id: new ObjectId(productTypeId), status: "active" },
          { session },
        );
      if (!productType)
        throw new Error("Invalid or inactive product type reference");

      const brand = await db
        .collection(COLLECTIONS.BRANDS)
        .findOne({ _id: new ObjectId(brandId) }, { session });
      if (!brand) throw new Error("Referenced brand entity invalid");

      let masterWarrantyName = null;
      if (masterWarrantyId) {
        const mWarranty = await db
          .collection("warranties")
          .findOne({ _id: new ObjectId(masterWarrantyId) }, { session });
        masterWarrantyName = mWarranty ? mWarranty.name : null;
      }

      let productId = null;
      let productCode = null;

      const existingProduct = await db.collection(COLLECTIONS.PRODUCTS).findOne(
        {
          name: name.trim(),
          brandId: new ObjectId(brandId),
          categoryId: new ObjectId(categoryId),
        },
        { session },
      );

      if (existingProduct) {
        productId = existingProduct._id;
        productCode = existingProduct.productCode;

        if (variants.length > 0) {
          const freshValues = variants.map((v) => v.attributeValue);
          await db.collection(COLLECTIONS.PRODUCTS).updateOne(
            { _id: productId },
            {
              $addToSet: { "variantSchema.0.values": { $each: freshValues } },
              $set: { updatedAt: new Date() },
            },
            { session },
          );
        }
      } else {
        productCode = await generateProductCode({
          db,
          productTypeCode: productType.code,
          session,
        });

        const now = new Date();

        const uniqueSpecsArray = [
          ...new Set(
            variants.map((v) => v.attributeValue?.trim()).filter(Boolean),
          ),
        ];

        const productDoc = {
          name: name.trim(),
          slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
          productCode,
          productTypeId: new ObjectId(productTypeId),
          categoryId: new ObjectId(categoryId),
          subCategoryId: subCategoryId ? new ObjectId(subCategoryId) : null,
          brandId: new ObjectId(brandId),
          unitId: new ObjectId(unitId),
          barcode: masterBarcode?.trim() || null,
          model: masterModel?.trim() || null,
          rackNo: rackNo?.trim() || null,
          description: description?.trim() || null,
          warrantyId: masterWarrantyId ? new ObjectId(masterWarrantyId) : null,
          warrantyName: masterWarrantyName,

          variantSchema:
            variants.length > 0
              ? [{ name: "Specification", values: uniqueSpecsArray }]
              : [],
          hasVariants: variants.length > 0,
          status: "active",
          createdAt: now,
          updatedAt: now,
        };

        const productInsertion = await db
          .collection(COLLECTIONS.PRODUCTS)
          .insertOne(productDoc, { session });
        productId = productInsertion.insertedId;
      }

      const variantDocs = [];
      const now = new Date();

      if (variants.length > 0) {
        for (const variant of variants) {
          const finalBarcode =
            variant.barcode?.trim() || masterBarcode?.trim() || null;
          const finalModel =
            variant.model?.trim() || masterModel?.trim() || null;

          let currentVariantWarrantyId = null;
          let currentVariantWarrantyName = masterWarrantyName;

          if (variant.warrantyId && ObjectId.isValid(variant.warrantyId)) {
            currentVariantWarrantyId = new ObjectId(variant.warrantyId);
            const vWarranty = await db
              .collection("warranties")
              .findOne({ _id: currentVariantWarrantyId }, { session });
            if (vWarranty) currentVariantWarrantyName = vWarranty.name;
          } else if (masterWarrantyId) {
            currentVariantWarrantyId = new ObjectId(masterWarrantyId);
          }

          const variantTitle = buildVariantTitle(
            brand.name,
            name,
            finalModel,
            variant,
            currentVariantWarrantyName,
          );

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
            title: variantTitle,
            attributes: {
              attributeName: variant.attributeName?.trim() || "Specification",
              attributeValue: variant.attributeValue?.trim() || "",
            },
            barcode: finalBarcode,
            model: finalModel,
            warrantyId: currentVariantWarrantyId,
            warrantyName: currentVariantWarrantyName,
            purchasePrice: 0,
            salePrice: 0,
            stock: 0,
            status: "active",
            createdAt: now,
            updatedAt: now,
          });
        }
      } else if (!existingProduct) {
        const baseTitle = buildVariantTitle(
          brand.name,
          name,
          masterModel,
          null,
          masterWarrantyName,
        );
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
          title: `${baseTitle}`,
          attributes: { attributeName: "Default", attributeValue: "Base" },
          barcode: masterBarcode?.trim() || null,
          model: masterModel?.trim() || null,
          warrantyId: masterWarrantyId ? new ObjectId(masterWarrantyId) : null,
          warrantyName: masterWarrantyName,
          purchasePrice: 0,
          salePrice: 0,
          stock: 0,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
      }

      if (variantDocs.length > 0) {
        await db
          .collection(COLLECTIONS.VARIANTS)
          .insertMany(variantDocs, { session });
      }

      transactionResult = {
        productId,
        productCode,
        totalVariantsCommit: variantDocs.length,
        logState: existingProduct ? "APPEND_SUCCESS" : "INIT_SUCCESS",
      };
    });

    return res.status(201).json({
      success: true,
      message: "ERP Product Matrix data allocated successfully.",
      data: transactionResult,
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
    const { search, status } = req.query;

    /* ---------------- Match Builder ---------------- */
    // 💡 ডিফল্টভাবে ফাঁকা অবজেক্ট রাখা হলো যেন সব স্ট্যাটাসের ডাটা আসে
    const match = {};

    // 💡 ইউজার যদি নির্দিষ্ট কোনো স্ট্যাটাস কোয়েরি করে পাঠায়, তবেই কেবল ফিল্টার লক হবে
    if (status) {
      match.status = status;
    }

    const pipeline = [
      // Step 1: Core Indexed Filter (স্ট্যাটাস ডাইনামিক ফিল্টার)
      { $match: match },

      /* 🔍 Search Layer */
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { name: { $regex: search, $options: "i" } },
                  { productCode: { $regex: search, $options: "i" } },
                  { model: { $regex: search, $options: "i" } },
                  { barcode: { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      /* 🔗 Lookup Parent Category */
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "parentCategoryDoc",
        },
      },
      {
        $unwind: {
          path: "$parentCategoryDoc",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* 🔗 Lookup Sub Category */
      {
        $lookup: {
          from: "categories",
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subCategoryDoc",
        },
      },
      {
        $unwind: { path: "$subCategoryDoc", preserveNullAndEmptyArrays: true },
      },

      /* 🔗 Lookup Units Master */
      {
        $lookup: {
          from: "units",
          localField: "unitId",
          foreignField: "_id",
          as: "unitDoc",
        },
      },
      { $unwind: { path: "$unitDoc", preserveNullAndEmptyArrays: true } },

      /* 🔗 Lookup Brand Master */
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandDoc",
        },
      },
      { $unwind: { path: "$brandDoc", preserveNullAndEmptyArrays: true } },

      /* 🔗 Lookup Product Types */
      {
        $lookup: {
          from: "product_types",
          localField: "productTypeId",
          foreignField: "_id",
          as: "productTypeDoc",
        },
      },
      {
        $unwind: { path: "$productTypeDoc", preserveNullAndEmptyArrays: true },
      },

      /* ↕ Sorting (Latest products first) */
      { $sort: { createdAt: -1 } },

      /* 📄 Facet Node Segmentation for Pagination */
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                productCode: 1,
                name: 1,
                unit: { $ifNull: ["$unitDoc.name", "Pcs"] },
                brandName: "$brandDoc.name",
                productTypeName: { $ifNull: ["$productTypeDoc.name", "N/A"] },
                status: 1,
                createdAt: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                category: {
                  parent: "$parentCategoryDoc.name",
                  sub: "$subCategoryDoc.name",
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

    const data = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    return res.status(200).json({
      success: true,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsForPurchase = async (req, res, next) => {
  try {
    const db = getDB();

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const { search, categoryId, parentCategoryId } = req.query;

    const match = { status: "active" };
    if (categoryId) match.categoryId = new ObjectId(categoryId);

    const pipeline = [
      { $match: match },

      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      { $unwind: "$subCategory" },

      {
        $lookup: {
          from: "categories",
          localField: "subCategory.parentId",
          foreignField: "_id",
          as: "parentCategory",
        },
      },
      { $unwind: "$parentCategory" },

      ...(parentCategoryId
        ? [
            {
              $match: {
                "parentCategory._id": new ObjectId(parentCategoryId),
              },
            },
          ]
        : []),

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

      {
        $addFields: {
          isUniformLastPrice: {
            $cond: [
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
