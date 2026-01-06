export function initAuth() {
    // Auth - Password Strength
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.password-strength-bar');
    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function () {
            const length = this.value.length;
            if (length === 0) { strengthBar.style.width = '0'; strengthBar.style.background = '#e5e5e5'; }
            else if (length < 6) { strengthBar.style.width = '25%'; strengthBar.style.background = '#EF4444'; }
            else if (length < 10) { strengthBar.style.width = '50%'; strengthBar.style.background = '#F59E0B'; }
            else if (length < 14) { strengthBar.style.width = '75%'; strengthBar.style.background = '#10B981'; }
            else { strengthBar.style.width = '100%'; strengthBar.style.background = '#22C55E'; }
        });
    }
}
