/**
 * ZYQRA Courses JavaScript
 * Handles course category filtering and display toggles
 */

(function () {
    "use strict";

    // Track the currently active category (hard-skills or soft-skills)
    let currentCategory = null;

    /**
     * Shows courses for a specific category and hides the category selector
     * @param {string} category - The category to display (e.g., 'hard-skills')
     */
    function showCourses(category) {
        currentCategory = category;

        // Hide categories
        const categoriesEl = document.getElementById('course-categories');
        const elKhairEl = document.getElementById('el-khair');
        if (categoriesEl) categoriesEl.style.display = 'none';
        if (elKhairEl) elKhairEl.style.display = 'none';

        // Show grid
        const gridEl = document.getElementById('courses-grid');
        if (gridEl) gridEl.style.display = 'block';

        // Update Title
        const titleEl = document.getElementById('grid-title');
        if (titleEl) {
            if (category === 'hard-skills') {
                titleEl.innerHTML = '<span class="d-md-none">الدورات التقنية<span class="d-block mt-1" style="font-size: 0.5em; opacity: 0.7; letter-spacing: 1px; font-weight: 600;">Hard Skills</span></span><span class="d-none d-md-inline">الدورات التقنية (Hard Skills)</span>';
            } else {
                titleEl.innerHTML = '<span class="d-md-none">المهارات الشخصية<span class="d-block mt-1" style="font-size: 0.5em; opacity: 0.7; letter-spacing: 1px; font-weight: 600;">Soft Skills</span></span><span class="d-none d-md-inline">المهارات الشخصية (Soft Skills)</span>';
            }
        }

        // Trigger filter to apply search & active filters to the new category
        filterCourses();

        // Scroll to courses
        if (gridEl) {
            gridEl.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Shows the category selector and hides the course grid
     */
    function showCategories() {
        currentCategory = null;

        const gridEl = document.getElementById('courses-grid');
        const categoriesEl = document.getElementById('course-categories');
        const elKhairEl = document.getElementById('el-khair');

        if (gridEl) gridEl.style.display = 'none';
        if (categoriesEl) categoriesEl.style.display = 'block';
        if (elKhairEl) elKhairEl.style.display = 'block';

        if (categoriesEl) {
            categoriesEl.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Filters courses based on active category, search term, and filter pills
     */
    function filterCourses() {
        // If we haven't selected a category yet, do nothing.
        if (!currentCategory) return;

        const searchInput = document.getElementById('courseSearch');
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const courseItems = document.querySelectorAll('.course-item');

        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const activeFilterValue = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

        courseItems.forEach(item => {
            // 1. Force hide if it's not the currently active category!
            if (item.getAttribute('data-category') !== currentCategory) {
                item.style.display = 'none';
                return;
            }

            // 2. Otherwise apply search and filters
            const title = item.querySelector('.course-title').textContent.toLowerCase();
            const desc = item.querySelector('.course-desc').textContent.toLowerCase();
            const level = item.getAttribute('data-level');
            const duration = item.getAttribute('data-duration');

            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);

            let matchesFilter = true;
            if (activeFilterValue !== 'all') {
                matchesFilter = (level === activeFilterValue) || (duration === activeFilterValue);
            }

            if (matchesSearch && matchesFilter) {
                item.style.display = 'block';
                // Small animation reset trick
                item.style.animation = 'none';
                item.offsetHeight; /* trigger reflow */
                item.style.animation = null;
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Wishlist Persistence Logic
     */
    const WISHLIST_KEY = 'zyqra_wishlist';

    function getWishlist() {
        const saved = localStorage.getItem(WISHLIST_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    function updateWishlist(courseId, isActive) {
        let wishlist = getWishlist();
        if (isActive) {
            if (!wishlist.includes(courseId)) wishlist.push(courseId);
        } else {
            wishlist = wishlist.filter(id => id !== courseId);
        }
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }

    function initWishlist() {
        const wishlist = getWishlist();
        const courseItems = document.querySelectorAll('.course-item');

        courseItems.forEach(item => {
            const courseId = item.getAttribute('data-course-id');
            if (wishlist.includes(courseId)) {
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
        const searchInput = document.getElementById('courseSearch');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // Initial load of wishlist state
        initWishlist();

        if (searchInput) {
            searchInput.addEventListener('input', filterCourses);
        }

        if (filterBtns) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filterCourses();
                });
            });
        }

        // Re-adding wishlist toggle logic with persistence
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-wishlist');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();

                const courseItem = btn.closest('.course-item');
                const courseId = courseItem ? courseItem.getAttribute('data-course-id') : null;

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

                if (courseId) {
                    updateWishlist(courseId, isActive);
                }
            }
        });
    });

    // Expose functions to window for HTML inline events
    window.showCourses = showCourses;
    window.showCategories = showCategories;

})();
