(function () {
    const savedLang = localStorage.getItem('zyqra_lang') || 'ar';
    if (savedLang === 'en') {
        document.documentElement.lang = 'en';
        document.documentElement.dir = 'ltr';
        // Note: For this to work instantly, it must be included in the <head> 
        // immediately after the bootstrap.rtl.min.css link.
        const link = document.querySelector('link[href*="bootstrap.rtl.min.css"]');
        if (link) {
            link.href = link.href.replace('bootstrap.rtl.min.css', 'bootstrap.min.css');
        }
    }
})();
