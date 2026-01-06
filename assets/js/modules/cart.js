export const ZYQRA_STORAGE_KEY = 'zyqra_cart';

export function getCart() {
    return JSON.parse(localStorage.getItem(ZYQRA_STORAGE_KEY) || '[]');
}

export function saveCart(cart) {
    localStorage.setItem(ZYQRA_STORAGE_KEY, JSON.stringify(cart));
}

export function addToCart(name, price, quantity = 1) {
    let cart = getCart();
    cart.push({ name, price, quantity });
    saveCart(cart);
    updateCartBadge();
    alert('تمت إضافة ' + name + ' إلى السلة!');
}

export function updateCartQuantity(index, change) {
    const cart = getCart();
    cart[index].quantity = (cart[index].quantity || 1) + change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    saveCart(cart);
    updateCartBadge();
    loadCartPage();
}

export function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartBadge();
    loadCartPage();
}

export function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll('.cart-badge');

    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Cart Page Loader
export function loadCartPage() {
    const cartItemsEl = document.getElementById('cart-items');
    const emptyCartEl = document.getElementById('empty-cart');
    const summaryEl = document.getElementById('cart-summary');

    if (!cartItemsEl) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '';
        emptyCartEl.style.display = 'block';
        if (summaryEl) summaryEl.style.display = 'none';
        return;
    }

    if (emptyCartEl) emptyCartEl.style.display = 'none';
    if (summaryEl) summaryEl.style.display = 'block';

    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * (item.quantity || 1);
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <i class="bi bi-box-seam"></i>
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">${item.price} ج.م</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <span class="quantity-value">${item.quantity || 1}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeCartItem(${index})">
                        <i class="bi bi-trash"></i> حذف
                    </button>
                </div>
            </div>
        `;
    });

    cartItemsEl.innerHTML = html;
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = subtotal + ' ج.م';
    if (totalEl) totalEl.textContent = (subtotal + 50) + ' ج.م';
}

// Checkout Page Loader
export function loadCheckoutPage() {
    const itemsEl = document.getElementById('order-items');
    if (!itemsEl) return;

    const cart = getCart();

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * (item.quantity || 1);
        html += `
            <div class="order-item">
                <div class="order-item-image"><i class="bi bi-box-seam"></i></div>
                <div class="order-item-info">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-price">${item.price} ج.م × ${item.quantity || 1}</div>
                </div>
            </div>
        `;
    });

    itemsEl.innerHTML = html;
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = subtotal + ' ج.م';
    if (totalEl) totalEl.textContent = (subtotal + 50) + ' ج.م';
}

// Product Details Logic
let currentDetailsQty = 1;
export function updateDetailsQty(delta) {
    currentDetailsQty = Math.max(1, currentDetailsQty + delta);
    const qtyEl = document.getElementById('qty');
    if (qtyEl) qtyEl.textContent = currentDetailsQty;
}

export function addDetailsToCart(name, price) {
    addToCart(name, price, currentDetailsQty);
}
