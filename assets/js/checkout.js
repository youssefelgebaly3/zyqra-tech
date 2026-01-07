/**
 * ZYQRA Checkout JavaScript
 * Handles order summary loading, payment method selection, and order placement
 */

(function () {
    "use strict";

    let currentSubtotal = 0;
    const SHIPPING_FEE = 50;
    const COD_FEE = 50;

    document.addEventListener('DOMContentLoaded', function () {
        // Load cart items
        loadOrderSummary();

        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', function () {
                paymentMethods.forEach(m => m.classList.remove('active'));
                this.classList.add('active');

                // Hide all payment info
                document.querySelectorAll('.payment-info').forEach(info => {
                    info.style.display = 'none';
                });

                // Show selected payment info
                const methodId = this.dataset.method;
                const infoEl = document.getElementById(methodId + '-info');
                if (infoEl) {
                    infoEl.style.display = 'block';
                }

                // Update totals based on payment method
                updateTotals(methodId);
            });
        });
    });

    function updateTotals(paymentMethod) {
        const codFeeRow = document.getElementById('cod-fee-row');
        let total = currentSubtotal + SHIPPING_FEE;

        if (paymentMethod === 'cod') {
            if (codFeeRow) codFeeRow.style.display = 'flex';
            total += COD_FEE;
        } else {
            if (codFeeRow) codFeeRow.style.display = 'none';
        }

        const totalEl = document.getElementById('checkout-total');
        if (totalEl) totalEl.textContent = total.toLocaleString() + ' ج.م';
    }

    function loadOrderSummary() {
        // Use the same storage key as main.js
        const cart = JSON.parse(localStorage.getItem('zyqra_cart')) || [];
        const orderItems = document.getElementById('order-items');

        if (!orderItems) return;

        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        let html = '';
        currentSubtotal = 0;

        cart.forEach(item => {
            currentSubtotal += item.price * (item.quantity || 1);
            html += `
                <div class="order-item">
                    <div class="order-item-image">
                        <i class="bi bi-box-seam"></i>
                    </div>
                    <div class="order-item-info">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-qty">الكمية: ${item.quantity || 1}</div>
                    </div>
                    <div class="order-item-price">${(item.price * (item.quantity || 1)).toLocaleString()} ج.م</div>
                </div>
            `;
        });

        orderItems.innerHTML = html;

        const subtotalEl = document.getElementById('checkout-subtotal');
        const shippingEl = document.getElementById('checkout-shipping');
        const codFeeEl = document.getElementById('checkout-cod-fee');

        if (subtotalEl) subtotalEl.textContent = currentSubtotal.toLocaleString() + ' ج.م';
        if (shippingEl) shippingEl.textContent = SHIPPING_FEE + ' ج.م';
        if (codFeeEl) codFeeEl.textContent = COD_FEE + ' ج.م';

        // Calculate initial total (COD is default selected)
        const activeMethod = document.querySelector('.payment-method.active');
        updateTotals(activeMethod ? activeMethod.dataset.method : 'cod');
    }

    function placeOrder() {
        // Validate form
        const form = document.getElementById('shipping-form');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get form data
        const customerData = {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            email: document.getElementById('email')?.value || '',
            address: document.getElementById('address')?.value || '',
            governorate: document.getElementById('governorate')?.value || '',
            city: document.getElementById('city')?.value || '',
            postalCode: document.getElementById('postalCode')?.value || '',
            notes: document.getElementById('notes')?.value || ''
        };

        const activeMethodEl = document.querySelector('.payment-method.active');
        const totalEl = document.getElementById('checkout-total');

        const orderData = {
            customer: customerData,
            paymentMethod: activeMethodEl ? activeMethodEl.dataset.method : 'cod',
            items: JSON.parse(localStorage.getItem('zyqra_cart')) || [],
            total: totalEl ? totalEl.textContent : ''
        };

        // Show success message
        const successHtml = `
            <div class="text-center py-5" data-aos="zoom-in">
                <div class="success-icon mb-4">
                    <i class="bi bi-check-circle-fill" style="font-size: 5rem; color: #28a745;"></i>
                </div>
                <h2 class="mb-3">تم استلام طلبك بنجاح! 🎉</h2>
                <p class="text-muted mb-4">شكراً لك ${orderData.customer.firstName}، سنتواصل معك قريباً لتأكيد الطلب.</p>
                <div class="order-number mb-4">
                    <span class="badge bg-primary fs-5 p-3" style="border-radius: 12px;">
                        رقم الطلب: #ZYQ-${Date.now().toString().slice(-6)}
                    </span>
                </div>
                <div class="d-flex gap-3 justify-content-center flex-wrap">
                    <a href="https://api.whatsapp.com/send?phone=201033624387&text=مرحباً، أود الاستفسار عن طلبي" 
                       class="btn btn-success btn-lg" style="border-radius: 12px;" target="_blank">
                        <i class="bi bi-whatsapp me-2"></i>تواصل عبر واتساب
                    </a>
                    <a href="index.html" class="btn btn-outline-primary btn-lg" style="border-radius: 12px;">
                        <i class="bi bi-house me-2"></i>العودة للرئيسية
                    </a>
                </div>
            </div>
        `;

        // Clear cart
        localStorage.removeItem('zyqra_cart');

        // Update page
        const mainContent = document.querySelector('.main');
        if (mainContent) {
            mainContent.innerHTML = `
                <section class="section" style="padding-top: 150px;">
                    <div class="container">
                        ${successHtml}
                    </div>
                </section>
            `;
        }

        // Update cart badge - assuming updateCartBadge is available from main.js
        if (typeof window.updateCartBadge === 'function') {
            window.updateCartBadge();
        }

        // Re-init AOS
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // Expose placeOrder to window for HTML inline event
    window.placeOrder = placeOrder;
})();
