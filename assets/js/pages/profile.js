// Check session and get profile data
fetch('backend/api/auth/check_session.php')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'error') {
            // Not logged in, redirect
            window.location.href = 'signin.html';
        } else {
            // Logged in, update DOM
            document.getElementById('user-name').innerText = data.full_name;
            document.getElementById('user-email').innerText = data.email;

            // Update Avatar if exists
            if (data.avatar) {
                document.getElementById('user-avatar').src = data.avatar;
            }

            // Format created_at to localized Date string
            const joinedDate = new Date(data.created_at);
            if (!isNaN(joinedDate)) {
                const currentLang = localStorage.getItem('zyqra_lang') || 'ar';
                const options = { month: 'long', year: 'numeric' };
                const formatter = new Intl.DateTimeFormat(currentLang === 'ar' ? 'ar-EG' : 'en-US', options);
                document.getElementById('member-since').innerText = formatter.format(joinedDate);
            }

            // Set zeroed out stats for now
            const stats = data.stats || { courses_count: 0, certificates_count: 0, orders_count: 0 };
            document.getElementById('courses-count').innerText = stats.courses_count;
            document.getElementById('certificates-count').innerText = stats.certificates_count;
            document.getElementById('orders-count').innerText = stats.orders_count;

            // Populate Settings Personal Info
            if (document.getElementById('settings-fname')) {
                const nameParts = data.full_name.split(' ');
                document.getElementById('settings-fname').value = nameParts[0] || '';
                document.getElementById('settings-lname').value = nameParts.slice(1).join(' ') || '';
                document.getElementById('settings-email').value = data.email || '';
                document.getElementById('settings-phone').value = data.phone || '';
            }

            // Load My Orders dynamically
            loadMyOrders();
        }
    })
    .catch(err => {
        console.error('Error fetching profile data:', err);
        window.location.href = 'signin.html';
    });

