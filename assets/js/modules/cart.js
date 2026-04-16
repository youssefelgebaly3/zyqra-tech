import { StorageWrapper } from './storage.js';

export function getCart() {
  return StorageWrapper.get();
}

export function saveCart(cart) {
  StorageWrapper.set(cart);
}

export function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => {
    const qty = parseInt(item.quantity);
    return sum + (isNaN(qty) ? 1 : qty);
  }, 0);
  const badges = document.querySelectorAll('.cart-badge');

  badges.forEach(badge => {
    const parentBtn = badge.closest('.btn-shop-icon');
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = 'flex';
      if (parentBtn) parentBtn.classList.add('cart-animate');
    } else {
      badge.style.display = 'none';
      if (parentBtn) parentBtn.classList.remove('cart-animate');
    }
  });
}

export function addToCart(id, name, price, quantity = 1) {
  let cart = getCart();

  // Robust parsing
  const numericPrice = parseFloat(price) || 0;
  const numericQty = parseInt(quantity) || 1;

  // Check if item already exists in cart to update quantity instead
  const existingIndex = cart.findIndex(item => item.id == id);
  if (existingIndex > -1) {
    cart[existingIndex].quantity = (parseInt(cart[existingIndex].quantity) || 1) + numericQty;
  } else {
    cart.push({ id, name, price: numericPrice, quantity: numericQty });
  }

  saveCart(cart);
  updateCartBadge();
  alert('تمت إضافة ' + name + ' إلى السلة!');
}

export function updateCartQuantity(index, change) {
  const cart = getCart();
  cart[index].quantity = (parseInt(cart[index].quantity) || 1) + change;
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
    const p = parseFloat(item.price) || 0;
    const q = parseInt(item.quantity) || 1;
    subtotal += p * q;
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
                          <button class="quantity-btn" onclick="window.updateCartQuantity(${index}, -1)">-</button>
                          <span class="quantity-value">${item.quantity || 1}</span>
                          <button class="quantity-btn" onclick="window.updateCartQuantity(${index}, 1)">+</button>
                      </div>
                      <button class="remove-btn" onclick="window.removeCartItem(${index})">
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
    const p = parseFloat(item.price) || 0;
    const q = parseInt(item.quantity) || 1;
    subtotal += p * q;
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

// Product Details Helpers
let currentDetailsQty = 1;

export function updateDetailsQty(delta) {
  currentDetailsQty = Math.max(1, currentDetailsQty + delta);
  const qtyEl = document.getElementById('qty');
  if (qtyEl) qtyEl.textContent = currentDetailsQty;
}

export function addDetailsToCart(id, name, price) {
  addToCart(id, name, price, currentDetailsQty);
}

export function selectPaymentMethod(el) {
  document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
  if (el) el.classList.add('active');
}
