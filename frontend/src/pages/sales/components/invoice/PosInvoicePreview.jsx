// src/pages/sales/components/invoice/PosInvoicePreview.jsx
export default function PosInvoicePreview({ data }) {
  const { sale, branch, customer, items, summary } = data;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-extrabold text-center">RICHWEAR</h1>
      <p className="text-center text-sm">Jhikargachha Outlet</p>

      <hr className="my-4" />

      <p><b>Invoice:</b> {sale.invoiceNo}</p>
      <p><b>Date:</b> {new Date(sale.date).toLocaleString()}</p>

      <hr className="my-4" />

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{i.sku}</td>
              <td>{i.qty}</td>
              <td>{i.unitPrice}</td>
              <td>{i.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="my-4" />

      <div className="flex justify-between font-bold">
        <span>Grand Total</span>
        <span>{summary.grandTotal} BDT</span>
      </div>
    </div>
  );
}
