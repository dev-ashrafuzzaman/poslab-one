// printInvoice.js
export const printInvoice = (html) => {
  const win = window.open("", "_blank");
  
  // Get the current styles
  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules || [])
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return '';
      }
    })
    .join('\n');

  win.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          ${styles}
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            margin: 0;
            padding: 20px;
            background: white;
            font-family: Arial, sans-serif;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 210mm; margin: 0 auto;">
          ${html}
        </div>
        <script>
          window.onload = function () {
            // Give time for styles to load
            setTimeout(() => {
              window.print();
              setTimeout(() => {
                window.close();
              }, 100);
            }, 100);
          };
        </script>
      </body>
    </html>
  `);

  win.document.close();
};