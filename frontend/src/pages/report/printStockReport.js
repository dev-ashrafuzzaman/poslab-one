export function printStockReport({
  title = "Stock Report",
  filters = {},
  columns = [],
  rows = [],
}) {
  const win = window.open("about:blank", "_blank");

  if (!win) return;

  const today = new Date().toLocaleDateString("en-GB");

  /* ===============================
     BUILD TABLE HEADER
  =============================== */
  const thead = `
    <tr>
      ${columns
        .map(
          (c) => `
        <th>${c.label}</th>
      `,
        )
        .join("")}
    </tr>
  `;

  /* ===============================
     BUILD TABLE BODY
  =============================== */
  const tbody = rows
    .map(
      (row) => `
    <tr>
      ${columns
        .map(
          (c) => `
        <td>${row[c.key] ?? "-"}</td>
      `,
        )
        .join("")}
    </tr>
  `,
    )
    .join("");

  /* ===============================
     FILTER SUMMARY
  =============================== */
  const filterHtml = Object.entries(filters)
    .filter(([, v]) => v)
    .map(
      ([k, v]) => `
      <div class="filter-item">
        <strong>${k}:</strong> ${v}
      </div>
    `,
    )
    .join("");

  /* ===============================
     HTML TEMPLATE
  =============================== */
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>

  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #000;
      font-size: 11px;
    }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #000;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .company {
      font-size: 18px;
      font-weight: bold;
    }

    .meta {
      text-align: right;
      font-size: 10px;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 10px;
      font-size: 10px;
    }

    .filter-item {
      white-space: nowrap;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead th {
      border: 1px solid #000;
      background: #f2f2f2;
      padding: 6px;
      text-align: left;
      font-size: 10px;
    }

    tbody td {
      border: 1px solid #000;
      padding: 5px;
      font-size: 10px;
    }

    tbody tr:nth-child(even) {
      background: #fafafa;
    }

    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 9px;
      border-top: 1px solid #000;
      padding-top: 4px;
    }

    .page-number:after {
      content: counter(page);
    }
  </style>
</head>

<body>
  <!-- HEADER -->
  <div class="report-header">
    <div class="company">
      RICHWEAR
      <div style="font-size:11px;font-weight:normal">
        ${title}
      </div>
    </div>

    <div class="meta">
      <div>Date: ${today}</div>
      <div>Printed By: System</div>
    </div>
  </div>

  <!-- FILTERS -->
  <div class="filters">
    ${filterHtml || "<div>No filters applied</div>"}
  </div>

  <!-- TABLE -->
  <table>
    <thead>${thead}</thead>
    <tbody>${tbody}</tbody>
  </table>

  <!-- FOOTER -->
  <div class="footer">
    Page <span class="page-number"></span>
  </div>

  <script>
    window.onload = () => {
      window.print();
      window.onafterprint = () => window.close();
    };
  </script>
</body>
</html>
`);

  win.document.close();
}
