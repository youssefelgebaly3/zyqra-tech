/**
* ZYQRA Main JavaScript
* Consolidated logic for Cart, Search, Auth, and Checkout
*/

/*--------------------------------------------------------------
# Global Variables & State
--------------------------------------------------------------*/
const ZYQRA_STORAGE_KEY = 'zyqra_cart';

const searchItems = [
    { type: 'products', title: 'MotoLock Pro', desc: 'نظام أمان ذكي للدراجات النارية', price: '1,500 ج.م', icon: 'bi-shield-lock' },
    { type: 'products', title: 'Smart Home Kit', desc: 'مجموعة متكاملة للمنزل الذكي', price: '2,500 ج.م', icon: 'bi-house-gear' },
    { type: 'products', title: 'IoT Sensor Pack', desc: 'حساسات ذكية لمراقبة البيئة', price: '800 ج.م', icon: 'bi-cpu' },
    { type: 'products', title: 'ZYQRA Dev Board', desc: 'لوحة تطوير للمبرمجين', price: '350 ج.م', icon: 'bi-motherboard' },
    { type: 'courses', title: 'أساسيات الإلكترونيات', desc: 'تعلم أساسيات الإلكترونيات من الصفر', price: 'مجاني', icon: 'bi-cpu' },
    { type: 'courses', title: 'Embedded Systems', desc: 'دورة شاملة في الأنظمة المدمجة', price: 'مجاني', icon: 'bi-motherboard' },
    { type: 'courses', title: 'IoT - إنترنت الأشياء', desc: 'بناء مشاريع إنترنت الأشياء', price: 'مجاني', icon: 'bi-wifi' },
    { type: 'courses', title: 'برمجة C للمبتدئين', desc: 'أساسيات لغة البرمجة C', price: 'مجاني', icon: 'bi-code-slash' },
];

let currentSearchFilter = 'all';

/*--------------------------------------------------------------
# Shopping Cart Logic
--------------------------------------------------------------*/
function getCart() {
    return JSON.parse(localStorage.getItem(ZYQRA_STORAGE_KEY) || '[]');
}

