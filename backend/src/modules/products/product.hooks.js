import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";
import { generateProductCode } from "../../utils/sku/generateProductCode.js";
import { getDB } from "../../config/db.js";

export const beforeCreateProduct = async (req, res, next) => {
  try {
    const db = getDB();
    const session = req.session;

    const { name, categoryId, level1Id, productTypeId, sizeType, sizeConfig } =
      req.body;

    /* =====================
       OBJECT ID VALIDATION
    ====================== */
    if (!ObjectId.isValid(categoryId) || !ObjectId.isValid(productTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId or productTypeId",
      });
    }

    const categoryObjectId = new ObjectId(categoryId);
    const productTypeObjectId = new ObjectId(productTypeId);

    /* =====================
       CATEGORY VALIDATION
    ====================== */
    const category = await db
      .collection(COLLECTIONS.CATEGORIES)
      .findOne({ _id: categoryObjectId, status: "active" }, { session });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category",
      });
    }

    /* =====================
       PRODUCT TYPE VALIDATION
    ====================== */
    const productType = await db
      .collection(COLLECTIONS.PRODUCT_TYPES)
      .findOne({ _id: productTypeObjectId, status: "active" }, { session });

    if (!productType) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive product type",
      });
    }

    /* =====================
       DUPLICATE CHECK (SESSION)
    ====================== */
    const exists = await db.collection(COLLECTIONS.PRODUCTS).findOne(
      {
        name: name.trim(),
        categoryId: categoryObjectId,
        productTypeId: productTypeObjectId,
      },
      { session },
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    /* =====================
       SIZE HANDLING
    ====================== */
    let finalSizeConfig = null;
    let hasVariant = false;

    if (sizeType === "TEXT") {
      if (!productType.defaultSizes?.length) {
        return res.status(400).json({
          success: false,
          message: "TEXT sizeType requires defaultSizes",
        });
      }

      finalSizeConfig = {
        values: productType.defaultSizes,
      };
      hasVariant = true;
    }

    if (sizeType === "NUMBER") {
      if (!sizeConfig?.min || !sizeConfig?.max) {
        return res.status(400).json({
          success: false,
          message: "NUMBER sizeType requires min & max",
        });
      }

      finalSizeConfig = {
        min: sizeConfig.min,
        max: sizeConfig.max,
        step: sizeConfig.step || 1,
      };
      hasVariant = true;
    }

    /* =====================
       PRODUCT CODE (TX SAFE)
    ====================== */
    const productCode = await generateProductCode({
      db,
      productTypeCode: productType.code,
      session,
    });

    /* =====================
       ATTACH GENERATED
    ====================== */
    req.generated = {
      categoryId: categoryObjectId,
      productTypeId: productTypeObjectId,
      productCode,
      categoryPath: [new ObjectId(level1Id), categoryObjectId],
      sizeType,
      sizeConfig: finalSizeConfig,
      hasVariant,
    };

    delete req.body.sizeConfig;

    next();
  } catch (err) {
    next(err);
  }
};
