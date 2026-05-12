import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../../../components/common/Page";
import Button from "../../../components/ui/Button";
import useApi from "../../../hooks/useApi";
import {
  Printer,
  Download,
  FileText,
  Building,
  User,
  Calendar,
} from "lucide-react";

const AuditReportPage = () => {
  const { auditId } = useParams();
  const { request } = useApi();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request(`/audits/${auditId}/report`, "GET", {}, { useToast: false })
      .then((data) => setReportData(data))
      .finally(() => setLoading(false));
  }, [auditId, request]);

  const openPrintWindow = () => {
    const win = window.open("about:blank", "_blank");

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stock Audit Report - ${reportData.audit.auditNo}</title>
          <meta charset="utf-8">
          <style>
            /* A4 Page Setup */
            @page {
              size: A4;
              margin: 0mm;
            }
            
            @media print {
              body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              line-height: 1.4;
              color: #000;
              background: #fff;
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 0mm;
              font-size: 11pt;
            }
            
            /* Company Header */
            .company-header {
              text-align: center;
              border-bottom: 2px solid #000;
            }
            
            .company-name {
              font-size: 24pt;
              font-weight: bold;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            
            .company-location {
              font-size: 11pt;
              color: #333;
              margin-bottom: 3mm;
            }
            
            .report-title {
              font-size: 18pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            /* Audit Info Table */
            .audit-info-table {
              width: 100%;
              border-collapse: collapse;
              margin: 8mm 0;
              font-size: 10pt;
            }
            
            .audit-info-table th,
            .audit-info-table td {
              border: 1px solid #000;
              padding: 3mm 4mm;
              vertical-align: top;
              text-align: left;
            }
            
            .audit-info-table th {
              background: #f5f5f5;
              font-weight: bold;
              width: 30%;
            }
            
            .audit-info-table td {
              width: 70%;
            }
            
            /* Items Table */
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 8mm 0;
              font-size: 9pt;
              page-break-inside: avoid;
            }
            
            .items-table th {
              border: 1px solid #000;
              padding: 2.5mm 3mm;
              background: #f5f5f5;
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
            }
            
            .items-table td {
              border: 1px solid #000;
              padding: 2mm 3mm;
              text-align: center;
              vertical-align: middle;
            }
            
            .items-table .text-left {
              text-align: left;
            }
            
            .items-table .text-right {
              text-align: right;
            }
            
            /* Numeric formatting */
            .numeric {
              font-family: 'Courier New', monospace;
            }
            
            /* Status indicators */
            .status-match {
              background: #f0f0f0;
              padding: 1mm 3mm;
              border-radius: 1mm;
              font-weight: bold;
            }
            
            .status-variance {
              background: #f0f0f0;
              padding: 1mm 3mm;
              border-radius: 1mm;
              font-weight: bold;
            }
            
            /* Summary Section */
            .summary-section {
              margin-top: 10mm;
              page-break-inside: avoid;
            }
            
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4mm;
            }
            
            .summary-table th,
            .summary-table td {
              border: 1px solid #000;
              padding: 3mm 4mm;
              text-align: center;
            }
            
            .summary-table th {
              background: #f5f5f5;
              font-weight: bold;
            }
            
            .summary-table .total-row {
              font-weight: bold;
              background: #e8e8e8;
            }
            
            /* Footer */
            .footer-section {
              margin-top: 15mm;
              page-break-inside: avoid;
            }
            
            .signature-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8mm;
            }
            
            .signature-table td {
              text-align: center;
              padding: 5mm 0;
              width: 33.33%;
            }
            
            .signature-line {
              width: 60mm;
              height: 1px;
              background: #000;
              margin: 8mm auto 3mm;
            }
            
            .signature-label {
              font-size: 10pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .signature-name {
              font-size: 10pt;
              margin-top: 2mm;
            }
            
            .signature-date {
              font-size: 9pt;
              color: #666;
              margin-top: 1mm;
            }
            
            /* Page numbering */
            .page-number {
              position: fixed;
              bottom: 10mm;
              right: 20mm;
              font-size: 9pt;
              color: #666;
            }
            
            /* Utility classes */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-bold { font-weight: bold; }
            .mb-2 { margin-bottom: 2mm; }
            .mt-2 { margin-top: 2mm; }
            .mt-4 { margin-top: 4mm; }
            .mt-6 { margin-top: 6mm; }
            
            /* Print-specific styles */
            @media print {
              body {
                padding: 15mm;
              }
              
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <!-- Company Header -->
          <div class="company-header">
            <div class="company-name">RICHWEAR</div>
            <div class="report-title">Stock Audit Report</div>
          </div>
          
          <!-- Audit Information Table -->
          <table class="audit-info-table">
            <tr>
              <th>Audit Number</th>
              <td class="text-bold">#${reportData.audit.auditNo}</td>
            </tr>
            <tr>
              <th>Audit Status</th>
              <td>${reportData.audit.status.replace("_", " ")}</td>
            </tr>
            <tr>
              <th>Branch Information</th>
              <td>
                ${reportData.branch?.code || "N/A"} - ${reportData.branch?.name || "N/A"}<br>
                ${reportData.branch?.address || ""}
              </td>
            </tr>
            <tr>
              <th>Auditor</th>
              <td>${reportData.auditor?.name || "N/A"}</td>
            </tr>
            <tr>
              <th>Audit Period</th>
              <td>
                Started: ${new Date(reportData.audit.startedAt).toLocaleDateString()} ${new Date(reportData.audit.startedAt).toLocaleTimeString()}<br>
                ${
                  reportData.audit.submittedAt
                    ? `Submitted: ${new Date(reportData.audit.submittedAt).toLocaleDateString()} ${new Date(reportData.audit.submittedAt).toLocaleTimeString()}`
                    : "Status: Ongoing"
                }
              </td>
            </tr>
            <tr>
              <th>Report Generated</th>
              <td>${new Date(reportData.generatedAt).toLocaleString()}</td>
            </tr>
          </table>
          
          <!-- Items Table -->
          <div class="mt-6">
            <div class="text-center text-bold mb-2">AUDIT ITEMS DETAILS</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th rowspan="2">SL</th>
                  <th colspan="2">Product Information</th>
                  <th colspan="2">Quantity</th>
                  <th colspan="3">Audit Results</th>
                </tr>
                <tr>
                  <th>Product Name</th>
                  <th>SKU Code</th>
                  <th>System Qty</th>
                  <th>Audit Qty</th>
                  <th>Variance Qty</th>
                  <th>Status</th>
                  <th>Value Impact</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.items
                  .map(
                    (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td class="text-left">${item.productName}</td>
                    <td class="text-bold">${item.sku}</td>
                    <td class="text-right numeric">${item.systemQty}</td>
                    <td class="text-right numeric">${item.auditQty}</td>
                    <td class="text-right numeric ${item.differenceQty !== 0 ? "text-bold" : ""}">
                      ${item.differenceQty > 0 ? "+" : ""}${item.differenceQty}
                    </td>
                    <td>
                      <span class="${item.differenceQty === 0 ? "status-match" : "status-variance"}">
                        ${item.differenceQty === 0 ? "MATCH" : "VARIANCE"}
                      </span>
                    </td>
                    <td class="text-right numeric">
                      ${item.differenceValue >= 0 ? "+" : "-"}${Math.abs(item.differenceValue).toFixed(2)}
                    </td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <!-- Summary Section -->
          <div class="summary-section">
            <div class="text-center text-bold mb-2">AUDIT SUMMARY</div>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Percentage</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total System Quantity</td>
                  <td class="numeric">${reportData.audit.totals?.systemQty || 0}</td>
                  <td>100%</td>
                  <td class="numeric">-</td>
                </tr>
                <tr>
                  <td>Total Audit Quantity</td>
                  <td class="numeric">${reportData.audit.totals?.auditQty || 0}</td>
                  <td class="numeric">
                    ${
                      reportData.audit.totals?.systemQty
                        ? (
                            (reportData.audit.totals?.auditQty /
                              reportData.audit.totals?.systemQty) *
                            100
                          ).toFixed(1)
                        : 0
                    }%
                  </td>
                  <td class="numeric">-</td>
                </tr>
                <tr class="total-row">
                  <td>Total Variance</td>
                  <td class="numeric">${Math.abs(reportData.audit.totals?.varianceQty || 0)}</td>
                  <td class="numeric">
                    ${
                      reportData.audit.totals?.systemQty
                        ? (
                            (Math.abs(reportData.audit.totals?.varianceQty) /
                              reportData.audit.totals?.systemQty) *
                            100
                          ).toFixed(1)
                        : 0
                    }%
                  </td>
                  <td class="numeric">
                    ${reportData.audit.totals?.varianceValue >= 0 ? "+" : "-"}${Math.abs(reportData.audit.totals?.varianceValue || 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td>Perfect Matches</td>
                  <td class="numeric">${reportData.items.filter((i) => i.differenceQty === 0).length}</td>
                  <td class="numeric">
                    ${((reportData.items.filter((i) => i.differenceQty === 0).length / reportData.items.length) * 100).toFixed(1)}%
                  </td>
                  <td class="numeric">-</td>
                </tr>
                <tr>
                  <td>Items with Variance</td>
                  <td class="numeric">${reportData.items.filter((i) => i.differenceQty !== 0).length}</td>
                  <td class="numeric">
                    ${((reportData.items.filter((i) => i.differenceQty !== 0).length / reportData.items.length) * 100).toFixed(1)}%
                  </td>
                  <td class="numeric">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Footer with Signatures -->
          <div class="footer-section">
            <table class="signature-table">
              <tr>
                <td>
                  <div class="signature-line"></div>
                  <div class="signature-label">Auditor Signature</div>
                  <div class="signature-date">Date: ${new Date().toLocaleDateString()}</div>
                </td>
                <td>
                  <div class="signature-line"></div>
                  <div class="signature-label">Branch Manager</div>
                  <div class="signature-name"></div>
                  <div class="signature-date">Date: _____________</div>
                </td>
                <td>
                  <div class="signature-line"></div>
                  <div class="signature-label">Finance Department</div>
                  <div class="signature-name"></div>
                  <div class="signature-date">Date: _____________</div>
                </td>
              </tr>
            </table>
            
            <div class="text-center mt-6">
              <div class="text-bold">END OF REPORT</div>
              <div class="mt-2" style="font-size: 8pt; color: #666;">
                This is a computer generated report. No physical signature is required for digital verification.
              </div>
            </div>
          </div>
          
        </body>
      </html>
    `);

    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      // Optional: auto close after print dialog
      // win.onafterprint = function() {
      //   win.close();
      // };
    }, 1000);
  };

  const downloadPDF = () => {
    // Implement PDF download functionality here
    // Could use libraries like jsPDF or generate PDF on backend
    alert("PDF download feature will be implemented soon!");
  };

  if (loading) {
    return (
      <Page title="Audit Report">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      </Page>
    );
  }

  return (
    <Page title={"Audit Report Print"}>
      <div className="flex items-center justify-between my-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Audit Report #{reportData.audit.auditNo}
            </h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Building className="w-4 h-4" />
              {reportData.branch?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={downloadPDF}
            icon={<Download className="w-4 h-4" />}
            className="border-gray-300 hover:border-gray-600"
          >
            Download PDF
          </Button>
          <Button
            variant="gradient"
            onClick={openPrintWindow}
            icon={<Printer className="w-4 h-4" />}
            className="shadow-md hover:shadow-lg"
            gradientFrom="from-gray-700"
            gradientTo="to-gray-900"
          >
            Print Report
          </Button>
        </div>
      </div>
      {/* Report Preview Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Report Preview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Click "Print Report" for A4 formatted document
          </p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Report Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Total Items</div>
                <div className="text-2xl font-bold text-gray-900">
                  {reportData.items.length}
                </div>
              </div>
              <div className="border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Perfect Matches</div>
                <div className="text-2xl font-bold text-green-700">
                  {reportData.items.filter((i) => i.differenceQty === 0).length}
                </div>
              </div>
              <div className="border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Value Variance</div>
                <div className="text-2xl font-bold text-red-700">
                 
                  {Math.abs(
                    reportData.audit.totals?.varianceValue || 0,
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Audit Information
            </h3>
            <div className="border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Audit Number</div>
                  <div className="font-semibold">
                    #{reportData.audit.auditNo}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-semibold">
                    {reportData.audit.status.replace("_", " ")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Auditor</div>
                  <div className="font-semibold">
                    {reportData.auditor?.name || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Generated</div>
                  <div className="font-semibold">
                    {new Date(reportData.generatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Sample Items (First 5)
            </h3>
            <div className="overflow-x-auto border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Audit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.items.slice(0, 5).map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.systemQty}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {item.auditQty}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`font-semibold ${item.differenceQty === 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {item.differenceQty > 0 ? "+" : ""}
                          {item.differenceQty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 p-4 border border-gray-200 rounded bg-gray-50">
            <p className="font-semibold mb-1">
              Ready to Print Professional Report
            </p>
            <p>
              The print version includes all {reportData.items.length} items in
              A4 format with proper signatures.
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default AuditReportPage;
