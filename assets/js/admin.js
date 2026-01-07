/**
 * ZYQRA Admin Dashboard JavaScript
 * Handles sidebar toggles, section navigation, and UI interactions
 */

(function () {
    "use strict";

    document.addEventListener('DOMContentLoaded', () => {
        // Sidebar Toggle
        const adminSidebar = document.getElementById('adminSidebar');
        const adminMain = document.querySelector('.admin-main');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarToggle = document.getElementById('sidebarToggle');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function () {
                if (window.innerWidth <= 1200) {
                    adminSidebar.classList.toggle('mobile-open');
                    sidebarOverlay.classList.toggle('active');
                } else {
                    adminSidebar.classList.toggle('collapsed');
                    adminMain.classList.toggle('expanded');
                }
            });
        }

        // Close mobile sidebar when clicking overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function () {
                adminSidebar.classList.remove('mobile-open');
                sidebarOverlay.classList.remove('active');
            });
        }

        // Close sidebar when clicking nav items on mobile
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', function () {
                if (window.innerWidth <= 1200) {
                    adminSidebar.classList.remove('mobile-open');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });

        // Section Navigation
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const section = this.dataset.section;
                showSection(section);
            });
        });

        function showSection(sectionId) {
            // Update nav
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.section === sectionId) {
                    item.classList.add('active');
                }
            });

            // Update sections
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        }

        // Status select styling
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', function () {
                this.className = 'status-select ' + this.value;
            });
        });

        // Quantity buttons
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.parentElement.querySelector('.qty-input');
                if (input && parseInt(input.value) > 0) {
                    input.value = parseInt(input.value) - 1;
                }
            });
        });

        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.parentElement.querySelector('.qty-input');
                if (input) {
                    input.value = parseInt(input.value) + 1;
                }
            });
        });
    });
})();
