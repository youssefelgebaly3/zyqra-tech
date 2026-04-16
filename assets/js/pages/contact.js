document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.php-email-form');
    const loadingMessage = document.querySelector('.loading');
    const errorMessage = document.querySelector('.error-message');
    const sentMessage = document.querySelector('.sent-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Hide previous messages
            loadingMessage.classList.add('d-block');
            errorMessage.classList.remove('d-block');
            sentMessage.classList.remove('d-block');

            const formData = new FormData(contactForm);
            const data = {
                firstname: formData.get('firstname'),
                lastname: formData.get('lastname'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            try {
                const response = await fetch('backend/api/contact/send.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                loadingMessage.classList.remove('d-block');

                if (result.status === 'success') {
                    sentMessage.classList.add('d-block');
                    contactForm.reset();
                    // Scroll to message
                    sentMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    errorMessage.textContent = result.message || 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.';
                    errorMessage.classList.add('d-block');
                }
            } catch (error) {
                loadingMessage.classList.remove('d-block');
                errorMessage.textContent = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
                errorMessage.classList.add('d-block');
                console.error('Error:', error);
            }
        });
    }
});
