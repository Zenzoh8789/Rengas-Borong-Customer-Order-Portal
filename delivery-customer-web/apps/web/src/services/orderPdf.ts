import { jsPDF } from "jspdf";
import type { Order, OrderLine } from "../types";

export function createOrderPdf(order: Order & { items?: OrderLine[] }) {
  const doc = new jsPDF();
  const money = (value: number) => Number.isFinite(Number(value)) ? Number(value).toFixed(2) : "-";
  let y = 22;
  const line = (value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines: string[] = doc.splitTextToSize(value, 174);
    for (const text of lines) {
      if (y > 270) { doc.addPage(); y = 22; }
      doc.text(text, 18, y);
      y += 6;
    }
  };
  doc.setFontSize(18);
  line("Rengas Borong", true);
  doc.setFontSize(12);
  line("Order details", true);
  y += 4;
  doc.setFontSize(10);
  line(`Order: ${order.orderNo}`);
  line(`Date: ${order.date}`);
  line(`Status: ${order.status || "Unavailable"}`);
  if (order.customer) {
    y += 4;
    line("Customer", true);
    const customer = order.customer;
    for (const value of [customer.name, customer.companyName, customer.address]) {
      if (value) line(value);
    }
    if (customer.phoneNumber) line(`Phone: ${customer.phoneNumber}`);
    if (customer.tinNumber) line(`TIN: ${customer.tinNumber}`);
  }
  y += 6;
  line("Products", true);
  const items = Array.isArray(order.items) ? order.items : [];
  if (!items.length) line("Product items are not available for this order.");
  const widths = [10, 23, 65, 16, 30, 30];
  const headings = ["No.", "Code", "Product", "Qty", "Unit price (RM)", "Amount (RM)"];
  const row = (cells: string[][], height: number, header = false, shaded = false) => {
    let x = 18;
    doc.setFont("helvetica", header ? "bold" : "normal");
    doc.setFontSize(9);
    cells.forEach((lines, col) => {
      doc.setDrawColor(215, 221, 232);
      doc.setLineWidth(0.2);
      if (header) doc.setFillColor(17, 17, 175);
      else doc.setFillColor(shaded ? 246 : 255, shaded ? 248 : 255, shaded ? 252 : 255);
      doc.rect(x, y, widths[col], height, "FD");
      doc.setTextColor(header ? 255 : 25);
      const right = col >= 3;
      lines.forEach((text, i) => doc.text(text, right ? x + widths[col] - 2 : x + 2, y + 5 + i * 4.5, { align: right ? "right" : "left" }));
      x += widths[col];
    });
    y += height;
    doc.setTextColor(25);
  };
  const tableHeader = () => row(headings.map(text => [text]), 10, true);
  if (items.length) {
    if (y > 248) { doc.addPage(); y = 22; }
    tableHeader();
  }
  items.forEach((item, index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const values = [String(index + 1), item.product.code || "-", item.product.name, String(item.quantity), money(item.unitPrice), money(item.amount ?? item.quantity * item.unitPrice)];
    const cells: string[][] = values.map((value, col) => doc.splitTextToSize(value, widths[col] - 4));
    const count = Math.max(...cells.map(cell => cell.length));
    const fullHeight = Math.max(10, count * 4.5 + 5);
    if (y + fullHeight > 270 && y > 32) {
      doc.addPage(); y = 22; tableHeader();
    }
    // Split exceptionally long rows across pages without losing text.
    for (let offset = 0; offset < count;) {
      const capacity = Math.max(1, Math.floor((270 - y - 5) / 4.5));
      const take = Math.min(capacity, count - offset);
      row(cells.map(cell => cell.slice(offset, offset + take)), Math.max(10, take * 4.5 + 5), false, index % 2 === 1);
      offset += take;
      if (offset < count) { doc.addPage(); y = 22; tableHeader(); }
    }
  });
  y += 6;
  if (y > 258) { doc.addPage(); y = 22; }
  doc.setFillColor(238, 238, 253);
  doc.roundedRect(108, y, 84, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 17, 175);
  doc.text(`Order total: RM ${money(order.total)}`, 188, y + 8, { align: "right" });
  doc.setTextColor(25);
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.text(`Page ${page} of ${pageCount}`, 192, 286, { align: "right" });
  }
  return doc;
}

export function downloadOrderPdf(order: Order & { items?: OrderLine[] }) {
  const filename = (order.orderNo || String(order.id)).replace(/[^a-zA-Z0-9_-]/g, "_");
  createOrderPdf(order).save(`Order-${filename}.pdf`);
}
