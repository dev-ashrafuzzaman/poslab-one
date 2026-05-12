import { Router } from "express";

import {
  createOne,
  getAll,
  getOneById,
  updateOne,
  deleteOne,
  toggleStatus,
  createOneTx
} from "../../controllers/base.controller.js";

import {
  createProductSchema,
  updateProductSchema
} from "./product.validation.js";

import { beforeCreateProduct } from "./product.hooks.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { COLLECTIONS } from "../../database/collections.js";
import { attachSession } from "../../middlewares/attachSession.js";
import { getProducts, getProductsForPurchase } from "./product.controller.js";

const router = Router();
const COLLECTION = COLLECTIONS.PRODUCTS;

router.use(authenticate);


// router.post(
//   "/",
//   permit(PERMISSIONS.PRODUCT_MANAGE),
//   beforeCreateProduct,
//   createOne({
//     collection: COLLECTION,
//     schema: createProductSchema
//   })
// );

router.post(
  "/",
  attachSession,
  beforeCreateProduct,
  createOneTx({
    collection: COLLECTION,
    schema: createProductSchema,
  })
);

// router.get(
//   "/",
//   permit(PERMISSIONS.PRODUCT_VIEW),
//   getAll({
//     collection: COLLECTION,
//     searchableFields: ["name", "sku", "brand"],
//     filterableFields: ["status", "categoryId"]
//   })
// );

router.get(
  "/",
  getProducts
);
router.get(
  "/purchase",
  getProductsForPurchase
);
router.get(
  "/types",
  getAll({
    collection: COLLECTIONS.PRODUCT_TYPES,
    searchableFields: ["name", "code"],
    filterableFields: ["status"]
  })
);

router.get(
  "/:id",
  getOneById({
    collection: COLLECTION
  })
);


router.put(
  "/:id",
  updateOne({
    collection: COLLECTION,
    schema: updateProductSchema
  })
);


router.post(
  "/:id/status",
  toggleStatus({
    collection: COLLECTION,
  })
);


router.delete(
  "/:id",
  deleteOne({
    collection: COLLECTION
  })
);

export default router;