function loadMyOrders() {
    fetch('backend/api/shop/get_orders.php')
        .then(res => res.json())
        .then(data => {
            const ordersContainer = document.querySelector('#orders .orders-list');
            if (data.status === 'success' && ordersContainer) {
                ordersContainer.classList.add('row', 'g-4');
                if (data.orders.length === 0) {
                    ordersContainer.innerHTML = '<div class="col-12"><div class="text-center p-5 text-muted w-100"><i class="bi bi-bag-x fs-1"></i><p class="mt-3">لا توجد طلبات سابقة</p></div></div>';
                    return;
                }

                let html = '';
                data.orders.forEach(order => {
                    const date = new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
                    let itemsHtml = '';
                    if (order.items) {
                        order.items.forEach(item => {
                            itemsHtml += `
                                <div class="d-flex align-items-center mb-3">
                                    <div class="product-img-box ms-4" style="border: 1px solid #eaeaea; border-radius: 8px; padding: 5px; width: 70px; height: 70px; display: flex; justify-content: center; align-items: center; background: #fff; flex-shrink: 0;">
                                        <img src="${item.image_url || 'x'}" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'bi bi-box-seam text-muted\\' style=\\'font-size: 2rem;\\'></i>';" alt="${item.product_name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                    </div>
                                    <div class="flex-grow-1">
                                        <a href="product-details.html?id=${item.product_id}" class="text-decoration-none">
                                            <h6 class="mb-1 fw-bold fs-6" style="color: var(--primary-color); transition: color 0.3s;" onmouseover="this.style.color='var(--accent-color)'" onmouseout="this.style.color='var(--primary-color)'">${item.product_name}</h6>
                                        </a>
                                        <div class="d-flex justify-content-between align-items-center mt-2">
                                            <span class="fw-bold fs-6" style="color: var(--heading-color);">${parseFloat(item.price).toLocaleString()} ج.م</span>
                                            <small class="text-muted" style="background: #f8f9fa; padding: 3px 8px; border-radius: 4px;">الكمية: ${item.quantity}</small>
                                        </div>
                                    </div>
                                </div>
                            `;
                        });
                    }

                    let statusIcon = 'bi-clock-history';
                    let statusText = 'قيد المراجعة';
                    let gradientColors = 'linear-gradient(135deg, #F18F01, #2E86AB)';

                    if (order.status === 'completed') {
                        statusIcon = 'bi-check-circle-fill';
                        statusText = 'تم التسليم';
                        gradientColors = 'linear-gradient(135deg, #10B981, #2E86AB)';
                    }
                    else if (order.status === 'processing') {
                        statusIcon = 'bi-gear';
                        statusText = 'جاري التجهيز';
                        gradientColors = 'linear-gradient(135deg, #2E86AB, #1A1A2E)';
                    }
                    else if (order.status === 'shipping') {
                        statusIcon = 'bi-truck';
                        statusText = 'قيد الشحن';
                        gradientColors = 'linear-gradient(135deg, #F18F01, #1A1A2E)';
                    }
                    else if (order.status === 'cancelled') {
                        statusIcon = 'bi-x-circle-fill';
                        statusText = 'ملغي';
                        gradientColors = 'linear-gradient(135deg, #DC2626, #1A1A2E)';
                    }

                    html += `
                    <div class="col-lg-4 col-md-6">
                        <div class="profile-course-card order-card h-100 d-flex flex-column" style="padding: 0;">
                            <div class="course-content flex-grow-1 d-flex flex-column p-4">
                                <div class="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
                                    <div>
                                        <span class="text-muted small d-block mb-1">رقم الطلب:</span>
                                        <strong dir="ltr" class="fs-6">#ZYQ-${order.id.toString().padStart(6, '0')}</strong>
                                    </div>
                                    <span class="badge" style="background: ${gradientColors}; font-size: 0.8rem; padding: 6px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px;"><i class="bi ${statusIcon}" style="font-size: 1rem; color: white;"></i> ${statusText}</span>
                                </div>
                                
                                <div class="d-flex justify-content-between mb-4">
                                    <span class="text-muted small">التاريخ:</span>
                                    <strong>${date}</strong>
                                </div>
                                
                                <div class="order-items-list mb-3 flex-grow-1">
                                    ${itemsHtml}
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center mb-4 mt-auto pt-3 border-top">
                                    <span class="fw-bold">الإجمالي:</span>
                                    <span class="fs-4 fw-bolder" style="color: var(--heading-color);">${parseFloat(order.total).toLocaleString()} ج.م</span>
                                </div>
                                
                                <a href="https://api.whatsapp.com/send?phone=201033624387&text=${encodeURIComponent('مرحباً، أود الاستفسار عن طلبي رقم ' + order.id.toString().padStart(6, '0'))}" target="_blank" class="btn-continue w-100 text-center justify-content-center mt-auto" style="white-space: nowrap;">
                                    <i class="bi bi-whatsapp"></i> تواصل للدعم
                                </a>
                            </div>
                        </div>
                    </div>`;
                });
                ordersContainer.innerHTML = html;
            }
        })
        .catch(err => console.error("Could not load orders", err));
}
// Personal Info Form Submission
const personalForm = document.getElementById('personal-info-form');
if (personalForm) {
    personalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('fname', document.getElementById('settings-fname').value);
        formData.append('lname', document.getElementById('settings-lname').value);
        formData.append('email', document.getElementById('settings-email').value);
        formData.append('phone', document.getElementById('settings-phone').value);

        fetch('backend/api/user/update_profile.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.status === 'success') {
                    location.reload();
                }
            })
            .catch(err => console.error('Error updating profile:', err));
    });
}

// Password Form Submission
const passwordForm = document.getElementById('password-form');
if (passwordForm) {
    passwordForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        if (newPass !== confirmPass) {
            alert('كلمات المرور الجديدة غير متطابقة!');
            return;
        }

        const formData = new FormData();
        formData.append('current_pass', document.getElementById('current-password').value);
        formData.append('new_pass', newPass);
        formData.append('confirm_pass', confirmPass);

        fetch('backend/api/user/update_password.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.status === 'success') {
                    passwordForm.reset();
                }
            })
            .catch(err => console.error('Error updating password:', err));
    });
}

// Avatar Upload Logic
const changeAvatarBtn = document.getElementById('change-avatar-btn');
const avatarInput = document.getElementById('avatar-input');

if (changeAvatarBtn && avatarInput) {
    changeAvatarBtn.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const formData = new FormData();
            formData.append('avatar', this.files[0]);

            fetch('backend/api/user/update_avatar.php', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    if (data.status === 'success') {
                        document.getElementById('user-avatar').src = data.avatar_url;
                    }
                })
                .catch(err => console.error('Error uploading avatar:', err));
        }
    });
}

// Logout functionality
const logoutBtn = document.querySelector('.btn-logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        window.location.href = 'backend/api/auth/logout.php';
    });
}
