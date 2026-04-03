(function () {
    const savedLang = localStorage.getItem('zyqra_lang') || 'ar';

    // Global translation helper
    window.t = function(key, params = {}) {
        const dictionary = {
            ...(window.commonTranslations && window.commonTranslations[savedLang] ? window.commonTranslations[savedLang] : {}),
            ...(window.pageTranslations && window.pageTranslations[savedLang] ? window.pageTranslations[savedLang] : {})
        };
        
        let text = dictionary[key] || key;
        
        // Handle parameters like {name}
        Object.keys(params).forEach(paramKey => {
            text = text.replace(`{${paramKey}}`, params[paramKey]);
        });
        
        return text;
    };

    // 1. Immediately apply basic document attributes
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

    // 2. Early-inject hiding style to prevent the Arabic flash
    if (savedLang === 'en') {
        const style = document.createElement('style');
        style.id = 'lang-hide-fouc';
        style.innerHTML = 'body { opacity: 0 !important; pointer-events: none !important; }';
        document.head.appendChild(style);

        // Fast bootstrap flip
        const link = document.querySelector('link[href*="bootstrap.rtl.min.css"]');
        if (link) {
            link.href = link.href.replace('bootstrap.rtl.min.css', 'bootstrap.min.css');
        }
    }

    // 2. DOM Ready tasks: Apply translations and bind buttons
    document.addEventListener('DOMContentLoaded', () => {
        // Collect translations from global dictionaries loaded in <head>
        const dictionary = {
            ...(window.commonTranslations && window.commonTranslations[savedLang] ? window.commonTranslations[savedLang] : {}),
            ...(window.pageTranslations && window.pageTranslations[savedLang] ? window.pageTranslations[savedLang] : {})
        };

        // Only process translation if English is selected (Arabic is already the hardcoded default in HTML)
        if (savedLang === 'en' && Object.keys(dictionary).length > 0) {
            document.querySelectorAll('[data-i18n], [data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const placeholderKey = el.getAttribute('data-i18n-placeholder');

                if (key && dictionary[key]) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.placeholder = dictionary[key];
                    } else {
                        el.innerHTML = dictionary[key];
                    }
                }

                if (placeholderKey && dictionary[placeholderKey]) {
                    el.placeholder = dictionary[placeholderKey];
                }
            });
        }

        // 3. Reveal the body
        const style = document.getElementById('lang-hide-fouc');
        if (style) style.remove();
        document.body.classList.remove('lang-loading');

        // 4. Attach click event to all language toggle buttons
        const langToggles = document.querySelectorAll('#language-toggle, #language-toggle-mobile');
        langToggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentLang = localStorage.getItem('zyqra_lang') || 'ar';
                const newLang = currentLang === 'ar' ? 'en' : 'ar';
                localStorage.setItem('zyqra_lang', newLang);
                window.location.reload(); 
            });
        });
    });
})();
