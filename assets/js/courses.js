/**
 * ZYQRA Courses JavaScript
 * Handles course category filtering and display toggles
 */

(function () {
    "use strict";

    /**
     * Shows courses for a specific category and hides the category selector
     * @param {string} category - The category to display (e.g., 'hard-skills')
     */
    function showCourses(category) {
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

        // Filter items
        const items = document.querySelectorAll('.course-item');
        items.forEach(item => {
            if (item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Scroll to courses
        if (gridEl) {
            gridEl.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Shows the category selector and hides the course grid
     */
    function showCategories() {
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

    // Expose functions to window for HTML inline events
    window.showCourses = showCourses;
    window.showCategories = showCategories;

})();
