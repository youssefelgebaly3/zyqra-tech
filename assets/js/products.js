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

})();
