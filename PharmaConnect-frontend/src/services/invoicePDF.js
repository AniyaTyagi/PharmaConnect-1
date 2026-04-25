import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function downloadInvoicePDF(inv, seller = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 40;

  // ── HEADER ──────────────────────────────────────────────────────────────
  // Brand name (left)
  doc.setFontSize(18).setFont("helvetica", "bold").setTextColor(30, 80, 160);
  doc.text("PharmaConnect", margin, 50);
  doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(100);
  doc.text("B2B Healthcare Supply Chain Platform", margin, 63);

  // "Invoice" title (center)
  doc.setFontSize(22).setFont("helvetica", "bold").setTextColor(30);
  doc.text("Invoice", W / 2, 90, { align: "center" });

  // Divider
  doc.setDrawColor(200).setLineWidth(0.5).line(margin, 105, W - margin, 105);

  // ── INVOICE META (top-right) ─────────────────────────────────────────────
  const invoiceNo = `PC-INV-${String(inv.id).slice(-8)}`;
  const orderNo   = `PC-ORD-${String(inv.orderId).slice(-8)}`;
  const dateStr   = new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(60);
  const metaX = W - margin;
  doc.text(`Invoice No: ${invoiceNo}`,   metaX, 120, { align: "right" });
  doc.text(`Invoice Date: ${dateStr}`,   metaX, 133, { align: "right" });
  doc.text(`Order No: ${orderNo}`,       metaX, 150, { align: "right" });

  // ── SELLER DETAILS (left) ────────────────────────────────────────────────
  let y = 120;
  doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(30);
  doc.text("SELLER DETAILS:", margin, y);
  doc.setFont("helvetica", "bold");
  doc.text(seller.company || seller.name || "PharmaConnect Seller", margin, y + 13);
  doc.setFont("helvetica", "normal").setTextColor(60);
  if (seller.address) doc.text(`Address: ${seller.address}`, margin, y + 26);
  if (seller.email)   doc.text(`Email: ${seller.email}`,     margin, y + 39);
  if (seller.phone)   doc.text(`Contact: ${seller.phone}`,   margin, y + 52);
  if (seller.gstin)   doc.text(`GSTIN: ${seller.gstin}`,     margin, y + 65);

  // ── DIVIDER ──────────────────────────────────────────────────────────────
  const afterMeta = 210;
  doc.setDrawColor(200).line(margin, afterMeta, W - margin, afterMeta);

  // ── SHIPPING TO / BILL TO ────────────────────────────────────────────────
  y = afterMeta + 16;
  const colMid = W / 2 + 10;

  doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(30);
  doc.text("SHIPPING TO:", margin, y);
  doc.setFont("helvetica", "normal").setTextColor(60);
  doc.text(`Consignee: ${inv.buyerName || "Buyer"}`, margin, y + 13);
  if (inv.buyerAddress) {
    const lines = doc.splitTextToSize(inv.buyerAddress, colMid - margin - 10);
    doc.text(lines, margin, y + 26);
  }
  if (inv.buyerGstin) doc.text(`GSTIN: ${inv.buyerGstin}`, margin, y + 65);

  doc.setFont("helvetica", "bold").setTextColor(30);
  doc.text("BILL TO:", colMid, y);
  doc.setFont("helvetica", "normal").setTextColor(60);
  doc.text(`Buyer Name: ${inv.buyerName || "Buyer"}`, colMid, y + 13);
  if (inv.buyerAddress) {
    const lines = doc.splitTextToSize(inv.buyerAddress, W - margin - colMid);
    doc.text(lines, colMid, y + 26);
  }
  if (inv.buyerGstin) doc.text(`GSTIN: ${inv.buyerGstin}`, colMid, y + 65);

  // ── TAX INVOICE INFO TABLE ───────────────────────────────────────────────
  autoTable(doc, {
    startY: afterMeta + 100,
    margin: { left: margin, right: margin },
    head: [["Seller Tax Invoice Number", "Seller Tax Invoice Date", "Dispatch Mode", "Dispatch Date"]],
    body: [[
      String(inv.id).slice(-6),
      dateStr,
      "Manual",
      dateStr,
    ]],
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [240, 240, 240], textColor: 30, fontStyle: "bold" },
    theme: "grid",
  });

  // ── SUPPLY INFO TABLE ────────────────────────────────────────────────────
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    margin: { left: margin, right: margin },
    head: [["Place of Supply", "Place of Supply State (State/UT Code)", "Supply Type", "Buyer GSTIN Number"]],
    body: [["Buyer Location", inv.supplyState || "—", inv.supplyType || "Inter-State", inv.buyerGstin || "—"]],
    styles: { fontSize: 8, cellPadding: 5 },
    headStyles: { fillColor: [240, 240, 240], textColor: 30, fontStyle: "bold" },
    theme: "grid",
  });

  // ── ITEMS TABLE ──────────────────────────────────────────────────────────
  const items = inv.items || [];
  const bodyRows = [];

  items.forEach((item) => {
    const taxRate = item.taxRate ?? 12;
    const qty     = item.quantity;
    const unit    = item.price;
    const taxable = unit * qty;
    const igst    = +(taxable * taxRate / 100).toFixed(2);
    const total   = +(taxable + igst).toFixed(2);

    // Product row
    bodyRows.push([
      item.name,
      item.hsnCode || "—",
      item.measurementUnit || "Pieces",
      "PIECES",
      qty,
      `Rs. ${unit.toLocaleString("en-IN")}`,
      `Rs. ${total.toLocaleString("en-IN")}`,
    ]);

    // Tax breakdown sub-row (merged cell style via empty cols)
    bodyRows.push([
      {
        content: [
          `Taxable Amount: Rs. ${taxable.toLocaleString("en-IN")}`,
          `Tax Rate (%): ${taxRate}`,
          `IGST: Rs. ${igst.toLocaleString("en-IN")}`,
          `Cess Rate (%): 0.000    Cess Amount: Rs. 0.00`,
          `Rounding Off: Rs. 0.00`,
        ].join("\n"),
        colSpan: 5,
        styles: { fontSize: 7, textColor: 80, cellPadding: { top: 4, bottom: 4, left: 6, right: 6 } },
      },
      "",
      "",
    ]);
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    margin: { left: margin, right: margin },
    head: [["Product Description", "HSN Code", "Measurement Unit", "GST UQ Name", "Supplied Qty", "Unit Price", "Total Price (incl. taxes)"]],
    body: bodyRows,
    styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: [240, 240, 240], textColor: 30, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 130 },
      6: { fontStyle: "bold" },
    },
    theme: "grid",
  });

  // ── GRAND TOTAL ──────────────────────────────────────────────────────────
  const grandTotal = items.reduce((sum, item) => {
    const taxRate = item.taxRate ?? 12;
    const taxable = item.price * item.quantity;
    return sum + taxable + (taxable * taxRate / 100);
  }, 0);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY,
    margin: { left: margin, right: margin },
    body: [
      [{ content: `Grand Total: Rs. ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, styles: { halign: "right", fontStyle: "bold", fontSize: 10 } }],
    ],
    theme: "plain",
  });

  // ── FOOTER ───────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8).setFont("helvetica", "italic").setTextColor(150);
  doc.text("This is a computer-generated invoice and does not require a physical signature.", W / 2, pageH - 25, { align: "center" });
  doc.text("PharmaConnect B2B Healthcare Supply Chain Platform", W / 2, pageH - 14, { align: "center" });

  doc.save(`Invoice-${invoiceNo}.pdf`);
}
