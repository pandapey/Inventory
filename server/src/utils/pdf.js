import PDFDocument from 'pdfkit';
export const buildInvoicePDF = (order, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${order.soNumber}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).text(`INVOICE ${order.soNumber}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Customer: ${order.customer?.name}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();
  order.items.forEach((i, idx) => {
    doc.text(`${idx + 1}. ${i.product?.name || i.product} x${i.quantity} @ $${i.price} discount $${i.discount || 0}`);
  });
  doc.moveDown();
  doc.text(`Subtotal: $${order.subTotal?.toFixed(2)}`);
  doc.text(`Tax (${order.taxRate}%): $${order.taxAmount?.toFixed(2)}`);
  doc.fontSize(14).text(`Total: $${order.total?.toFixed(2)}`);
  doc.end();
};
