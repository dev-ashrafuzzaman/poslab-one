import "./invoice.css";

export default function PurchaseInvoiceTemplate({ invoice }) {
  return (
    <div className="invoice-page">
      {/* HEADER */}
      <div className="invoice-header">
        <div>
          <h1>PURCHASE INVOICE</h1>
          <p className="muted">{invoice.purchaseNo}</p>
        </div>

        <div className="right">
          <strong>{invoice.branch.name}</strong>
          <p>{invoice.branch.address}</p>
        </div>
      </div>

      <hr />

      {/* META */}
      <div className="invoice-meta">
        <div>
          <h4>Supplier</h4>
          <p className="bold">{invoice.supplier.name}</p>
          <p>{invoice.supplier.address}</p>
          <p>Phone: {invoice.supplier.contact.phone}</p>
        </div>

        <div className="meta-box">
          <div><span>Invoice No</span><strong>{invoice.invoiceNumber}</strong></div>
          <div><span>Invoice Date</span><strong>{invoice.invoiceDate.slice(0,10)}</strong></div>
        </div>
      </div>

      {/* ITEMS */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item Description</th>
            <th className="center">Qty</th>
            <th className="right">Unit Cost</th>
            <th className="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((i, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>
                <div className="bold">{i.productName}</div>
                <div className="muted">
                  SKU: {i.sku} | {i.attributes?.size} / {i.attributes?.color}
                </div>
              </td>
              <td className="center">{i.qty}</td>
              <td className="right">{i.costPrice}</td>
              <td className="right">{i.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FOOTER */}
      <div className="invoice-footer">
        <div className="notes">
          <strong>Notes</strong>
          <p>{invoice.notes || "—"}</p>
        </div>

        <div className="summary">
          <div><span>Total Quantity</span><strong>{invoice.totalQty}</strong></div>
          <div><span>Total Amount</span><strong>{invoice.totalAmount}</strong></div>
          <div><span>Paid</span><strong>{invoice.paidAmount}</strong></div>
          <div className="due"><span>Due</span><strong>{invoice.dueAmount}</strong></div>
        </div>
      </div>

      <p className="system-note">
        This is a system generated purchase invoice.
      </p>
    </div>
  );
}
