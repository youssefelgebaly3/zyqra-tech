export function initMemoryTransition() {
    // Inject Overlay HTML
    const overlayHtml = `
        <div class="memory-overlay" id="memory-overlay">
            <h1 class="memory-zyqra" id="memory-text"></h1>
            <p class="memory-subtitle">zyqra هتفضل ذكري</p>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHtml);

    const logoLinks = document.querySelectorAll('.logo');
    logoLinks.forEach(logo => {
        logo.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent bubbling just in case
            startMemoryTransition();
        });
    });
}

export function startMemoryTransition() {
    const overlay = document.getElementById('memory-overlay');
    const textEl = document.getElementById('memory-text');
    const fullText = "ZYQRA";

    // Reset state
    overlay.classList.add('active');
    overlay.classList.remove('show-subtitle');
    textEl.style.width = '0';
    textEl.textContent = '';

    // Start Animation Sequence
    setTimeout(() => {
        // Typewriter Effect
        let i = 0;
        textEl.style.width = 'auto'; // Allow content to dictate width during typing
        const typeInterval = setInterval(() => {
            if (i < fullText.length) {
                textEl.textContent += fullText.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                // After typing finished, show subtitle
                overlay.classList.add('show-subtitle');

                // Final timeout to restore
                setTimeout(() => {
                    overlay.classList.remove('active');
                }, 4000);
            }
        }, 300); // Speed of typing
    }, 800);
}

export function selectPaymentMethod(el) {
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    if (el) el.classList.add('active');
}
