// components/barcode/BarcodeModal.jsx
import { useMemo, useState } from "react";
import Barcode from "react-barcode";
import Modal from "../modals/Modal";
import Button from "../ui/Button";

export default function BarcodeModal({ isOpen, setIsOpen, barcodes }) {
  /* ---------------- STATE ---------------- */
  const [selected, setSelected] = useState(() => barcodes.map(() => true));

  const selectedBarcodes = useMemo(
    () => barcodes.filter((_, i) => selected[i]),
    [barcodes, selected],
  );

  const allSelected = selected.every(Boolean);
  const noneSelected = selected.every((v) => !v);

  /* ---------------- HELPERS ---------------- */
  const shortColor = (color = "") =>
    color ? color.replace(/\s+/g, "").slice(0, 3).toUpperCase() : "";

  const toggleOne = (index) => {
    setSelected((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const selectAll = () => {
    setSelected(barcodes.map(() => true));
  };

  const unselectAll = () => {
    setSelected(barcodes.map(() => false));
  };

  /* ---------------- PRINT ---------------- */
  const handlePrint = () => {
    if (!selectedBarcodes.length) {
      alert("Please select at least one barcode to print.");
      return;
    }

    const win = window.open("", "_blank");

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Print Barcode</title>

  <style>
    @page { size: 38mm 25mm; margin: 0; }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      text-transform: uppercase;
    }

    .label {
      width: 38mm;
      height: 25mm;
      padding: 1.4mm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .brand {
      font-size: 8px;
      font-weight: 700;
      text-align: center;
    }

    .category {
      font-size: 7px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product {
      font-size: clamp(6px, 2.2vw, 7px);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .price {
      font-size: 10px;
      font-weight: 700;
      text-align: center;
    }

    .barcode {
      width: 100%;
      height: 60%;
      text-align: center;
    }

    .sku {
      font-size: 8px;
      text-align: center;
      margin-top: -3px;
      letter-spacing: 0.6px;
    }
  </style>
</head>

<body>
  ${selectedBarcodes
    .map((item) => {
      const cleanValue = (val) => {
    if (!val) return "";
    const v = String(val).trim().toLowerCase();
    if (["na", "n/a"].includes(v)) return "";
    return val;
  };

  const size = cleanValue(item.attribute?.size);
  const color = cleanValue(shortColor(item.attribute?.color));

  const variant =
    size && color
      ? `(${size}-${color})`
      : size
        ? `(${size})`
        : color
          ? `(${color})`
          : "";

      return `
      <div class="label">
        <div class="brand">RICHWEAR</div>

    <div class="category">
  ${item.subCategory || ""}
  ${
    variant && !["na", "n/a"].includes(variant.toLowerCase())
      ? ` -> ${variant}`
      : ""
  }
</div>


        <div class="product">${item.productName || ""}</div>

        <div class="price">PRICE: ${item.salesPrice} BDT</div>

        <div class="barcode">
          <svg id="bc-${item.sku}"></svg>
        </div>

        <div class="sku">${item.sku}</div>
      </div>
    `;
    })
    .join("")}

  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
  <script>
    ${selectedBarcodes
      .map(
        (item) => `
      JsBarcode("#bc-${item.sku}", "${item.sku}", {
        format: "CODE128",
        width: 1.4,
        height: 42,
        displayValue: false,
        margin: 0
      });
    `,
      )
      .join("\n")}
    window.onload = () => window.print();
  </script>
</body>
</html>
    `);

    win.document.close();
  };

  /* ---------------- UI ---------------- */
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="Barcode Preview"
      size="6xl"
      footer={<Button onClick={handlePrint}>Print Selected</Button>}
    >
      {/* 🔘 Bulk Actions */}
      <div className="flex gap-2 mb-4">
        <Button variant="ghost" disabled={allSelected} onClick={selectAll}>
          Select All
        </Button>
        <Button variant="ghost" disabled={noneSelected} onClick={unselectAll}>
          Unselect All
        </Button>
      </div>

      {/* 🔍 Preview */}
      <div className="grid grid-cols-5 gap-4">
        {barcodes.map((item, i) => {
          const size = item.attribute?.size || "";
          const color = shortColor(item.attribute?.color);

          const variant =
            size && color
              ? `(${size}-${color})`
              : size
                ? `(${size})`
                : color
                  ? `(${color})`
                  : "";

          return (
            <div
              key={i}
              onClick={() => toggleOne(i)}
              className={`border rounded p-2 cursor-pointer transition
                ${selected[i] ? "ring-2 ring-blue-500" : "opacity-40"}`}
              style={{ width: 190, height: 125 }}
            >
              <div className="flex justify-center gap-1 text-[10px] mb-1">
                <span className="font-bold">RICHWEAR</span>
                <input type="checkbox" checked={selected[i]} readOnly />
              </div>

              <div className="text-[10px] text-center truncate uppercase">
                {item.parentCategory}
                {item.parentCategory && item.subCategory && " → "}
                {item.subCategory} {variant}
              </div>

              <div className="text-[10px] text-center truncate uppercase">
                {item.productName}
              </div>

              <div className="text-[11px] font-semibold text-center">
                PRICE: {item.salesPrice} BDT
              </div>

              <Barcode
                value={item.sku}
                format="CODE128"
                height={42}
                width={1.4}
                displayValue={false}
              />

              <div className="text-[10px] text-center">{item.sku}</div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
