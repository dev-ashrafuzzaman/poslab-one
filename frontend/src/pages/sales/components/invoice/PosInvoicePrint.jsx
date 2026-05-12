// src/pages/sales/components/invoice/PosInvoicePrint.jsx
import { QRCodeSVG } from "qrcode.react";

export default function PosInvoicePrint({ data }) {
  const { sale, customer, branch, items, summary, payments } = data;
console.log("posInvoiceCustomer:", customer)
console.log("posInvoiceData:", data)
  return (
    <div className="pos-receipt">
      <div className="header-center">
        <h1 className="brand">RICHWEAR</h1>
        <p className="meta">{branch.name}</p>
        <p className="meta">MO: {branch.phone}, {branch?.altPhone}</p>
        <p className="meta">{branch.address}</p>
      </div>

      <div className="divider" />
      <p className="center">
        <b>Invoice</b>
      </p>

      <div className="invoice-box">
        <div className="row">
          <span>Invoice</span>
          <span>{sale.invoiceNo}</span>
        </div>
        <div className="row">
          <span>Date</span>
          <span>{new Date(sale.date).toLocaleString("en-GB")}</span>
        </div>
      </div>

      <div className="divider" />

      <div className="row">
        <span>Customer Name</span>
        <span>{customer.name}</span>
      </div>

      <div className="row">
        <span>Customer Phone</span>
        <span>{customer.phone}</span>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Dis</th>
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
              <td>{i?.discount?.amount || 0}</td>
              <td>{i.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider" />

      <div className="row">
        <span>Sub Total</span>
        <span>{summary.subTotal}</span>
      </div>

      {summary.itemDiscount > 0 && (
        <div className="row">
          <span>Item Discount</span>
          <span>-{summary.itemDiscount}</span>
        </div>
      )}
      {summary.billDiscount > 0 && (
        <div className="row">
          <span>Bill Discount</span>
          <span>{summary.billDiscount}</span>
        </div>
      )}
      <div className="row grand">
        <span>Grand Total</span>
        <span>{summary.grandTotal} BDT</span>
      </div>

      <div className="divider" />

      <div>
        <p className="center">
          <b>Payment History</b>
        </p>
        <table className="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Ref</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((i, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{i.method}</td>
                <td>{i?.amount}</td>
                <td>{i.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divider" />

      <div className="qr-box">
        <QRCodeSVG value={sale.invoiceNo} size={90} />
      </div>
      <p className="center small">Return accepted within 7 days with invoice</p>
      <p className="center small">
        Thank you for shopping with us <br />
        Software by Softnext IT MO 01728664312
      </p>
    </div>
  );
}
