const { Order, Integration, Product, Advertisement, QRCode, User } = require('../Utils/Postgres');
const { generateOrderReceipt } = require("../Utils/Receipt.helper");
const { generateUUID } = require("../Utils/Helper");
const path = require('path');
const fs = require('fs');

/**
 * Renders a public-facing store page with product listings
 */
const viewPublicStore = async (req, res) => {
    try {
        const { integrationId } = req.params;
        const merchant = await Integration.findByPk(integrationId);
        
        if (!merchant) {
            return res.status(404).send('<h1>Store Not Found</h1>');
        }

        const products = await Product.findAll({
            where: { integrationId, isDeleted: false, isActive: true },
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        const advertisements = await Advertisement.findAll({
            where: { integrationId, isDeleted: false, isActive: true },
            order: [['createdAt', 'DESC']]
        });

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${merchant.integrationName} - Online Store</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 0; margin: 0; background: #f8f9fa; color: #212529; padding-bottom: 90px; }
                .navbar { background: #fff; padding: 15px; text-align: center; border-bottom: 1px solid #eee; position: sticky; top: 0; z-index: 100; }
                .logo { font-size: 20px; font-weight: 700; color: #007bff; }
                .container { padding: 15px; max-width: 800px; margin: auto; }
                
                /* Ad Board Styles */
                .ad-board { 
                    width: 100%; 
                    overflow-x: auto; 
                    display: flex; 
                    gap: 15px; 
                    padding: 15px; 
                    background: #fff;
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                    box-sizing: border-box;
                }
                .ad-card {
                    min-width: 85%;
                    height: 180px;
                    border-radius: 15px;
                    background-size: cover;
                    background-position: center;
                    scroll-snap-align: center;
                    position: relative;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .ad-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 20px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    border-radius: 0 0 15px 15px;
                    color: white;
                }
                .ad-name { font-weight: 700; font-size: 18px; }
                .ad-desc { font-size: 12px; opacity: 0.9; }

                .hero { text-align: center; padding: 20px 15px; background: #fff; margin-bottom: 10px; }
                .category-title { font-size: 18px; font-weight: 700; margin: 25px 0 15px; color: #495057; border-left: 4px solid #007bff; padding-left: 10px; }
                .product-card { background: white; border-radius: 12px; padding: 12px; margin-bottom: 12px; display: flex; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
                .product-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; background: #eee; margin-right: 15px; }
                .product-info { flex: 1; }
                .product-name { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
                .product-price { color: #28a745; font-weight: 700; font-size: 15px; }
                .product-desc { font-size: 13px; color: #6c757d; line-height: 1.4; margin-top: 4px; }
                .badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #e9ecef; color: #495057; margin-left: 8px; vertical-align: middle; }
                
                /* Action controls */
                .action-wrapper { margin-left: 10px; }
                .add-btn { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; }
                .qty-control { display: none; align-items: center; background: #f1f3f5; border-radius: 8px; padding: 4px; border: 1px solid #dee2e6; }
                .qty-btn { background: none; border: none; font-size: 16px; font-weight: bold; padding: 4px 10px; cursor: pointer; color: #007bff; }
                .qty-value { font-weight: bold; padding: 0 8px; min-width: 16px; text-align: center; font-size: 14px; }

                /* Floating Footer Bar */
                #cart-floating-bar { position: fixed; bottom: 16px; left: 16px; right: 16px; background: #007bff; color: white; display: none; justify-content: space-between; align-items: center; padding: 12px 20px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 1000; }
                .cart-details { display: flex; flex-direction: column; }
                .cart-text-main { font-weight: bold; font-size: 15px; }
                .cart-text-sub { font-size: 12px; opacity: 0.9; }
                .view-cart-btn { background: white; color: #007bff; border: none; font-weight: bold; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; }

                /* Checkout Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 2000; }
                .modal-content { background: white; width: 90%; max-width: 450px; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); box-sizing: border-box; }
                .modal-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #212529; }
                .form-group { margin-bottom: 16px; }
                .form-label { display: block; font-size: 13px; font-weight: 600; color: #495057; margin-bottom: 6px; }
                .form-input { width: 100%; border: 1px solid #ced4da; border-radius: 8px; padding: 10px; font-size: 14px; box-sizing: border-box; }
                .cart-items-summary { max-height: 120px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 10px; margin-bottom: 20px; }
                .cart-item-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #495057; }
                .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
                .modal-btn { border: none; font-weight: bold; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; }
                .cancel-btn { background: #e9ecef; color: #495057; }
                .order-btn { background: #28a745; color: white; }

                .footer { text-align: center; padding: 20px; color: #adb5bd; font-size: 14px; }
                .empty-state { text-align: center; padding: 50px; color: #adb5bd; }
                
                /* Hide scrollbar */
                .ad-board::-webkit-scrollbar { display: none; }
            </style>
        </head>
        <body>
            <div class="navbar">
                <div class="logo">${merchant.integrationName}</div>
            </div>

            ${advertisements.length > 0 ? `
                <div class="ad-board">
                    ${advertisements.map(ad => `
                        <div class="ad-card" style="background-image: url('${ad.bannerUrl}')">
                            <div class="ad-overlay">
                                <div class="ad-name">${ad.name}</div>
                                <div class="ad-desc">${ad.description || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="hero">
                    <h1 style="margin:0; font-size: 24px;">Welcome to Our Store</h1>
                    <p style="color:#6c757d; margin-top: 8px;">Browse our latest products below</p>
                </div>
            `}

            <div class="container">
                ${products.length === 0 ? '<div class="empty-state">No products available at the moment.</div>' : ''}
                
                ${Array.from(new Set(products.map(p => p.category || 'General'))).map(cat => `
                    <div class="category-title">${cat}</div>
                    ${products.filter(p => (p.category || 'General') === cat).map(p => `
                        <div class="product-card" data-id="${p.id}">
                            <img src="${p.imageUrls && p.imageUrls[0] ? p.imageUrls[0] : 'https://placehold.co/100x100?text=' + encodeURIComponent(p.name)}" class="product-img">
                            <div class="product-info">
                                <div class="product-name">
                                    ${p.name}
                                    ${p.dietaryType === 'veg' ? '<span class="badge" style="color: green;">Veg</span>' : ''}
                                    ${p.dietaryType === 'non-veg' ? '<span class="badge" style="color: red;">Non-Veg</span>' : ''}
                                </div>
                                <div class="product-price">\u20B9${p.price}</div>
                                <div class="product-desc">${p.description || ''}</div>
                            </div>
                            <div class="action-wrapper">
                                <button class="add-btn" onclick="addToCart('${p.id}', '${p.name.replace(/'/g, "\\'")}', ${p.price})">ADD</button>
                                <div class="qty-control">
                                    <button class="qty-btn" onclick="changeQuantity('${p.id}', -1)">-</button>
                                    <span class="qty-value">0</span>
                                    <button class="qty-btn" onclick="changeQuantity('${p.id}', 1)">+</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `).join('')}
            </div>

            <!-- Floating Cart Bar -->
            <div id="cart-floating-bar">
                <div class="cart-details">
                    <span id="cart-count" class="cart-text-main">0 items</span>
                    <span id="cart-total" class="cart-text-sub">\u20B90.00</span>
                </div>
                <button class="view-cart-btn" onclick="openCheckoutModal()">View Cart &amp; Order</button>
            </div>

            <!-- Checkout Modal -->
            <div id="checkout-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-title">Dine-in Order Checkout</div>
                    <div class="form-group">
                        <label class="form-label">Your Name</label>
                        <input id="modal-name-input" class="form-input" placeholder="Enter your name" type="text">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Table Number</label>
                        <input id="modal-table-input" class="form-input" placeholder="Table No." type="text">
                    </div>
                    <div class="modal-label" style="font-size: 13px; font-weight: 600; color: #495057; margin-bottom: 6px;">Order Items</div>
                    <div id="cart-items-list" class="cart-items-summary">
                        <!-- Filled dynamically -->
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn cancel-btn" onclick="closeCheckoutModal()">Cancel</button>
                        <button id="submit-order-btn" class="modal-btn order-btn" onclick="submitOrder()">Place Order</button>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>Powered by <strong>Tubulu</strong></p>
            </div>

            <script>
                const integrationId = "${integrationId}";
                const tableName = new URLSearchParams(window.location.search).get('table') || '';
                let cart = {};

                function updateCartUI() {
                    let totalCount = 0;
                    let totalPrice = 0;
                    const cartItemsList = document.getElementById('cart-items-list');
                    if (cartItemsList) cartItemsList.innerHTML = '';

                    for (const pid in cart) {
                        const item = cart[pid];
                        totalCount += item.quantity;
                        totalPrice += item.price * item.quantity;

                        const productRow = document.createElement('div');
                        productRow.className = 'cart-item-row';
                        productRow.innerHTML = \`
                            <span>\${item.name} x \${item.quantity}</span>
                            <span>&#8377;\${(item.price * item.quantity).toFixed(2)}</span>
                        \`;
                        if (cartItemsList) cartItemsList.appendChild(productRow);
                    }

                    const cartBar = document.getElementById('cart-floating-bar');
                    if (cartBar) {
                        if (totalCount > 0) {
                            cartBar.style.display = 'flex';
                            document.getElementById('cart-count').innerText = totalCount + ' items';
                            document.getElementById('cart-total').innerText = '&#8377;' + totalPrice.toFixed(2);
                        } else {
                            cartBar.style.display = 'none';
                        }
                    }
                    
                    document.querySelectorAll('.product-card').forEach(card => {
                        const pid = card.getAttribute('data-id');
                        const addBtn = card.querySelector('.add-btn');
                        const qtyControl = card.querySelector('.qty-control');
                        const qtyVal = card.querySelector('.qty-value');

                        const item = cart[pid];
                        if (item && item.quantity > 0) {
                            if (addBtn) addBtn.style.display = 'none';
                            if (qtyControl) qtyControl.style.display = 'flex';
                            if (qtyVal) qtyVal.innerText = item.quantity;
                        } else {
                            if (addBtn) addBtn.style.display = 'block';
                            if (qtyControl) qtyControl.style.display = 'none';
                        }
                    });
                }

                function addToCart(pid, name, price) {
                    if (!cart[pid]) {
                        cart[pid] = { name, price: parseFloat(price), quantity: 0 };
                    }
                    cart[pid].quantity++;
                    updateCartUI();
                }

                function changeQuantity(pid, delta) {
                    if (cart[pid]) {
                        cart[pid].quantity += delta;
                        if (cart[pid].quantity <= 0) {
                            delete cart[pid];
                        }
                        updateCartUI();
                    }
                }

                function openCheckoutModal() {
                    document.getElementById('checkout-modal').style.display = 'flex';
                    document.getElementById('modal-table-input').value = tableName;
                }

                function closeCheckoutModal() {
                    document.getElementById('checkout-modal').style.display = 'none';
                }

                async function submitOrder() {
                    const customerName = document.getElementById('modal-name-input').value.trim();
                    const tbl = document.getElementById('modal-table-input').value.trim();

                    if (!customerName) {
                        alert('Please enter your name.');
                        return;
                    }

                    const items = [];
                    for (const pid in cart) {
                        items.push({ productId: pid, quantity: cart[pid].quantity });
                    }

                    const orderBtn = document.getElementById('submit-order-btn');
                    orderBtn.disabled = true;
                    orderBtn.innerText = 'Placing Order...';

                    try {
                        const response = await fetch(\`/api/v1/public/store/\${integrationId}/order\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ customerName, tableName: tbl, items })
                        });
                        const resData = await response.json();
                        if (resData.success) {
                            alert('Order placed successfully! Order ID: ' + resData.data.orderId);
                            cart = {};
                            updateCartUI();
                            closeCheckoutModal();
                        } else {
                            alert('Error placing order: ' + resData.message);
                            orderBtn.disabled = false;
                            orderBtn.innerText = 'Place Order';
                        }
                    } catch (err) {
                        alert('Network error placing order. Please try again.');
                        orderBtn.disabled = false;
                        orderBtn.innerText = 'Place Order';
                    }
                }

                document.addEventListener('DOMContentLoaded', () => {
                    updateCartUI();
                });
            </script>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error viewing store:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Renders a public-facing receipt page for a specific order
 */
const viewPublicReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).send('<h1>Receipt Not Found</h1><p>The order you are looking for does not exist.</p>');
        }

        const merchant = await Integration.findByPk(order.integrationId);
        const settings = merchant?.receiptSettings || {
            logoUrl: null,
            headerNote: '',
            footerNote: 'Powered by Tubulu',
            centralTaxRate: 2.5,
            stateTaxRate: 2.5,
        };

        const centralRate = parseFloat(settings.centralTaxRate ?? 2.5) || 0;
        const stateRate   = parseFloat(settings.stateTaxRate  ?? 2.5) || 0;
        const centralLabel = merchant?.verticalType === 'FB' ? 'IGST' : 'CGST';

        // ── Correct breakdown ─────────────────────────────────────────
        // itemsSubtotal = sum of individual item totals (before delivery/tax)
        const itemsSubtotal = parseFloat(
            (order.orderItems || []).reduce((s, i) => s + (parseFloat(i.total) || 0), 0).toFixed(2)
        );

        // Tax is EXCLUSIVE — calculated on items subtotal only, not on delivery
        const centralTaxAmt = parseFloat((itemsSubtotal * centralRate / 100).toFixed(2));
        const stateTaxAmt   = parseFloat((itemsSubtotal * stateRate  / 100).toFixed(2));

        // Delivery = totalPrice stored on order − items − tax already baked in at order time
        // We show the configured delivery fee from merchant settings for COD/UPI orders
        const configuredDelivery = parseFloat(merchant?.deliveryFee || 0);
        const hasDelivery = order.deliveryType === 'Delivery' && configuredDelivery > 0;
        const deliveryAmt = hasDelivery ? configuredDelivery : 0;

        // Grand total shown on receipt = items + delivery + tax
        const grandTotal = parseFloat((itemsSubtotal + deliveryAmt + centralTaxAmt + stateTaxAmt).toFixed(2));

        // Show tax whenever rates are configured (no GSTIN required for display)
        const showTax = centralRate > 0 || stateRate > 0;

        const addressParts = [merchant?.addressLine, merchant?.city, merchant?.state, merchant?.pincode].filter(Boolean);
        const orderDate    = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

        const itemsHtml = (order.orderItems || []).map(item => `
          <div class="row">
            <span class="item-name">${item.name} <span class="item-qty">x ${item.quantity}</span></span>
            <span class="amount">&#8377;${parseFloat(item.total || 0).toFixed(2)}</span>
          </div>`).join('');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Receipt — ${merchant?.integrationName || 'Tubulu'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f2f4f7;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 40px;
      color: #1a1a1a;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      width: 100%;
      max-width: 420px;
      padding: 28px 24px 24px;
    }
    /* ── Header ── */
    .header {
      text-align: center;
      padding-bottom: 18px;
      border-bottom: 1.5px dashed #d0d5dd;
      margin-bottom: 18px;
    }
    .logo-wrap { margin-bottom: 14px; }
    .logo-img  { max-height: 56px; max-width: 140px; object-fit: contain; border-radius: 8px; }
    .store-name { font-size: 18px; font-weight: 700; color: #111; line-height: 1.3; }
    .meta { font-size: 12px; color: #667085; margin-top: 4px; line-height: 1.6; }
    .gstin  { font-size: 11px; color: #667085; margin-top: 2px; }
    .header-note {
      font-size: 13px; font-style: italic; color: #555;
      margin-top: 10px; padding: 8px 12px;
      background: #f9fafb; border-radius: 8px;
    }
    /* ── Items ── */
    .section-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; letter-spacing: 0.3px; }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 8px;
    }
    .item-name { font-size: 14px; color: #374151; flex: 1; }
    .item-qty  { font-size: 13px; color: #9ca3af; }
    .amount    { font-size: 14px; font-weight: 500; color: #374151; white-space: nowrap; }
    /* ── Totals ── */
    .divider {
      border: none;
      border-top: 1.5px dashed #d0d5dd;
      margin: 14px 0;
    }
    .tax-row .item-name, .tax-row .amount { font-size: 13px; color: #667085; font-weight: 400; }
    .grand-row {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1.5px dashed #d0d5dd;
    }
    .grand-row .item-name { font-size: 16px; font-weight: 700; color: #111; }
    .grand-row .amount    { font-size: 16px; font-weight: 700; color: #111; }
    /* ── CTA Button ── */
    .cta {
      display: block;
      margin-top: 22px;
      background: #111;
      color: #fff;
      text-align: center;
      padding: 13px 16px;
      border-radius: 10px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    /* ── Footer ── */
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="card">

    <!-- HEADER -->
    <div class="header">
      ${settings.logoUrl ? `<div class="logo-wrap"><img src="${settings.logoUrl}" class="logo-img" alt="Logo"/></div>` : ''}
      <div class="store-name">${merchant?.integrationName || 'Store'}</div>
      <div class="meta">Order #${order.id.slice(0, 8).toUpperCase()}</div>
      ${merchant?.gstNumber ? `<div class="gstin">GSTIN: ${merchant.gstNumber}</div>` : ''}
      ${addressParts.length ? `<div class="meta">${addressParts.join(', ')}</div>` : ''}
      ${(merchant?.email || merchant?.phoneNumber) ? `<div class="meta">Email: ${merchant.email || '—'} &nbsp;|&nbsp; Phone: ${merchant.phoneNumber || '—'}</div>` : ''}
      <div class="meta">${orderDate}</div>
      ${settings.headerNote ? `<div class="header-note">"${settings.headerNote}"</div>` : ''}
    </div>

    <!-- ITEMS -->
    <div class="section-label">Items</div>
    ${itemsHtml}

    <!-- TOTALS BREAKDOWN -->
    <hr class="divider"/>

    <!-- Always show subtotal row -->
    <div class="row tax-row">
      <span class="item-name">Subtotal</span>
      <span class="amount">&#8377;${itemsSubtotal.toFixed(2)}</span>
    </div>

    <!-- Delivery row (only if delivery order) -->
    ${hasDelivery ? `
    <div class="row tax-row">
      <span class="item-name">Delivery Charge</span>
      <span class="amount">&#8377;${deliveryAmt.toFixed(2)}</span>
    </div>` : ''}

    <!-- Tax rows -->
    ${showTax ? `
      ${centralRate > 0 ? `
      <div class="row tax-row">
        <span class="item-name">${centralLabel} (${centralRate}%)</span>
        <span class="amount">&#8377;${centralTaxAmt.toFixed(2)}</span>
      </div>` : ''}
      ${stateRate > 0 ? `
      <div class="row tax-row">
        <span class="item-name">SGST (${stateRate}%)</span>
        <span class="amount">&#8377;${stateTaxAmt.toFixed(2)}</span>
      </div>` : ''}
    ` : ''}

    <!-- GRAND TOTAL -->
    <div class="row grand-row">
      <span class="item-name">Grand Total</span>
      <span class="amount">&#8377;${grandTotal.toFixed(2)}</span>
    </div>

    <!-- CTA -->
    <a href="https://tubulu.page.link/receipts" class="cta">Download Tubulu App to See Full History</a>
  </div>

  <div class="footer">${settings.footerNote || 'Powered by Tubulu'}</div>
</body>
</html>`;


        res.send(html);
    } catch (error) {
        console.error('Error viewing receipt:', error);
        res.status(500).send('Internal Server Error');
    }

};


/**
 * Downloads the PDF version of the receipt
 */
const downloadReceiptPDF = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);
        const merchant = await Integration.findByPk(order.integrationId);
        
        const filePath = await generateOrderReceipt(order, merchant);
        res.download(filePath);
    } catch (error) {
        console.error('PDF Download Error:', error);
        res.status(500).send('Error generating PDF');
    }
};

/**
 * Gateway redirection scanner for QR codes.
 */
const scanQRCode = async (req, res) => {
    try {
        const { qrId } = req.params;
        const { table } = req.query;
        
        const qr = await QRCode.findByPk(qrId);
        if (!qr) {
            return res.status(404).send('<h1>QR Code Not Found</h1>');
        }

        // Increment scanCount
        qr.scanCount = (qr.scanCount || 0) + 1;
        await qr.save();

        const integrationId = qr.integrationId;

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redirecting to Tubulu...</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa; text-align: center; padding: 20px; }
                .spinner { border: 4px solid rgba(0, 0, 0, 0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #007bff; animation: spin 1s linear infinite; margin-bottom: 20px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                h1 { font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #212529; }
                p { font-size: 14px; color: #6c757d; margin: 0; }
            </style>
        </head>
        <body>
            <div class="spinner"></div>
            <h1>Opening Tubulu App...</h1>
            <p>Please wait a moment while we redirect you.</p>
            <script>
                const storeId = "${integrationId}";
                const tbl = "${table || ''}";
                
                const appUri = "tubulu://store/" + storeId + "?table=" + tbl + "&qrId=${qrId}";
                const fallbackUrl = "/api/v1/public/store/" + storeId + "?table=" + tbl + "&qrId=${qrId}";

                // Attempt to deep link into app
                window.location.href = appUri;

                // Fallback timeout to interactive HTML catalog
                setTimeout(() => {
                    window.location.href = fallbackUrl;
                }, 2000);
            </script>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error scanning QR code:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Placed order from public web-ordering catalog
 */
const placePublicOrder = async (req, res) => {
    try {
        const { integrationId } = req.params;
        const { customerName, tableName, items } = req.body;

        if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid order details. Name and items are required.' });
        }

        const merchant = await Integration.findByPk(integrationId);
        if (!merchant) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Find or create a public guest customer
        let guestUser = await User.findOne({ where: { phoneNumber: 'guest' } });
        if (!guestUser) {
            guestUser = await User.create({
                uuid: generateUUID(),
                phoneNumber: 'guest',
                name: 'Web Guest',
                role: 'customer',
                isActive: true
            });
        }

        let totalPrice = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await Product.findOne({ where: { id: item.productId, integrationId } });
            if (!product) {
                return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
            }
            const qty = parseInt(item.quantity) || 1;
            totalPrice += product.price * qty;
            enrichedItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: qty
            });
        }

        const order = await Order.create({
            userId: guestUser.id,
            integrationId,
            orderItems: enrichedItems,
            totalPrice,
            deliveryType: 'dine-in',
            paymentMethod: 'pay_at_counter',
            paymentStatus: 'pending',
            status: 'waiting',
            orderMessage: `Dine-in Order from ${customerName} (Table: ${tableName || 'N/A'})`,
            statusLogs: [
                { status: 'waiting', timestamp: new Date(), message: 'Order placed via web catalog' }
            ]
        });

        // Trigger real-time notification to merchant portal
        try {
            const { sendOrderUpdate } = require('../Services/Order.Service');
            sendOrderUpdate({
                type: "NEW_ORDER",
                order: {
                    ...order.get({ plain: true }),
                    orderId: order.id,
                },
                integrationId
            });
        } catch (sseErr) {
            console.error('Failed to trigger order SSE notification:', sseErr);
        }

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                orderId: order.id,
                totalPrice
            }
        });

    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

/**
 * Default store QR scanner gateway
 */
const scanStoreQR = async (req, res) => {
    try {
        const { integrationId } = req.params;
        const { table } = req.query;

        const merchant = await Integration.findByPk(integrationId);
        if (!merchant) {
            return res.status(404).send('<h1>Store Not Found</h1>');
        }

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redirecting to ${merchant.integrationName}...</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa; text-align: center; padding: 20px; }
                .spinner { border: 4px solid rgba(0, 0, 0, 0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #007bff; animation: spin 1s linear infinite; margin-bottom: 20px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                h1 { font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #212529; }
                p { font-size: 14px; color: #6c757d; margin: 0; }
            </style>
        </head>
        <body>
            <div class="spinner"></div>
            <h1>Opening ${merchant.integrationName} on Tubulu...</h1>
            <p>Please wait while we open the store.</p>
            <script>
                const storeId = "${integrationId}";
                const tbl = "${table || ''}";
                
                const appUri = "tubulu://store/" + storeId + "?table=" + tbl;
                const fallbackUrl = "/api/v1/public/store/" + storeId + "?table=" + tbl;

                // Attempt to deep link into app
                window.location.href = appUri;

                // Fallback to web catalog after 2s
                setTimeout(() => {
                    window.location.href = fallbackUrl;
                }, 2000);
            </script>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error scanning store QR:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    viewPublicStore,
    viewPublicReceipt,
    downloadReceiptPDF,
    scanQRCode,
    placePublicOrder,
    scanStoreQR
};
