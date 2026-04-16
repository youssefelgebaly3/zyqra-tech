document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('كلمات المرور غير متطابقة!');
        return;
    }
    
    const formData = new FormData();
    formData.append('name', firstname + ' ' + lastname);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('password_confirm', confirmPassword);
    
    fetch('backend/api/auth/register.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            window.location.href = 'signin.html';
        } else {
            alert(data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    });
});
