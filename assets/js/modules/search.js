const searchItems = [
    { type: 'products', title: 'MotoLock', desc: 'نظام أمان ذكي للدراجات النارية', price: '1,000 ج.م', icon: 'bi-shield-lock' },
    { type: 'products', title: 'Smart Home Kit', desc: 'مجموعة متكاملة للمنزل الذكي', price: '2,500 ج.م', icon: 'bi-house-gear' },
    { type: 'products', title: 'IoT Sensor Pack', desc: 'حساسات ذكية لمراقبة البيئة', price: '800 ج.م', icon: 'bi-cpu' },
    { type: 'products', title: 'ZYQRA Dev Board', desc: 'لوحة تطوير للمبرمجين', price: '350 ج.م', icon: 'bi-motherboard' },
    { type: 'courses', title: 'أساسيات الإلكترونيات', desc: 'تعلم أساسيات الإلكترونيات من الصفر', price: 'مجاني', icon: 'bi-cpu' },
    { type: 'courses', title: 'Embedded Systems', desc: 'دورة شاملة في الأنظمة المدمجة', price: 'مجاني', icon: 'bi-motherboard' },
    { type: 'courses', title: 'IoT - إنترنت الأشياء', desc: 'بناء مشاريع إنترنت الأشياء', price: 'مجاني', icon: 'bi-wifi' },
    { type: 'courses', title: 'برمجة C للمبتدئين', desc: 'أساسيات لغة البرمجة C', price: 'مجاني', icon: 'bi-code-slash' },
];

let currentSearchFilter = 'all';

export function performSearch() {
    const inputEl = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    const noResultsEl = document.getElementById('no-results');
    const countEl = document.getElementById('results-count');

    if (!inputEl || !resultsEl) return;

    const query = inputEl.value.toLowerCase();

    if (!query) {
        resultsEl.innerHTML = '';
        if (noResultsEl) noResultsEl.style.display = 'none';
        if (countEl) countEl.textContent = 'أدخل كلمة للبحث';
        return;
    }

    let filtered = searchItems.filter(item =>
        (currentSearchFilter === 'all' || item.type === currentSearchFilter) &&
        (item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
        resultsEl.innerHTML = '';
        if (noResultsEl) noResultsEl.style.display = 'block';
        if (countEl) countEl.textContent = 'لا توجد نتائج';
        return;
    }

    if (noResultsEl) noResultsEl.style.display = 'none';
    if (countEl) countEl.textContent = `${filtered.length} نتيجة`;

    resultsEl.innerHTML = filtered.map(item => `
        <a href="${item.type === 'products' ? 'product-details.html' : 'course-details.html'}" class="result-card" data-aos="fade-up">
            <div class="result-image"><i class="bi ${item.icon}"></i></div>
            <div class="result-info">
                <span class="result-category">${item.type === 'products' ? 'منتج' : 'دورة'}</span>
                <h3 class="result-title">${item.title}</h3>
                <p class="result-desc">${item.desc}</p>
                <div class="result-price">${item.price}</div>
            </div>
        </a>
    `).join('');
}

export function filterSearchResults(filter, btn) {
    currentSearchFilter = filter;
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    performSearch();
}
