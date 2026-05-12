import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { getAll } from "../../../controllers/base.controller.js";
import { createExpense, getExpenseReport } from "./expense.controller.js";


const router = Router();

router.use(authenticate);


router.post(
  "/",
  createExpense,
);

router.get(
  "/",
  getAll({
    collection: "expenses",
    searchableFields: ["name", "code", "address"],
    filterableFields: ["status", "isMain"]
  })
);


router.get("/report", getExpenseReport);


export default router;
