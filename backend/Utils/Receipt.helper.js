const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./Logger').logger;

/**
 * Generates a professional PDF receipt for an order
 * @param {Object} order - The Order object from the database
 * @param {Object} merchant - The Integration (Merchant) object
 * @returns {Promise<string>} - The absolute path to the generated PDF
 */
async function generateOrderReceipt(order, merchant) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const filename = `receipt_${order.id}.pdf`;
            const artifactsDir = path.join(__dirname, '../Artifacts/receipts');
            
            if (!fs.existsSync(artifactsDir)) {
                fs.mkdirSync(artifactsDir, { recursive: true });
            }
            
            const filePath = path.join(artifactsDir, filename);
            const stream = fs.createWriteStream(filePath);

            const settings = merchant.receiptSettings || {
                primaryColor: '#007bff',
                logoUrl: null,
                headerNote: '',
                footerNote: 'Powered by Tubulu',
                gstNumber: ''
            };
            const primaryColor = settings.primaryColor || '#007bff';

            doc.pipe(stream);

            // HEADER: Tubulu + Merchant
            doc.fillColor('black').fontSize(20).text('Tubulu Order Receipt', { align: 'center' });
            doc.moveDown();
            
            doc.fillColor('black').fontSize(14).text(`Store: ${merchant.integrationName}`, { align: 'left' });
            if (merchant.gstNumber) {
                doc.fontSize(10).fillColor('#666666').text(`GSTIN: ${merchant.gstNumber}`, { align: 'left' });
            }
            const address = [merchant.addressLine, merchant.city, merchant.state, merchant.pincode].filter(Boolean).join(', ');
            if (address) {
                doc.fontSize(10).fillColor('#666666').text(address, { align: 'left' });
            }
            if (merchant.email || merchant.phoneNumber) {
                doc.fontSize(10).fillColor('#666666').text(`Email: ${merchant.email || '—'} | Phone: ${merchant.phoneNumber || '—'}`, { align: 'left' });
            }
            if (settings.headerNote) {
                doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555').text(`"${settings.headerNote}"`, { align: 'left' });
                doc.font('Helvetica');
            }
            doc.fontSize(10).fillColor('black').text(`Date: ${new Date(order.createdAt).toLocaleString()}`, { align: 'right' });
            doc.text(`Order ID: #${order.id.slice(0, 8)}`, { align: 'right' });
            doc.moveDown();

            doc.strokeColor('black').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // ITEMS TABLE HEADER
            const tableTop = doc.y;
            doc.fontSize(12).font('Helvetica-Bold').fillColor('black');
            doc.text('Item', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Price', 400, tableTop);
            doc.text('Total', 500, tableTop);
            doc.moveDown();
            doc.font('Helvetica').fillColor('black');

            // ITEMS
            let yPosition = doc.y;
            order.orderItems.forEach(item => {
                doc.text(item.name, 50, yPosition, { width: 200 });
                doc.text(item.quantity.toString(), 300, yPosition);
                doc.text(`\u20B9${item.price}`, 400, yPosition);
                doc.text(`\u20B9${item.total}`, 500, yPosition);
                yPosition += 20;
            });

            doc.moveDown();
            doc.strokeColor('black').moveTo(50, yPosition + 10).lineTo(550, yPosition + 10).stroke();
            
            // TOTALS
            let currentY = yPosition + 30;
            doc.fontSize(12).font('Helvetica-Bold');
            
            if (merchant.gstNumber) {
                const centralRate = parseFloat(settings.centralTaxRate ?? 2.5) || 0;
                const stateRate = parseFloat(settings.stateTaxRate ?? 2.5) || 0;
                // Tax is EXCLUSIVE — calculated on top of the order subtotal
                const subtotal = order.totalPrice;
                const centralTaxAmt = parseFloat((subtotal * centralRate / 100).toFixed(2));
                const stateTaxAmt = parseFloat((subtotal * stateRate / 100).toFixed(2));
                const grandTotal = parseFloat((subtotal + centralTaxAmt + stateTaxAmt).toFixed(2));
                const centralLabel = merchant.verticalType === 'FB' ? 'IGST' : 'CGST';
                
                doc.text(`Subtotal: \u20B9${subtotal.toFixed(2)}`, 350, currentY);
                currentY += 20;
                if (centralRate > 0) {
                    doc.text(`${centralLabel} (${centralRate}%): \u20B9${centralTaxAmt.toFixed(2)}`, 350, currentY);
                    currentY += 20;
                }
                if (stateRate > 0) {
                    doc.text(`SGST (${stateRate}%): \u20B9${stateTaxAmt.toFixed(2)}`, 350, currentY);
                    currentY += 20;
                }
                doc.fillColor('black').fontSize(14).text(`Grand Total: \u20B9${grandTotal.toFixed(2)}`, 350, currentY + 10);

            } else {
                doc.text(`Subtotal: \u20B9${(order.totalPrice + (order.discountAmount || 0)).toFixed(2)}`, 350, currentY);
                currentY += 20;
            }
            
            if (order.discountAmount > 0) {
                doc.fillColor('red').text(`Discount: -\u20B9${order.discountAmount}`, 350, currentY);
                currentY += 20;
            }
            
            // Grand Total is printed inside the GST block above (with tax added).
            // For no-GST orders, print it here.
            if (!merchant.gstNumber) {
                doc.fillColor('black').fontSize(14).text(`Grand Total: \u20B9${order.totalPrice.toFixed(2)}`, 350, currentY + 10);
            }

            // FOOTER: Conversion Hook
            doc.moveDown(4);
            doc.fontSize(10).font('Helvetica-Oblique').fillColor('#666666');
            doc.text(settings.footerNote || 'Powered by Tubulu', { align: 'center' });
            doc.fillColor('blue').text('Download the Tubulu App to track this order and see your full history!', { align: 'center', link: 'https://tubulu.page.link/receipts' });

            doc.end();

            stream.on('finish', () => {
                logger.log(`Receipt generated: ${filePath}`);
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            logger.error('PDF Generation Failed:', error);
            reject(error);
        }
    });
}

module.exports = {
    generateOrderReceipt
};
