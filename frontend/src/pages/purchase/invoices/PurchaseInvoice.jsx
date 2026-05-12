import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../../hooks/useApi";
import PurchaseInvoiceTemplate from "../../invoices/purchases/PurchaseInvoiceTemplate";
import { printInvoice } from "../../invoices/purchases/printInvoice";

const PurchaseInvoice = () => {
  const { id } = useParams();
  const { request } = useApi();
  const printRef = useRef();

  const [invoice, setInvoice] = useState(null);
  console.log("in", invoice);
  /* ---------------- FETCH INVOICE ---------------- */
  useEffect(() => {
    request(`/purchases/${id}/`, "GET").then((res) => {
      setInvoice(res?.data);
    });
  }, [id]);

  if (!invoice) return <p>Loading invoice...</p>;

  /* ---------------- PRINT ---------------- */
  const handlePrint = () => {
    const invoiceElement = printRef.current;
    const clonedElement = invoiceElement.cloneNode(true);
    const buttons = clonedElement.querySelectorAll(".print\\:hidden, button");
    buttons.forEach((btn) => btn.remove());

    printInvoice(clonedElement.outerHTML);
  };
  /* ---------------- DOWNLOAD PDF ---------------- */
  const handleDownload = () => {
    const opt = {
      margin: 10,
      filename: `${invoice.purchaseNo}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(printRef.current).set(opt).save();
  };

  return (
    <div className="p-6 space-y-4">
      {/* Actions */}
      {/* <div className="flex justify-end gap-3 print:hidden">
        <button onClick={handlePrint} className="px-4 btn btn-gradient">
          Print
        </button>
   
      </div> */}

      {/* INVOICE */}
      <div
        ref={printRef}
        className="bg-white p-8 rounded-md text-sm max-w-[210mm] mx-auto"
      >
        <PurchaseInvoiceTemplate invoice={invoice} />
      </div>
    </div>
  );
};

export default PurchaseInvoice;
