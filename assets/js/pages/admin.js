/**
 * ZYQRA Admin Dashboard JavaScript
 * Handles sidebar toggles, section navigation, and UI interactions
 */

(function () {
    "use strict";

    document.addEventListener('DOMContentLoaded', () => {

        // --- ADMIN AUTH CHECK ---
        fetch('backend/api/auth/check_session.php')
            .then(res => res.json())
            .then(data => {
                // Check if user is logged in AND is an admin
                if (data.status === 'error' || data.user_role !== 'admin') {
                    window.location.href = 'index.html';
                } else {
                    // Update admin profile UI
                    const adminNameEl = document.querySelector('.admin-profile span');
                    const adminImgEl = document.querySelector('.admin-profile img');
                    if (adminNameEl) adminNameEl.innerText = data.full_name;
                    if (adminImgEl && data.avatar) adminImgEl.src = data.avatar;

                    // Initial Data Loads
                    loadAdminOrders();
                    loadDashboardStats();
                    loadAdminUsers();
                    loadAdminProducts();
                    loadAdminInventory();
                    loadAdminInventoryHistory();
                    loadAdminMessages();
                    loadAdminSalesCharts();
                }
            })
            .catch(err => {
                window.location.href = 'index.html';
            });

        // Sidebar Toggle
        const adminSidebar = document.getElementById('adminSidebar');
        const adminMain = document.querySelector('.admin-main');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarToggle = document.getElementById('sidebarToggle');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function () {
                if (window.innerWidth <= 1200) {
                    adminSidebar.classList.toggle('mobile-open');
                    sidebarOverlay.classList.toggle('active');
                } else {
                    adminSidebar.classList.toggle('collapsed');
                    adminMain.classList.toggle('expanded');
                }
            });
        }

        // Close mobile sidebar when clicking overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function () {
                adminSidebar.classList.remove('mobile-open');
                sidebarOverlay.classList.remove('active');
            });
        }

        // Close sidebar when clicking nav items on mobile
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', function () {
                if (window.innerWidth <= 1200) {
                    adminSidebar.classList.remove('mobile-open');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });

        // Section Navigation
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', function (e) {
                // Only prevent default if it's an internal # link
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const section = this.dataset.section;
                    window.showSection(section);
                }
            });
        });

        window.showSection = function (sectionId) {
            // Update nav
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
                if (item.dataset.section) item.classList.remove('active');
                if (item.dataset.section === sectionId) {
                    item.classList.add('active');
                }
            });

            // Update sections
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        // Feature: Load Stats
        function loadDashboardStats() {
            fetch('backend/api/admin/get_dashboard_stats.php')
                .then(res => res.json())
                .then(response => {
                    if (response.status === 'success') {
                        const data = response.data;
                        const elUsers = document.getElementById('stat-users');
                        const elOrders = document.getElementById('stat-orders');
                        const elProducts = document.getElementById('stat-products');
                        const elRevenue = document.getElementById('stat-revenue');

                        if (elUsers) elUsers.innerText = data.total_users;
                        if (elOrders) elOrders.innerText = data.total_orders;
                        if (elProducts) elProducts.innerText = data.total_products;
                        if (elRevenue) elRevenue.innerText = parseFloat(data.total_revenue).toLocaleString() + ' ج.م';

                        // Notification Badge
                        const elBadge = document.getElementById('notification-count');
                        if (elBadge) {
                            if (data.new_messages_count > 0) {
                                elBadge.innerText = data.new_messages_count;
                                elBadge.style.display = 'flex';
                            } else {
                                elBadge.style.display = 'none';
                            }
                        }
                    }
                })
                .catch(err => console.error('Failed to load stats', err));
        }

        let allAdminOrders = [];

        // Feature: Load Orders
        function loadAdminOrders() {
            fetch('backend/api/admin/get_orders.php')
                .then(res => res.json())
                .then(data => {
                    const tbody = document.getElementById('admin-orders-body');
                    const recentBody = document.getElementById('admin-recent-orders-body');

                    if (data.status === 'success') {
                        allAdminOrders = data.orders;
                        renderOrdersTable(allAdminOrders);
                        renderRecentOrders(allAdminOrders);
                    } else {
                        if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">خطأ: ${data.message}</td></tr>`;
                        if (recentBody) recentBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">خطأ: ${data.message}</td></tr>`;
                    }
                })
                .catch(err => {
                    console.error(err);
                    const tbody = document.getElementById('admin-orders-body');
                    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">حدث خطأ في الاتصال بالسيرفر</td></tr>';
                });
        }

        function renderOrdersTable(ordersToRender) {
            const tbody = document.getElementById('admin-orders-body');
            if (!tbody) return;

            if (ordersToRender.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">لا توجد طلبات تطابق بحثك</td></tr>';
                return;
            }

            let html = '';
            ordersToRender.forEach((order) => {
                let itemsText = order.items ? order.items.map(i => `${i.product_name} x${i.quantity}`).join('<br>') : 'بدون منتجات';
                const date = new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

                let paymentMethod = 'عند الاستلام';
                let paymentClass = 'cod';
                if (order.payment_method === 'vodafone_cash') { paymentMethod = 'فودافون كاش'; paymentClass = 'vodafone'; }
                if (order.payment_method === 'instapay') { paymentMethod = 'إنستاباي'; paymentClass = 'instapay'; }

                html += `
                    <tr>
                        <td><strong>#ZYQ-${order.id.toString().padStart(6, '0')}</strong></td>
                        <td>${order.customer_name || 'مستخدم غير معروف'}</td>
                        <td style="font-size: 0.9rem;">${itemsText}</td>
                        <td><strong>${parseFloat(order.total).toLocaleString()} ج.م</strong></td>
                        <td><span class="payment-method ${paymentClass}">${paymentMethod}</span></td>
                        <td>${date}</td>
                        <td>
                            <select class="status-select ${order.status}" data-order-id="${order.id}">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>قيد المراجعة</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>جاري التجهيز</option>
                                <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>قيد الشحن</option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>تم التسليم</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                            </select>
                        </td>
                        <td>
                            <a href="https://api.whatsapp.com/send?phone=201033624387&text=${encodeURIComponent('مرحباً، بخصوص الطلب رقم #ZYQ-' + order.id.toString().padStart(6, '0'))}" target="_blank" class="action-btn whatsapp" title="تواصل واتساب"><i class="bi bi-whatsapp"></i></a>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
            bindStatusSelectEvents();
        }

        function renderRecentOrders(allOrders) {
            const recentBody = document.getElementById('admin-recent-orders-body');
            if (!recentBody) return;
            if (allOrders.length === 0) {
                recentBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد طلبات بعد</td></tr>';
                return;
            }
            let recentHtml = '';
            allOrders.slice(0, 5).forEach(order => {
                let itemsText = order.items ? order.items.map(i => `${i.product_name} x${i.quantity}`).join('<br>') : 'بدون منتجات';

                let statusLabel = 'قيد المراجعة';
                if (order.status === 'processing') statusLabel = 'جاري التجهيز';
                if (order.status === 'shipping') statusLabel = 'قيد الشحن';
                if (order.status === 'completed') statusLabel = 'تم التسليم';
                if (order.status === 'cancelled') statusLabel = 'ملغي';

                let statusBadgeClass = order.status;
                if (order.status === 'completed') statusBadgeClass = 'delivered';

                recentHtml += `
                    <tr>
                        <td>#ZYQ-${order.id.toString().padStart(6, '0')}</td>
                        <td>${order.customer_name || 'مستخدم غير معروف'}</td>
                        <td style="font-size: 0.85rem;">${itemsText}</td>
                        <td><strong>${parseFloat(order.total).toLocaleString()} ج.م</strong></td>
                        <td><span class="status-badge ${statusBadgeClass}">${statusLabel}</span></td>
                        <td>
                            <a href="#orders" onclick="showSection('orders')" class="action-btn"><i class="bi bi-eye"></i></a>
                        </td>
                    </tr>
                `;
            });
            recentBody.innerHTML = recentHtml;
        }

        // Feature: Filter & Search
        const orderSearchInput = document.getElementById('order-search-input');
        const orderStatusFilter = document.getElementById('order-status-filter');

        function applyOrderFilters() {
            let filteredOrders = allAdminOrders;
            const searchVal = orderSearchInput ? orderSearchInput.value.toLowerCase().trim() : '';
            const statusVal = orderStatusFilter ? orderStatusFilter.value : '';

            if (statusVal) {
                filteredOrders = filteredOrders.filter(o => o.status === statusVal);
            }

            if (searchVal) {
                filteredOrders = filteredOrders.filter(o => {
                    const orderStr = '#ZYQ-' + o.id.toString().padStart(6, '0');
                    return orderStr.toLowerCase().includes(searchVal) || (o.customer_name && o.customer_name.toLowerCase().includes(searchVal));
                });
            }

            renderOrdersTable(filteredOrders);
        }

        if (orderSearchInput) orderSearchInput.addEventListener('input', applyOrderFilters);
        if (orderStatusFilter) orderStatusFilter.addEventListener('change', applyOrderFilters);

        /** --- User Management Functions --- **/
        let allAdminUsers = [];

        function loadAdminUsers() {
            fetch('backend/api/admin/get_users.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        allAdminUsers = data.users;
                        renderUsersTable(allAdminUsers);
                    } else {
                        const tbody = document.getElementById('admin-users-body');
                        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">خطأ: ${data.message}</td></tr>`;
                    }
                })
                .catch(err => {
                    console.error('Failed to load users', err);
                    const tbody = document.getElementById('admin-users-body');
                    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">حدث خطأ في الاتصال بالسيرفر</td></tr>';
                });
        }

        function renderUsersTable(usersToRender) {
            const tbody = document.getElementById('admin-users-body');
            if (!tbody) return;

            if (usersToRender.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">لا يوجد مستخدمين يطابقون بحثك</td></tr>';
                return;
            }

            let html = '';
            usersToRender.forEach(user => {
                const date = new Date(user.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
                const avatar = user.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=2E86AB&color=fff`;

                html += `
                    <tr>
                        <td>
                            <div class="user-cell">
                                <img src="${avatar}" alt="${user.full_name}">
                                <span>${user.full_name}</span>
                            </div>
                        </td>
                        <td>${user.email}</td>
                        <td>${user.phone || '---'}</td>
                        <td>${date}</td>
                        <td>
                            <select class="role-select" data-user-id="${user.id}">
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مدير</option>
                                <option value="student" ${user.role === 'student' ? 'selected' : ''}>طالب</option>
                                <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>عميل</option>
                                <option value="installer" ${user.role === 'installer' ? 'selected' : ''}>فني تركيب</option>
                            </select>
                        </td>
                        <td>
                            <div class="action-btns">
                                <button class="action-btn danger delete-user-btn" data-user-id="${user.id}" title="حذف المستخدم"><i class="bi bi-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
            bindUserActionEvents();
        }

        function bindUserActionEvents() {
            // Role change
            document.querySelectorAll('.role-select').forEach(select => {
                select.addEventListener('change', function () {
                    const userId = this.getAttribute('data-user-id');
                    const newRole = this.value;

                    if (confirm('هل أنت متأكد من تغيير صلاحيات هذا المستخدم؟')) {
                        fetch('backend/api/admin/update_user_role.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId, role: newRole })
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.status === 'success') {
                                    // Update local state for search/filter consistency
                                    const user = allAdminUsers.find(u => u.id == userId);
                                    if (user) user.role = newRole;
                                } else {
                                    alert('خطأ: ' + data.message);
                                    loadAdminUsers(); // Refresh on fail to reset select
                                }
                            });
                    } else {
                        loadAdminUsers(); // Reset select
                    }
                });
            });

            // Delete user
            document.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const userId = this.getAttribute('data-user-id');
                    if (confirm('⚠️ هل أنت متأكد تماماً من حذف هذا المستخدم؟ لا يمكن تراجع عن هذا الإجراء.')) {
                        fetch('backend/api/admin/delete_user.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId })
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.status === 'success') {
                                    allAdminUsers = allAdminUsers.filter(u => u.id != userId);
                                    renderUsersTable(allAdminUsers);
                                    loadDashboardStats(); // Refresh user count card
                                } else {
                                    alert('خطأ: ' + data.message);
                                }
                            });
                    }
                });
            });
        }

        // Search & Filter for Users
        const userSearchInput = document.getElementById('user-search-input');
        const userRoleFilter = document.getElementById('user-role-filter');

        function applyUserFilters() {
            let filtered = allAdminUsers;
            const searchVal = userSearchInput ? userSearchInput.value.toLowerCase().trim() : '';
            const roleVal = userRoleFilter ? userRoleFilter.value : '';

            if (roleVal) {
                filtered = filtered.filter(u => u.role === roleVal);
            }

            if (searchVal) {
                filtered = filtered.filter(u =>
                    u.full_name.toLowerCase().includes(searchVal) ||
                    u.email.toLowerCase().includes(searchVal) ||
                    (u.phone && u.phone.includes(searchVal))
                );
            }

            renderUsersTable(filtered);
        }

        if (userSearchInput) userSearchInput.addEventListener('input', applyUserFilters);
        if (userRoleFilter) userRoleFilter.addEventListener('change', applyUserFilters);

        // Feature: Update Order Status
        function bindStatusSelectEvents() {
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', function () {
                    const originalClass = this.className;
                    const newStatus = this.value;
                    this.className = 'status-select ' + newStatus;

                    const orderId = this.getAttribute('data-order-id');

                    // Update in database
                    fetch('backend/api/admin/update_order_status.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ order_id: orderId, status: newStatus })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') {
                                // Update local state
                                const order = allAdminOrders.find(o => o.id == orderId);
                                if (order) {
                                    order.status = newStatus;
                                    renderRecentOrders(allAdminOrders);
                                }
                            } else {
                                alert('فشل في تحديث حالة الطلب: ' + data.message);
                                // revert
                                this.className = originalClass;
                                this.value = originalClass.split(' ')[1];
                            }
                        })
                        .catch(err => {
                            console.error('Error updating status', err);
                            alert('حدث خطأ أثناء الاتصال بالسيرفر');
                            this.className = originalClass;
                        });
                });
            });
        }

        // Quantity buttons
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.parentElement.querySelector('.qty-input');
                if (input && parseInt(input.value) > 0) {
                    input.value = parseInt(input.value) - 1;
                }
            });
        });

        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.parentElement.querySelector('.qty-input');
                if (input) {
                    input.value = parseInt(input.value) + 1;
                }
            });
        });
        /** --- Product Management Functions --- **/
        let allAdminProducts = [];
        const productModal = new bootstrap.Modal(document.getElementById('productModal'));

        function loadAdminProducts() {
            fetch('backend/api/admin/get_all_products.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        allAdminProducts = data.products;
                        renderProductsTable(allAdminProducts);
                    } else {
                        const tbody = document.getElementById('admin-products-body');
                        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">خطأ: ${data.message}</td></tr>`;
                    }
                })
                .catch(err => {
                    console.error('Failed to load products', err);
                    const tbody = document.getElementById('admin-products-body');
                    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">حدث خطأ في الاتصال بالسيرفر</td></tr>';
                });
        }

        function renderProductsTable(productsToRender) {
            const tbody = document.getElementById('admin-products-body');
            if (!tbody) return;

            if (productsToRender.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد منتجات تطابق بحثك</td></tr>';
                return;
            }

            let html = '';
            productsToRender.forEach(product => {
                const name = product.name ? product.name.ar : 'بدون اسم';
                const categoryLabel = product.category === 'security' ? 'أمان' : (product.category === 'accessories' ? 'إكسسوارات' : 'أخرى');
                const stockStatus = product.stock > 0 ? `<span class="stock-badge in-stock"><i class="bi bi-check-circle"></i> ${product.stock} قِطعة</span>` : `<span class="stock-badge out-stock"><i class="bi bi-x-circle"></i> نفذ</span>`;
                const statusLabel = product.stock > 0 ? 'نشط' : 'غير نشط';
                const statusBadgeClass = product.stock > 0 ? 'active' : 'inactive';

                html += `
                    <tr>
                        <td>
                            <div class="product-cell">
                                <div class="product-icon">
                                    <img src="${product.image_url}" alt="${name}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                                </div>
                                <div class="product-info">
                                    <span class="product-name">${name}</span>
                                    <span class="product-sku">#ID-${product.id}</span>
                                </div>
                            </div>
                        </td>
                        <td><span class="category-badge">${categoryLabel}</span></td>
                        <td><strong>${parseFloat(product.price).toLocaleString()} ج.م</strong></td>
                        <td>${stockStatus}</td>
                        <td><span class="status-badge ${statusBadgeClass}">${statusLabel}</span></td>
                        <td>
                            <div class="action-btns">
                                <button class="action-btn edit edit-product-btn" data-id="${product.id}" title="تعديل"><i class="bi bi-pencil"></i></button>
                                <button class="action-btn danger delete-product-btn" data-id="${product.id}" title="حذف"><i class="bi bi-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
            bindProductActionEvents();
        }

        function bindProductActionEvents() {
            // Edit Product
            document.querySelectorAll('.edit-product-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const product = allAdminProducts.find(p => p.id == id);
                    if (product) {
                        openProductModal(product);
                    }
                });
            });

            // Delete Product
            document.querySelectorAll('.delete-product-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) {
                        fetch('backend/api/admin/delete_product.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: id })
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.status === 'success') {
                                    allAdminProducts = allAdminProducts.filter(p => p.id != id);
                                    renderProductsTable(allAdminProducts);
                                    loadDashboardStats();
                                } else {
                                    alert('خطأ: ' + data.message);
                                }
                            });
                    }
                });
            });
        }

        // Modal Logic
        const addProductBtn = document.getElementById('open-add-product-modal');
        const productForm = document.getElementById('productForm');

        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => openProductModal());
        }

        function openProductModal(product = null) {
            productForm.reset();
            document.getElementById('product-image-preview').innerHTML = '';

            if (product) {
                document.getElementById('productModalTitle').innerText = 'تعديل منتج';
                document.getElementById('product-id').value = product.id;
                document.getElementById('product-name-ar').value = product.name.ar;
                document.getElementById('product-name-en').value = product.name.en;
                document.getElementById('product-subtitle-ar').value = product.subtitle ? product.subtitle.ar : '';
                document.getElementById('product-subtitle-en').value = product.subtitle ? product.subtitle.en : '';
                document.getElementById('product-description-ar').value = product.description ? product.description.ar : '';
                document.getElementById('product-description-en').value = product.description ? product.description.en : '';
                document.getElementById('product-price').value = product.price;
                document.getElementById('product-old-price').value = product.old_price || '';
                document.getElementById('product-stock').value = product.stock;
                document.getElementById('product-category').value = product.category;
                document.getElementById('product-discount-ar').value = product.discount_label ? product.discount_label.ar : '';
                document.getElementById('product-discount-en').value = product.discount_label ? product.discount_label.en : '';

                if (product.image_url) {
                    document.getElementById('product-image-preview').innerHTML = `<img src="${product.image_url}" style="max-height: 100px; border-radius: 8px;">`;
                }
            } else {
                document.getElementById('productModalTitle').innerText = 'إضافة منتج جديد';
                document.getElementById('product-id').value = '';
            }
            productModal.show();
        }

        if (productForm) {
            productForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const formData = new FormData(this);
                const isEdit = document.getElementById('product-id').value !== '';
                const api = isEdit ? 'backend/api/admin/update_product.php' : 'backend/api/admin/add_product.php';

                const saveBtn = document.getElementById('save-product-btn');
                saveBtn.disabled = true;
                saveBtn.innerText = 'جاري الحفظ...';

                fetch(api, {
                    method: 'POST',
                    body: formData
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'success') {
                            productModal.hide();
                            loadAdminProducts();
                            loadDashboardStats();
                        } else {
                            alert('خطأ: ' + data.message);
                        }
                    })
                    .catch(err => {
                        console.error('Error saving product', err);
                        alert('حدث خطأ أثناء الاتصال بالسيرفر');
                    })
                    .finally(() => {
                        saveBtn.disabled = false;
                        saveBtn.innerText = 'حفظ المنتج';
                    });
            });
        }

        // Search & Filter for Products
        const productSearchInput = document.getElementById('product-search-input');
        const productCategoryFilter = document.getElementById('product-category-filter');

        function applyProductFilters() {
            let filtered = allAdminProducts;
            const searchVal = productSearchInput ? productSearchInput.value.toLowerCase().trim() : '';
            const catVal = productCategoryFilter ? productCategoryFilter.value : '';

            if (catVal) {
                filtered = filtered.filter(p => p.category === catVal);
            }

            if (searchVal) {
                filtered = filtered.filter(p =>
                    (p.name && p.name.ar && p.name.ar.toLowerCase().includes(searchVal)) ||
                    (p.name && p.name.en && p.name.en.toLowerCase().includes(searchVal))
                );
            }

            renderProductsTable(filtered);
        }

        if (productSearchInput) productSearchInput.addEventListener('input', applyProductFilters);
        if (productCategoryFilter) productCategoryFilter.addEventListener('change', applyProductFilters);

        if (productSearchInput) productSearchInput.addEventListener('input', applyProductFilters);
        if (productCategoryFilter) productCategoryFilter.addEventListener('change', applyProductFilters);

        /** --- Inventory Management Functions --- **/
        function loadAdminInventory() {
            fetch('backend/api/admin/get_inventory.php')
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok: ' + res.status);
                    return res.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        // Update Stats
                        if (document.getElementById('inv-total-stock')) document.getElementById('inv-total-stock').innerText = data.stats.total_stock;
                        if (document.getElementById('inv-total-sold')) document.getElementById('inv-total-sold').innerText = data.stats.total_sold;
                        if (document.getElementById('inv-low-stock')) document.getElementById('inv-low-stock').innerText = data.stats.low_stock;
                        if (document.getElementById('inv-out-of-stock')) document.getElementById('inv-out-of-stock').innerText = data.stats.out_of_stock;

                        renderInventoryTable(data.inventory);
                    } else {
                        const tbody = document.getElementById('admin-inventory-body');
                        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">خطأ من السيرفر: ${data.message}</td></tr>`;
                    }
                })
                .catch(err => {
                    console.error('Failed to load inventory', err);
                    const tbody = document.getElementById('admin-inventory-body');
                    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">فشل الاتصال: ${err.message}. تأكد من إنشاء الجداول.</td></tr>`;
                });
        }

        function renderInventoryTable(items) {
            const tbody = document.getElementById('admin-inventory-body');
            if (!tbody) return;

            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">لا يوجد منتجات في المخزون</td></tr>';
                return;
            }

            let html = '';
            items.forEach(item => {
                let statusBadge = '';
                if (item.stock > 10) {
                    statusBadge = '<span class="status-badge in-stock">متاح</span>';
                } else if (item.stock > 0) {
                    statusBadge = '<span class="status-badge low-stock">محدود</span>';
                } else {
                    statusBadge = '<span class="status-badge out-stock">غير متوفر</span>';
                }

                html += `
                    <tr>
                        <td>
                            <div class="product-cell">
                                <div class="product-icon">
                                    <img src="${item.image_url}" alt="${item.name_ar}" style="width: 32px; height: 32px; border-radius: 4px;">
                                </div>
                                <span>${item.name_ar}</span>
                            </div>
                        </td>
                        <td>#ID-${item.id}</td>
                        <td>
                            <div class="quantity-cell">
                                <button class="qty-btn minus" onclick="updateLocalQty(this, -1)"><i class="bi bi-dash"></i></button>
                                <input type="number" value="${item.stock}" class="qty-input" data-id="${item.id}">
                                <button class="qty-btn plus" onclick="updateLocalQty(this, 1)"><i class="bi bi-plus"></i></button>
                            </div>
                        </td>
                        <td>10 قطع</td>
                        <td>اليوم</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="action-btn success save-stock-btn" data-id="${item.id}" title="حفظ"><i class="bi bi-check-lg"></i></button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
            bindInventoryActionEvents();
        }

        window.updateLocalQty = function (btn, change) {
            const input = btn.parentElement.querySelector('.qty-input');
            let val = parseInt(input.value) + change;
            if (val < 0) val = 0;
            input.value = val;
        };

        function bindInventoryActionEvents() {
            document.querySelectorAll('.save-stock-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const input = this.closest('tr').querySelector('.qty-input');
                    const newStock = input.value;

                    this.disabled = true;
                    this.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

                    fetch('backend/api/admin/update_stock.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: id, stock: newStock })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') {
                                loadAdminInventory(); // Refresh everything
                                loadAdminProducts(); // Sync products table too
                            } else {
                                alert('خطأ: ' + data.message);
                            }
                        })
                        .finally(() => {
                            this.disabled = false;
                            this.innerHTML = '<i class="bi bi-check-lg"></i>';
                        });
                });
            });
        }

        /** --- Inventory History Functions --- **/
        function loadAdminInventoryHistory() {
            fetch('backend/api/admin/get_inventory_history.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        renderInventoryHistoryTable(data.history);
                    } else {
                        const tbody = document.getElementById('admin-inventory-history-body');
                        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">خطأ: ${data.message}</td></tr>`;
                    }
                })
                .catch(err => {
                    console.error('Failed to load history', err);
                    const tbody = document.getElementById('admin-inventory-history-body');
                    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center">السجل فارغ أو حدث خطأ</td></tr>`;
                });
        }

        function renderInventoryHistoryTable(history) {
            const tbody = document.getElementById('admin-inventory-history-body');
            if (!tbody) return;

            if (history.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد حركات مخزون مسجلة بعد</td></tr>';
                return;
            }

            let html = '';
            history.forEach(item => {
                const date = new Date(item.date).toLocaleDateString('ar-EG', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                let typeBadge = '';
                if (item.type === 'in') typeBadge = '<span class="movement-badge in">إضافة</span>';
                else if (item.type === 'out') typeBadge = '<span class="movement-badge out">بيع / صادر</span>';
                else typeBadge = '<span class="movement-badge adjustment">تعديل</span>';

                const qtyDisplay = item.quantity > 0 ? `+${item.quantity}` : item.quantity;

                html += `
                    <tr>
                        <td>${date}</td>
                        <td>${item.product_name}</td>
                        <td>${typeBadge}</td>
                        <td><strong>${qtyDisplay}</strong></td>
                        <td>${item.previous_stock}</td>
                        <td>${item.new_stock}</td>
                        <td style="font-size: 0.85rem; color: #666;">${item.notes || '---'}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        }

        /** --- Contact Messages Functions --- **/
        let allAdminMessages = [];

        function loadAdminMessages() {
            fetch('backend/api/admin/get_messages.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        allAdminMessages = data.messages;
                        renderMessagesTable(allAdminMessages);
                    } else {
                        const tbody = document.getElementById('admin-messages-body');
                        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">خطأ: ${data.message}</td></tr>`;
                    }
                })
                .catch(err => {
                    console.error('Failed to load messages', err);
                    const tbody = document.getElementById('admin-messages-body');
                    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">حدث خطأ في الاتصال بالسيرفر</td></tr>';
                });
        }

        function renderMessagesTable(messagesToRender) {
            const tbody = document.getElementById('admin-messages-body');
            if (!tbody) return;

            if (messagesToRender.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد رسائل حالياً</td></tr>';
                return;
            }

            let html = '';
            messagesToRender.forEach(msg => {
                const date = new Date(msg.created_at).toLocaleString('ar-EG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                html += `
                    <tr>
                        <td style="font-size: 0.85rem; color: #666;">${date}</td>
                        <td><strong>${msg.first_name} ${msg.last_name}</strong></td>
                        <td>
                            <div style="font-size: 0.9rem;">${msg.email}</div>
                            <div style="font-size: 0.8rem; color: #888;">${msg.phone || '---'}</div>
                        </td>
                        <td>${msg.subject}</td>
                        <td style="font-size: 0.9rem; max-width: 300px; white-space: normal; line-height: 1.4;">${msg.message}</td>
                        <td>
                            <div class="action-btns">
                                <a href="mailto:${msg.email}" class="action-btn" title="رد بالإيميل"><i class="bi bi-reply"></i></a>
                                <button class="action-btn danger delete-message-btn" data-id="${msg.id}" title="حذف"><i class="bi bi-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
            bindMessageActionEvents();
        }

        function bindMessageActionEvents() {
            document.querySelectorAll('.delete-message-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
                        fetch('backend/api/admin/delete_message.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: id })
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.status === 'success') {
                                    allAdminMessages = allAdminMessages.filter(m => m.id != id);
                                    renderMessagesTable(allAdminMessages);
                                } else {
                                    alert('خطأ: ' + data.message);
                                }
                            });
                    }
                });
            });
        }

        // Search for Messages
        const messageSearchInput = document.getElementById('message-search-input');
        if (messageSearchInput) {
            messageSearchInput.addEventListener('input', function () {
                const searchVal = this.value.toLowerCase().trim();
                const filtered = allAdminMessages.filter(m =>
                    m.first_name.toLowerCase().includes(searchVal) ||
                    m.last_name.toLowerCase().includes(searchVal) ||
                    m.email.toLowerCase().includes(searchVal) ||
                    m.subject.toLowerCase().includes(searchVal) ||
                    m.message.toLowerCase().includes(searchVal)
                );
                renderMessagesTable(filtered);
            });
        }

        /** --- Dashboard Chart Functions --- **/
        function loadAdminSalesCharts() {
            const ctx = document.getElementById('salesChart');
            if (!ctx) return;

            fetch('backend/api/admin/get_sales_stats.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        const stats = data.data;
                        const labels = stats.map(s => s.month_label);
                        const revenueData = stats.map(s => s.revenue);
                        const ordersData = stats.map(s => s.order_count);

                        new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [
                                    {
                                        label: 'الأرباح (ج.م)',
                                        data: revenueData,
                                        backgroundColor: 'rgba(46, 134, 171, 0.7)',
                                        borderColor: '#2E86AB',
                                        borderWidth: 1,
                                        yAxisID: 'y'
                                    },
                                    {
                                        label: 'عدد الطلبات',
                                        data: ordersData,
                                        type: 'line',
                                        borderColor: '#10B981',
                                        backgroundColor: '#10B981',
                                        tension: 0.4,
                                        fill: false,
                                        yAxisID: 'y1'
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                interaction: {
                                    mode: 'index',
                                    intersect: false,
                                },
                                scales: {
                                    y: {
                                        type: 'linear',
                                        display: true,
                                        position: 'left',
                                        title: { display: true, text: 'الأرباح' }
                                    },
                                    y1: {
                                        type: 'linear',
                                        display: true,
                                        position: 'right',
                                        grid: { drawOnChartArea: false },
                                        title: { display: true, text: 'الطلبات' }
                                    }
                                },
                                plugins: {
                                    legend: { position: 'top' }
                                }
                            }
                        });
                    }
                })
                .catch(err => console.error('Failed to load sales stats', err));
        }

    });
})();

