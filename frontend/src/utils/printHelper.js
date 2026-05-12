export function printHtml({
  title = "Print",
  content,
  pageSize = "A4",
  margin = "20mm",
  styles = "",
}) {
  const printWindow = window.open("", "_blank", "width=900,height=650");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>

        <style>
          @page {
            size: ${pageSize};
            margin: ${margin};
          }

          body {
            font-family: Arial, sans-serif;
            background: white;
            color: black;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th, td {
            border: 1px solid #333;
            padding: 6px;
          }

          th {
            background: #f2f2f2;
            text-align: left;
          }

          .text-right {
            text-align: right;
          }

          .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }

          .signature div {
            width: 30%;
            text-align: center;
            border-top: 1px solid #333;
            padding-top: 6px;
          }

          ${styles}
        </style>
      </head>

      <body onload="window.print(); window.close();">
        ${content}
      </body>
    </html>
  `);

  printWindow.document.close();
}
