/**
 * ZYQRA Product Details JS - Bilingual Edition
 */

(function () {
    "use strict";

    document.addEventListener('DOMContentLoaded', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const currentLang = localStorage.getItem('zyqra_lang') || 'ar'; // Detect active language
        
        const loader = document.getElementById('detailsLoader');

        if (!productId) {
            window.location.href = 'products.html';
            return;
        }

        fetchProductDetails(productId);

        async function fetchProductDetails(id) {
            try {
                const response = await fetch(`backend/api/shop/product_details.php?id=${id}`);
                const result = await response.json();

                if (result.status === 'success') {
                    populatePage(result.data, currentLang);
                } else {
                    console.error('Product not found');
                    window.location.href = 'products.html';
                }
            } catch (error) {
                console.error('Fetch Error:', error);
            } finally {
                if (loader) loader.style.display = 'none';
            }
        }

        function populatePage(product, lang) {
            // Helper for bilingual fields
            const getVal = (field) => {
                if (!field) return '';
                if (typeof field === 'string') return field;
                return field[lang] || field['ar'] || ''; // Fallback to 'ar'
            };

            // Basic Info
            document.title = `${getVal(product.name)} - ZYQRA`;
            document.getElementById('detailName').innerText = getVal(product.name);
            document.getElementById('detailSubtitle').innerText = getVal(product.subtitle);
            document.getElementById('detailDesc').innerText = getVal(product.description);
            document.getElementById('detailCategory').innerText = getLocalizedCategory(product.category, lang);
            document.getElementById('detailPrice').innerText = parseFloat(product.price).toLocaleString() + (lang === 'ar' ? ' ج.م' : ' EGP');
            
            // Old Price Handling
            const oldPriceEl = document.getElementById('detailOldPrice');
            if (product.old_price) {
                oldPriceEl.innerText = parseFloat(product.old_price).toLocaleString() + (lang === 'ar' ? ' ج.م' : ' EGP');
                oldPriceEl.style.display = 'block';
            } else {
                oldPriceEl.style.display = 'none';
            }

            // Discount Label Handling
            const discountEl = document.getElementById('detailDiscountLabel');
            const discountText = getVal(product.discount_label);
            if (discountText) {
                discountEl.innerText = discountText;
                discountEl.style.display = 'inline-block';
            } else {
                discountEl.style.display = 'none';
            }
            
            const img = document.getElementById('detailImage');
            img.src = product.image_url;

            // Features List (Restoring original icons mapping)
            const featuresList = document.getElementById('detailFeatures');
            const features = product.features ? product.features[lang] : [];
            const icons = ['bi-phone', 'bi-mic', 'bi-bell', 'bi-lock', 'bi-gear', 'bi-shield-check']; // Original icons order
            
            if (features && Array.isArray(features)) {
                featuresList.innerHTML = features.map((f, i) => `
                    <li><i class="bi ${icons[i] || 'bi-check2'}"></i> <span>${f}</span></li>
                `).join('');
            }

            // Specs List (Restoring tab style with custom icons)
            const specsList = document.getElementById('detailSpecs');
            const specs = product.specs ? product.specs[lang] : [];
            
            if (specs && Array.isArray(specs)) {
                specsList.innerHTML = specs.map(s => `
                    <li><i class="bi ${s.icon || 'bi-info-circle'}"></i> 
                        <span><strong>${s.label}:</strong> ${s.value}</span>
                    </li>
                `).join('');
            }

            // FAQ Accordion (Restoring custom icons for each question)
            const faqContainer = document.getElementById('faqContainer');
            const faqAccordion = document.getElementById('faqAccordion');
            const faqs = product.faqs ? (product.faqs[lang] || product.faqs['ar']) : [];

            if (faqs && faqs.length > 0) {
                faqContainer.style.display = 'block';
                faqAccordion.innerHTML = faqs.map((faq, index) => `
                    <div class="accordion-item shadow-sm mb-2 border-0">
                        <h2 class="accordion-header">
                            <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#faq${index}">
                                <i class="bi ${faq.icon || 'bi-patch-question'} me-2"></i> ${faq.q}
                            </button>
                        </h2>
                        <div id="faq${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#faqAccordion">
                            <div class="accordion-body text-muted leading-relaxed">${faq.a}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                faqContainer.style.display = 'none';
            }

            // Set up Add to Cart
            document.getElementById('addToCartBtn').onclick = () => {
                const qty = parseInt(document.getElementById('qty').innerText) || 1;
                if (typeof addToCart === 'function') {
                    addToCart(product.id, getVal(product.name), product.price, qty, product.image_url);
                }
            };
            
            if (typeof AOS !== 'undefined') AOS.refresh();
        }

        function getLocalizedCategory(cat, lang) {
            const dictionary = {
                'security': { 'ar': 'أنظمة الأمان', 'en': 'Security Systems' }
            };
            return dictionary[cat] ? dictionary[cat][lang] : cat;
        }
    });

})();

window.updateDetailsQty = function (change) {
    const qtyElement = document.getElementById('qty');
    let currentQty = parseInt(qtyElement.innerText);
    currentQty += change;
    if (currentQty < 1) currentQty = 1;
    qtyElement.innerText = currentQty;
};
