import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { getCompanyInfo, updateCompanyInfo } from "./settings.controller.js";

const router = Router();

router.use(authenticate);


router.get("/company-info", getCompanyInfo);


router.put("/company-info/:id", updateCompanyInfo);

export default router;