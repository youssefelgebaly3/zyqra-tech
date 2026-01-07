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
                titleEl.textContent = 'الدورات التقنية (Hard Skills)';
            } else {
                titleEl.textContent = 'المهارات الشخصية (Soft Skills)';
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
