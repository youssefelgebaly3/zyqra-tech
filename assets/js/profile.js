/**
 * ZYQRA Profile JavaScript
 * Handles profile tabs and UI animations
 */

(function () {
    "use strict";

    /**
     * Shows the certificates tab using Bootstrap's Tab API
     */
    function showCertificatesTab() {
        const certificatesTab = document.getElementById('certificates-tab');
        if (certificatesTab && typeof bootstrap !== 'undefined') {
            const tab = new bootstrap.Tab(certificatesTab);
            tab.show();
        }
    }

    // Initialize AOS and Profile specific logic
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true
            });
        }
    });

    // Expose functions to window
    window.showCertificatesTab = showCertificatesTab;

})();
