import { generateSalesReportEnterprise } from "./salesReport.service.js";

export async function salesReportController(req, res, next) {
  try {
    const result = await generateSalesReportEnterprise({
      user: req.user,
      filters: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Sales report generated successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
