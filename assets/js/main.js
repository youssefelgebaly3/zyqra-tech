/**
 * ZYQRA Main JavaScript
 * Consolidated logic for Cart, Search, Auth, and Checkout
 * (Compatible with file:// protocol - No Build Tools Required)
 */

(function () {
  "use strict";

  /*--------------------------------------------------------------
  # Global State & Data
  --------------------------------------------------------------*/
  const ZYQRA_STORAGE_KEY = 'zyqra_cart';

  const searchItems = [
    { type: 'products', title: 'MotoLock', desc: 'نظام أمان ذكي للدراجات النارية', price: '1,000 ج.م', icon: 'bi-shield-lock' },
    { type: 'products', title: 'Smart Home Kit', desc: 'مجموعة متكاملة للمنزل الذكي', price: '2,500 ج.م', icon: 'bi-house-gear' },
    { type: 'products', title: 'IoT Sensor Pack', desc: 'حساسات ذكية لمراقبة البيئة', price: '800 ج.م', icon: 'bi-cpu' },
    { type: 'products', title: 'ZYQRA Dev Board', desc: 'لوحة تطوير للمبرمجين', price: '350 ج.م', icon: 'bi-motherboard' },
    { type: 'courses', title: 'أساسيات الإلكترونيات', desc: 'تعلم أساسيات الإلكترونيات من الصفر', price: 'مجاني', icon: 'bi-cpu' },
    { type: 'courses', title: 'Embedded Systems', desc: 'دورة شاملة في الأنظمة المدمجة', price: 'مجاني', icon: 'bi-motherboard' },
    { type: 'courses', title: 'IoT - إنترنت الأشياء', desc: 'بناء مشاريع إنترنت الأشياء', price: 'مجاني', icon: 'bi-wifi' },
    { type: 'courses', title: 'برمجة C للمبتدئين', desc: 'أساسيات لغة البرمجة C', price: 'مجاني', icon: 'bi-code-slash' },
  ];

  let currentSearchFilter = 'all';
  let currentDetailsQty = 1;

  /*--------------------------------------------------------------
  # Cart Functions
  --------------------------------------------------------------*/

  /*--------------------------------------------------------------
  # Cart Functions
  --------------------------------------------------------------*/
  /*--------------------------------------------------------------
  # Storage Wrapper (Cross-Browser Persistence)
  --------------------------------------------------------------*/
  const StorageWrapper = {
    get: function () {
      try {
        return JSON.parse(localStorage.getItem(ZYQRA_STORAGE_KEY) || '[]');
      } catch (e) {
        // Fallback for Firefox file:// protocol
        try {
          if (window.name && window.name.startsWith('ZYQRA:')) {
            return JSON.parse(window.name.substring(6));
          }
        } catch (err) { }
        return [];
      }
    },
    set: function (data) {
      try {
        localStorage.setItem(ZYQRA_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        // Fallback: Save to window.name
        window.name = 'ZYQRA:' + JSON.stringify(data);
      }
    },
    clear: function () {
      try {
        localStorage.removeItem(ZYQRA_STORAGE_KEY);
      } catch (e) {
        window.name = '';
      }
    }
  };

  /*--------------------------------------------------------------
  # Cart Functions
  --------------------------------------------------------------*/
  function getCart() {
    return StorageWrapper.get();
  }

  function saveCart(cart) {
    StorageWrapper.set(cart);
  }

  function addToCart(id, name, price, quantity = 1, image = null) {
    let cart = getCart();

    // Automatically map image if not provided
    if (!image) {
      if (name === 'MotoLock') image = 'assets/img/products/motolock.png';
      // Add other mappings here as needed
    }

    // Robust parsing
    const numericPrice = parseFloat(price) || 0;
    const numericQty = parseInt(quantity) || 1;

    // Check if item already exists in cart to update quantity instead
    const existingIndex = cart.findIndex(item => item.id == id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity = (parseInt(cart[existingIndex].quantity) || 1) + numericQty;
    } else {
      cart.push({ id, name, price: numericPrice, quantity: numericQty, image });
    }

    saveCart(cart);
    updateCartBadge();
    alert(t('cart_alert_added', { name }));
  }

  function updateCartQuantity(index, change) {
    const cart = getCart();
    cart[index].quantity = (parseInt(cart[index].quantity) || 1) + change;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    saveCart(cart);
    updateCartBadge();
    loadCartPage();
  }

  /**
   * Sanitize cart data on load - fixes corrupted old entries
   * Ensures all items have numeric price and quantity values
   */
  function sanitizeCart() {
    let cart = getCart();
    if (!Array.isArray(cart) || cart.length === 0) return;

    let needsSave = false;
    cart = cart.filter(item => {
      // Remove items without a name (totally corrupted)
      if (!item.name) return false;
      return true;
    }).map(item => {
      const fixedPrice = parseFloat(item.price);
      const fixedQty = parseInt(item.quantity);

      if (isNaN(fixedPrice) || isNaN(fixedQty) || fixedPrice !== item.price || fixedQty !== item.quantity) {
        needsSave = true;
      }

      return {
        id: item.id || null,
        name: item.name,
        price: isNaN(fixedPrice) ? 0 : fixedPrice,
        quantity: (isNaN(fixedQty) || fixedQty < 1) ? 1 : fixedQty,
        image: item.image || null
      };
    });

    if (needsSave || cart.length !== getCart().length) {
      saveCart(cart);
      console.log('ZYQRA: Cart data sanitized.');
    }
  }

  function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartBadge();
    loadCartPage();
  }

  function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => {
      const q = parseInt(item.quantity);
      return sum + (isNaN(q) ? 1 : q);
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

  function loadCartPage() {
    const cartItemsEl = document.getElementById('cart-items');
    const emptyCartEl = document.getElementById('empty-cart');
    const summaryEl = document.getElementById('cart-summary');

    if (!cartItemsEl) return;

    const cart = getCart();

    const cartMainRow = document.querySelector('.row.g-4');

    if (cart.length === 0) {
      if (cartItemsEl) cartItemsEl.innerHTML = '';
      if (emptyCartEl) emptyCartEl.style.display = 'block';
      if (cartMainRow) cartMainRow.style.display = 'none';
      return;
    }

    if (emptyCartEl) emptyCartEl.style.display = 'none';
    if (cartMainRow) cartMainRow.style.display = 'flex';

    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
      const p = parseFloat(item.price) || 0;
      const q = parseInt(item.quantity) || 1;
      subtotal += p * q;
      const itemImage = item.image ?
        `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px; border: 1px solid rgba(var(--primary-rgb), 0.1);">` :
        `<i class="bi bi-box-seam"></i>`;

      html += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        ${itemImage}
                    </div>
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">${p.toLocaleString()} ${t('cart_currency')}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                            <span class="quantity-value">${q}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeCartItem(${index})">
                            <i class="bi bi-trash"></i> ${t('cart_item_remove')}
                        </button>
                    </div>
                </div>
            `;
    });

    cartItemsEl.innerHTML = html;
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const shippingEl = document.getElementById('shipping');

    const shippingFee = 50;

    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString() + ' ' + t('cart_currency');
    if (shippingEl) shippingEl.textContent = shippingFee + ' ' + t('cart_currency');
    if (totalEl) totalEl.textContent = (subtotal + shippingFee).toLocaleString() + ' ' + t('cart_currency');
  }



  /*--------------------------------------------------------------
  # Search Functions
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
  # Product Details Helpers
  --------------------------------------------------------------*/
  function updateDetailsQty(delta) {
    currentDetailsQty = Math.max(1, currentDetailsQty + delta);
    const qtyEl = document.getElementById('qty');
    if (qtyEl) qtyEl.textContent = currentDetailsQty;
  }

  function addDetailsToCart(id, name, price, image = null) {
    addToCart(id, name, price, currentDetailsQty, image);
  }

  function selectPaymentMethod(el) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    if (el) el.classList.add('active');
  }

  /*--------------------------------------------------------------
  # UI & Template Logic
  --------------------------------------------------------------*/
  function initTemplate() {
    // Scroll State
    function toggleScrolled() {
      const selectBody = document.querySelector('body');
      const selectHeader = document.querySelector('#header');
      if (!selectHeader || (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top'))) return;
      window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
    }
    document.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);

    // Mobile Nav
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
    function mobileNavToogle() {
      document.querySelector('body').classList.toggle('mobile-nav-active');
      mobileNavToggleBtn.classList.toggle('bi-list');
      mobileNavToggleBtn.classList.toggle('bi-x');
    }
    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    }

    document.querySelectorAll('#navmenu a').forEach(navmenu => {
      navmenu.addEventListener('click', () => {
        if (document.querySelector('.mobile-nav-active')) {
          mobileNavToogle();
        }
      });
    });

    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
      navmenu.addEventListener('click', function (e) {
        e.preventDefault();
        this.parentNode.classList.toggle('active');
        this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
        e.stopImmediatePropagation();
      });
    });

    // Scroll Top
    let scrollTop = document.querySelector('.scroll-top');
    function toggleScrollTop() {
      if (scrollTop) {
        window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
      }
    }
    if (scrollTop) {
      scrollTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    window.addEventListener('load', toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);

    // AOS Init
    function aosInit() {
      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false });
      }
    }
    window.addEventListener('load', aosInit);

    // GLightbox
    if (typeof GLightbox !== 'undefined') {
      GLightbox({ selector: '.glightbox' });
    }

    // Swiper
    function initSwiper() {
      document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
        let config = JSON.parse(swiperElement.querySelector(".swiper-config").innerHTML.trim());
        if (typeof Swiper !== 'undefined') {
          new Swiper(swiperElement, config);
        }
      });
    }
    window.addEventListener("load", initSwiper);

    // PureCounter
    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    }

    // Pricing Config
    const pricingContainers = document.querySelectorAll('.pricing-toggle-container');
    pricingContainers.forEach(function (container) {
      const pricingSwitch = container.querySelector('.pricing-toggle input[type="checkbox"]');
      const monthlyText = container.querySelector('.monthly');
      const yearlyText = container.querySelector('.yearly');
      if (pricingSwitch) {
        pricingSwitch.addEventListener('change', function () {
          const pricingItems = container.querySelectorAll('.pricing-item');
          if (this.checked) {
            monthlyText.classList.remove('active');
            yearlyText.classList.add('active');
            pricingItems.forEach(item => item.classList.add('yearly-active'));
          } else {
            monthlyText.classList.add('active');
            yearlyText.classList.remove('active');
            pricingItems.forEach(item => item.classList.remove('yearly-active'));
          }
        });
      }
    });

    // FAQ Toggle
    document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle, .faq-item .faq-header').forEach((faqItem) => {
      faqItem.addEventListener('click', () => {
        faqItem.parentNode.classList.toggle('faq-active');
      });
    });
  }

  function initMemoryTransition() {
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
        e.stopPropagation();
        startMemoryTransition();
      });
    });
  }

  function startMemoryTransition() {
    const overlay = document.getElementById('memory-overlay');
    const textEl = document.getElementById('memory-text');
    const fullText = "ZYQRA";
    overlay.classList.add('active');
    overlay.classList.remove('show-subtitle');
    textEl.style.width = '0';
    textEl.textContent = '';
    setTimeout(() => {
      let i = 0;
      textEl.style.width = 'auto';
      const typeInterval = setInterval(() => {
        if (i < fullText.length) {
          textEl.textContent += fullText.charAt(i);
          i++;
        } else {
          clearInterval(typeInterval);
          overlay.classList.add('show-subtitle');
          setTimeout(() => { overlay.classList.remove('active'); }, 4000);
        }
      }, 300);
    }, 800);
  }



  function initAuth() {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.password-strength-bar');
    const strengthContainer = document.querySelector('.password-strength');
    if (passwordInput && strengthBar && strengthContainer) {
      passwordInput.addEventListener('input', function () {
        const length = this.value.length;
        if (length === 0) {
          strengthBar.style.width = '0';
          strengthBar.style.background = '#e5e5e5';
          strengthContainer.classList.remove('active');
        } else {
          strengthContainer.classList.add('active');
          if (length < 6) { strengthBar.style.width = '25%'; strengthBar.style.background = '#EF4444'; }
          else if (length < 10) { strengthBar.style.width = '50%'; strengthBar.style.background = '#F59E0B'; }
          else if (length < 14) { strengthBar.style.width = '75%'; strengthBar.style.background = '#10B981'; }
          else { strengthBar.style.width = '100%'; strengthBar.style.background = '#22C55E'; }
        }
      });
    }
  }

  /*--------------------------------------------------------------
  # Global Auth Check
  --------------------------------------------------------------*/
  function checkAuthGlobal() {
    console.log("ZYQRA: Checking global auth state...");
    
    // Skip if on profile or login/signup to avoid conflicts
    const path = window.location.pathname;
    if (path.includes('profile.html') || path.includes('signin.html') || path.includes('signup.html')) {
        console.log("ZYQRA: On auth-related page, skipping global check.");
        return;
    }

    fetch('backend/api/auth/check_session.php?t=' + new Date().getTime()) // Add timestamp to prevent caching
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          console.log("ZYQRA: User is logged in as " + data.full_name);
          
          // 1. Update Desktop Header
          const authLinksDesktop = document.querySelector('.auth-links');
          if (authLinksDesktop) {
            authLinksDesktop.innerHTML = `
              <a href="profile.html" class="auth-link login">
                  <i class="bi bi-person-circle"></i>
                  <span data-i18n="nav_my_account">حسابي</span>
              </a>
            `;
          }

          // 2. Update Mobile Navigation (Side Menu)
          const sideMenuLinks = document.querySelectorAll('#navmenu ul li a');
          sideMenuLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.includes('signin.html') || href.includes('signup.html'))) {
              if (href.includes('signin.html')) {
                link.setAttribute('href', 'profile.html');
                link.innerHTML = `<i class="bi bi-person-circle me-2"></i> <span data-i18n="nav_my_account">حسابي</span>`;
              } else {
                // Remove the signup link if logged in
                link.parentElement.remove();
              }
            }
          });

          // 3. Apply translations to newly added elements
          if (typeof applyLanguage === 'function') {
            applyLanguage(localStorage.getItem('zyqra_lang') || 'ar');
          }
        } else {
          console.log("ZYQRA: No active session found.");
        }
      })
      .catch(err => console.error('Global Auth Check Error:', err));
  }

  /*--------------------------------------------------------------
  # Initialization & Exposing Globals
  --------------------------------------------------------------*/

  // Expose necessary functions to window for HTML inline events
  window.addToCart = addToCart;
  window.updateCartQuantity = updateCartQuantity;
  window.removeCartItem = removeCartItem;
  window.updateDetailsQty = updateDetailsQty;
  window.addDetailsToCart = addDetailsToCart;
  window.filterSearchResults = filterSearchResults;
  window.selectPaymentMethod = selectPaymentMethod;

  // Run Initialization on Load
  document.addEventListener('DOMContentLoaded', () => {
    sanitizeCart();  // Fix any corrupted cart data first
    initTemplate();
    initAuth();
    initMemoryTransition();
    updateCartBadge();
    checkAuthGlobal();

    if (document.body.classList.contains('cart-page')) loadCartPage();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('keyup', () => performSearch());
    }
  });

})();