function saveCart(cart) {
    localStorage.setItem(ZYQRA_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(name, price, quantity = 1) {
    let cart = getCart();
    cart.push({ name, price, quantity });
    saveCart(cart);
    alert('تمت إضافة ' + name + ' إلى السلة!');
}

function updateCartQuantity(index, change) {
    const cart = getCart();
    cart[index].quantity = (cart[index].quantity || 1) + change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    saveCart(cart);
    loadCartPage();
}

function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    loadCartPage();
}

/*--------------------------------------------------------------
# Page Specific Loaders
--------------------------------------------------------------*/

// Cart Page Loader
function loadCartPage() {
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
            <div class="cart-item" data-aos="fade-up">
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
function loadCheckoutPage() {
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

/*--------------------------------------------------------------
# Search Logic
--------------------------------------------------------------*/
function performSearch() {
    const inputEl = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    const noResultsEl = document.getElementById('no-results');
    const countEl = document.getElementById('results-count');

    if (!inputEl || !resultsEl) return;

    const query = inputEl.value.toLowerCase();

    if (!query) {
        resultsEl.innerHTML = '';
        if (noResultsEl) noResultsEl.style.display = 'none';
        if (countEl) countEl.textContent = 'أدخل كلمة للبحث';
        return;
    }

    let filtered = searchItems.filter(item =>
        (currentSearchFilter === 'all' || item.type === currentSearchFilter) &&
        (item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
        resultsEl.innerHTML = '';
        if (noResultsEl) noResultsEl.style.display = 'block';
        if (countEl) countEl.textContent = 'لا توجد نتائج';
        return;
    }

    if (noResultsEl) noResultsEl.style.display = 'none';
    if (countEl) countEl.textContent = `${filtered.length} نتيجة`;

    resultsEl.innerHTML = filtered.map(item => `
        <a href="${item.type === 'products' ? 'product-details.html' : 'course-details.html'}" class="result-card" data-aos="fade-up">
            <div class="result-image"><i class="bi ${item.icon}"></i></div>
            <div class="result-info">
                <span class="result-category">${item.type === 'products' ? 'منتج' : 'دورة'}</span>
                <h3 class="result-title">${item.title}</h3>
                <p class="result-desc">${item.desc}</p>
                <div class="result-price">${item.price}</div>
            </div>
        </a>
    `).join('');
}

function filterSearchResults(filter, btn) {
    currentSearchFilter = filter;
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    performSearch();
}

/*--------------------------------------------------------------
# Product Details Logic
--------------------------------------------------------------*/
let currentDetailsQty = 1;
function updateDetailsQty(delta) {
    currentDetailsQty = Math.max(1, currentDetailsQty + delta);
    const qtyEl = document.getElementById('qty');
    if (qtyEl) qtyEl.textContent = currentDetailsQty;
}

function addDetailsToCart(name, price) {
    addToCart(name, price, currentDetailsQty);
}

/*--------------------------------------------------------------
# UI Helpers & Event Listeners
--------------------------------------------------------------*/
function selectPaymentMethod(el) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    if (el) el.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Cart Page
    if (document.body.classList.contains('cart-page')) {
        loadCartPage();
    }

    // Initialize Checkout Page
    if (document.body.classList.contains('checkout-page')) {
        loadCheckoutPage();
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function (e) {
                e.preventDefault();
                alert('تم استلام طلبك بنجاح! سنتواصل معك قريباً.');
                localStorage.removeItem(ZYQRA_STORAGE_KEY);
                window.location.href = 'index.html';
            });
        }
    }

    // Initialize Search Page
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            performSearch();
        });
    }

    // Auth - Password Strength
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.password-strength-bar');
    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function () {
            const length = this.value.length;
            if (length === 0) { strengthBar.style.width = '0'; strengthBar.style.background = '#e5e5e5'; }
            else if (length < 6) { strengthBar.style.width = '25%'; strengthBar.style.background = '#EF4444'; }
            else if (length < 10) { strengthBar.style.width = '50%'; strengthBar.style.background = '#F59E0B'; }
            else if (length < 14) { strengthBar.style.width = '75%'; strengthBar.style.background = '#10B981'; }
            else { strengthBar.style.width = '100%'; strengthBar.style.background = '#22C55E'; }
        });
    }

    // Initialize Memory Transition
    initMemoryTransition();
});

/*--------------------------------------------------------------
# Memory Transition Logic
--------------------------------------------------------------*/
function initMemoryTransition() {
    // Inject Overlay HTML
    const overlayHtml = `
        <div class="memory-overlay" id="memory-overlay">
            <h1 class="memory-zyqra" id="memory-text"></h1>
            <p class="memory-subtitle">zyqra هتفضل ذكري</p>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHtml);

    const logoLinks = document.querySelectorAll('.logo');
    logoLinks.forEach(logo => {
        logo.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent bubbling just in case
            startMemoryTransition();
        });
    });
}

function startMemoryTransition() {
    const overlay = document.getElementById('memory-overlay');
    const textEl = document.getElementById('memory-text');
    const fullText = "ZYQRA";

    // Reset state
    overlay.classList.add('active');
    overlay.classList.remove('show-subtitle');
    textEl.style.width = '0';
    textEl.textContent = '';

    // Start Animation Sequence
    setTimeout(() => {
        // Typewriter Effect
        let i = 0;
        textEl.style.width = 'auto'; // Allow content to dictate width during typing
        const typeInterval = setInterval(() => {
            if (i < fullText.length) {
                textEl.textContent += fullText.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                // After typing finished, show subtitle
                overlay.classList.add('show-subtitle');

                // Final timeout to restore
                setTimeout(() => {
                    overlay.classList.remove('active');
                }, 4000);
            }
        }, 300); // Speed of typing
    }, 800);
}

