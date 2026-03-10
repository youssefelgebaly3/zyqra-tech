/**
 * ZYQRA Products JavaScript
 * Handles product search and category filtering
 */

(function () {
    "use strict";

    document.addEventListener('DOMContentLoaded', function () {
        const searchInput = document.getElementById('productSearch');
        const filterButtons = document.querySelectorAll('#categoryFilters button');
        const products = document.querySelectorAll('.product-item');

        // Search Functionality
        if (searchInput) {
            searchInput.addEventListener('keyup', function () {
                const searchTerm = this.value.toLowerCase().trim();
                filterProducts(searchTerm, getActiveFilter());
            });
        }

        // Filter Functionality
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                this.classList.add('active');

                const filterValue = this.getAttribute('data-filter');
                const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

                filterProducts(searchTerm, filterValue);
            });
        });

        /**
         * Returns the currently active category filter
         * @returns {string} - The filter value
         */
        function getActiveFilter() {
            const activeBtn = document.querySelector('#categoryFilters button.active');
            return activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        }

        /**
         * Filters products based on search term and category
         * @param {string} search - The search term
         * @param {string} category - The category filter
         */
        function filterProducts(search, category) {
            products.forEach(product => {
                const titleEl = product.querySelector('.product-title');
                if (!titleEl) return;

                const title = titleEl.textContent.toLowerCase();
                const productCategory = product.getAttribute('data-category');

                const matchesSearch = title.includes(search);
                const matchesCategory = category === 'all' || productCategory === category;

                if (matchesSearch && matchesCategory) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        }
    });

    /**
     * Wishlist Persistence Logic
     */
    const WISHLIST_KEY = 'zyqra_wishlist_products';

    function getWishlist() {
        const saved = localStorage.getItem(WISHLIST_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    function updateWishlist(productId, isActive) {
        let wishlist = getWishlist();
        if (isActive) {
            if (!wishlist.includes(productId)) wishlist.push(productId);
        } else {
            wishlist = wishlist.filter(id => id !== productId);
        }
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }

    function initWishlist() {
        const wishlist = getWishlist();
        const productItems = document.querySelectorAll('.product-item');

        productItems.forEach(item => {
            const productId = item.getAttribute('data-product-id');
            if (productId && wishlist.includes(productId)) {
                const btn = item.querySelector('.btn-wishlist');
                if (btn) {
                    btn.classList.add('active');
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('bi-heart');
                        icon.classList.add('bi-heart-fill');
                    }
                }
            }
        });
    }

    // Initialize Event Listeners on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        // Initial load of wishlist state
        initWishlist();

        // Wishlist toggle logic with persistence
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-wishlist');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();

                const productItem = btn.closest('.product-item');
                const productId = productItem ? productItem.getAttribute('data-product-id') : null;

                btn.classList.toggle('active');
                const isActive = btn.classList.contains('active');
                const icon = btn.querySelector('i');

                if (isActive) {
                    icon.classList.remove('bi-heart');
                    icon.classList.add('bi-heart-fill');
                } else {
                    icon.classList.remove('bi-heart-fill');
                    icon.classList.add('bi-heart');
                }

                if (productId) {
                    updateWishlist(productId, isActive);
                }
            }
        });
    });

})();
