/**
 * ZYQRA Products JavaScript (Enhanced Dynamic Version)
 * Handles AJAX product loading, filtering with robust error handling
 */

(function () {
    "use strict";

    document.addEventListener('DOMContentLoaded', function () {
        const productGrid = document.getElementById('productsGrid');
        const productLoader = document.getElementById('productLoader');
        const searchInput = document.getElementById('productSearch');
        const categoryInputs = document.querySelectorAll('input[name="category"]');
        const priceSlider = document.getElementById('priceRange');
        const priceValue = document.getElementById('priceValue');
        const sortSelect = document.getElementById('sortProducts');

        console.log("ZYQRA Products: initialization started...");

        // Initial Load
        loadProducts();

        // --- Event Listeners ---
        let searchTimeout;
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => loadProducts(), 500);
            });
        }

        categoryInputs.forEach(input => {
            input.addEventListener('change', () => {
                categoryInputs.forEach(i => i.parentElement.classList.remove('active'));
                input.parentElement.classList.add('active');
                loadProducts();
            });
        });

        if (priceSlider) {
            priceSlider.addEventListener('change', () => loadProducts());
            priceSlider.addEventListener('input', (e) => {
                if (priceValue) priceValue.innerText = e.target.value.toLocaleString() + ' ج.م';
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => loadProducts());
        }

        // --- core Function ---
        async function loadProducts() {
            console.log("ZYQRA Products: fetching data...");
            if (productLoader) productLoader.style.display = 'block';
            
            const category = document.querySelector('input[name="category"]:checked')?.value || 'all';
            const price = priceSlider ? priceSlider.value : 5000;
            const search = searchInput ? searchInput.value : '';
            const sort = sortSelect ? sortSelect.value : 'newest';

            const url = `backend/api/shop/products.php?category=${category}&price=${price}&search=${encodeURIComponent(search)}&sort=${sort}`;

            try {
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }

                const result = await response.json();

                if (result.status === 'success') {
                    renderProducts(result.data);
                    if (result.counts) updateCategoryCounts(result.counts);
                } else {
                    throw new Error(result.message || "Unknown API error");
                }
            } catch (error) {
                console.error('ZYQRA Products Error:', error);
                
                // Show error message on the grid
                if (productGrid) {
                    productGrid.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 3rem;"></i>
                            <p class="mt-3">فشل جلب المنتجات. يرجى التأكد من تشغيل ملف الهجرة (Migration).</p>
                            <code class="text-muted d-block small">${error.message}</code>
                            <button class="btn btn-outline-primary mt-3" onclick="location.reload()">إعادة المحاولة</button>
                        </div>
                    `;
                }
            } finally {
                // ALWAYS hide the loader
                if (productLoader) {
                    productLoader.style.display = 'none';
                    console.log("ZYQRA Products: loader hidden.");
                }
            }
        }

        function renderProducts(products) {
            if (!productGrid) return;

            // Remove previous items
            const items = productGrid.querySelectorAll('.product-item, .no-products-msg');
            items.forEach(item => item.remove());

            if (products.length === 0) {
                const noMsg = document.createElement('div');
                noMsg.className = 'col-12 text-center py-5 no-products-msg';
                noMsg.innerHTML = `<i class="bi bi-search" style="font-size: 3rem; color: #ccc;"></i><p class="mt-3 text-muted">عذراً، لم نجد منتجات تطابق بحثك.</p>`;
                productGrid.appendChild(noMsg);
                return;
            }

            products.forEach(p => {
                const productDiv = document.createElement('div');
                productDiv.className = 'col-lg-6 col-md-6 product-item';
                productDiv.setAttribute('data-aos', 'fade-up');
                
                const currentLang = localStorage.getItem('zyqra_lang') || 'ar';
                const getName = (name) => (typeof name === 'string' ? name : (name[currentLang] || name['ar']));
                const getDesc = (desc) => (typeof desc === 'string' ? desc : (desc[currentLang] || desc['ar']));

                const isOutOfStock = parseInt(p.stock) <= 0;
                const stars = generateStars(p.rating);

                // Ensure price is treated as a number
                const displayPrice = isNaN(parseFloat(p.price)) ? 0 : parseFloat(p.price);

                productDiv.innerHTML = `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${p.image_url}" alt="${getName(p.name)}" class="img-fluid" style="width: 100%; height: 250px; object-fit: cover;">
                            ${isOutOfStock ? '<div class="product-badge out-of-stock" style="background: #ef4444; color: white;">' + (currentLang === 'ar' ? 'نفذت الكمية' : 'Out of Stock') + '</div>' : ''}
                            <button class="btn-wishlist" data-id="${p.id}" title="أضف للمفضلة"><i class="bi bi-heart"></i></button>
                        </div>
                        <div class="product-info">
                            <span class="product-category">${getLocalizedCategory(p.category, currentLang)}</span>
                            <h3 class="product-title">${getName(p.name)}</h3>
                            <div class="product-rating">
                                ${stars}
                                <span>(${p.reviews_count}+)</span>
                            </div>
                            <p class="product-desc">${getDesc(p.description)}</p>
                            <div class="product-price-wrapper">
                                <div class="product-price">${displayPrice.toLocaleString()} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}</div>
                            </div>
                            <div class="product-meta">
                                <span><i class="bi bi-box-seam"></i> ${isOutOfStock ? (currentLang === 'ar' ? 'غير متوفر' : 'Out of Stock') : (currentLang === 'ar' ? 'متوفر حالياً' : 'Available Now')}</span>
                                <span><i class="bi bi-shield-check"></i> ${currentLang === 'ar' ? 'ضمان سنة' : '1 Year Warranty'}</span>
                            </div>
                            <div class="d-flex gap-2 w-100 mt-3">
                                <button class="btn-product" ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} 
                                    onclick="addToCart(${p.id}, '${getName(p.name)}', ${displayPrice}, 1, '${p.image_url}')">
                                    <i class="bi bi-cart-plus"></i> ${currentLang === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
                                </button>
                                <a href="product-details.html?id=${p.id}" class="btn-details">
                                    <i class="bi bi-eye"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                productGrid.appendChild(productDiv);
            });
        }

        function generateStars(rating) {
            let html = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.floor(rating)) html += '<i class="bi bi-star-fill text-warning"></i>';
                else if (i - 0.5 <= rating) html += '<i class="bi bi-star-half text-warning"></i>';
                else html += '<i class="bi bi-star text-warning"></i>';
            }
            return html;
        }

        function getLocalizedCategory(cat, lang) {
            const maps = { 
                'security': { 'ar': 'أنظمة الأمان', 'en': 'Security Systems' },
                'iot': { 'ar': 'إنترنت الأشياء', 'en': 'IoT Systems' },
                'smart-home': { 'ar': 'المنزل الذكي', 'en': 'Smart Home' }
            };
            return maps[cat] ? maps[cat][lang] : cat;
        }

        function updateCategoryCounts(counts) {
            const countsMap = {};
            counts.forEach(c => countsMap[c.category] = c.count);
            categoryInputs.forEach(input => {
                const countSpan = input.parentElement.querySelector('.check-count');
                if (countSpan) {
                    if (input.value === 'all') {
                        const total = Object.values(countsMap).reduce((a, b) => parseInt(a) + parseInt(b), 0);
                        countSpan.innerText = total;
                    } else {
                        countSpan.innerText = countsMap[input.value] || 0;
                    }
                }
            });
        }
    });

})();
