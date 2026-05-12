import { ObjectId } from "mongodb";
import { COLLECTIONS } from "../../database/collections.js";
import { getDB } from "../../config/db.js";

export const beforeCreateVariant = async (req, res, next) => {
  try {
    const db = getDB();
    const { productId, attributes } = req.body;

    const productObjectId = new ObjectId(productId);

    const product = await db.collection(COLLECTIONS.PRODUCTS).findOne({
      _id: productObjectId,
      status: "active"
    });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Invalid product"
      });
    }


    const exists = await db.collection(COLLECTIONS.VARIANTS).findOne({
      productId: productObjectId,
      "attributes.size": attributes.size,
      "attributes.color": attributes.color
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Variant already exists for this product"
      });
    }

    const variantSku = [
      product.sku,
      attributes.size.toUpperCase(),
      attributes.color.toUpperCase()
    ].join("-");

    req.generated = {
      productId: productObjectId,
      sku: variantSku
    };

    next();
  } catch (err) {
    next(err);
  }
};
