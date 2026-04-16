document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    fetch('backend/api/auth/login.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.redirect;
            } else {
                alert(data.message);
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        });
});
