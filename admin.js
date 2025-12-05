// Lumière Skincare Admin Dashboard
class LumiereAdmin {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('userData')) || null;
        this.currentCategory = 'all';
        this.salesChart = null;
        this.initialize();
    }

    initialize() {
        this.initializeEventListeners();
        this.initializeNavigation();
        this.loadDashboardData();
        this.loadProducts();
        this.loadOrders();
        this.loadUsers();
        this.initializeSalesChart();
        this.updateUserProfile();
    }

    initializeEventListeners() {
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.currentCategory = category;
                this.filterProducts(category);
                
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Search functionality
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.filterProducts(this.currentCategory, e.target.value);
            });
        }

        const orderSearch = document.getElementById('order-search');
        if (orderSearch) {
            orderSearch.addEventListener('input', (e) => {
                this.filterOrders(e.target.value);
            });
        }

        const userSearch = document.getElementById('user-search');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }

        // Order status filter
        const orderStatusFilter = document.getElementById('order-status-filter');
        if (orderStatusFilter) {
            orderStatusFilter.addEventListener('change', (e) => {
                this.filterOrdersByStatus(e.target.value);
            });
        }

        // Analytics period filter
        const analyticsPeriod = document.getElementById('analytics-period');
        if (analyticsPeriod) {
            analyticsPeriod.addEventListener('change', (e) => {
                this.loadAnalyticsData();
            });
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('active');
                }
            });
        }

        // Quick actions
        document.querySelectorAll('.quick-action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const section = card.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Modal events
        this.initializeModals();

        // Event delegation for dynamic buttons
        this.setupEventDelegation();
    }

    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Edit product button
            if (target.closest('.edit-btn')) {
                const button = target.closest('.edit-btn');
                const productId = button.getAttribute('data-id');
                if (productId) {
                    this.editProduct(productId);
                }
                return;
            }
            
            // Delete product button
            if (target.closest('.delete-btn')) {
                const button = target.closest('.delete-btn');
                const productId = button.getAttribute('data-id');
                if (productId) {
                    this.deleteProduct(productId);
                }
                return;
            }
            
            // View order details button
            if (target.closest('.view-order-btn')) {
                const button = target.closest('.view-order-btn');
                const orderNumber = button.getAttribute('data-order');
                if (orderNumber) {
                    this.viewOrderDetails(orderNumber);
                }
                return;
            }
            
            // Update order status button
            if (target.closest('.update-status-btn')) {
                const button = target.closest('.update-status-btn');
                const orderNumber = button.getAttribute('data-order');
                const status = button.getAttribute('data-status');
                if (orderNumber && status) {
                    this.updateOrderStatus(orderNumber, status);
                }
                return;
            }

            // Admin cancel order button
            if (target.closest('.cancel-order-admin-btn')) {
                const button = target.closest('.cancel-order-admin-btn');
                const orderNumber = button.getAttribute('data-order');
                if (orderNumber) {
                    this.cancelOrderAdmin(orderNumber);
                }
                return;
            }
        });
    }

    // NEW: Admin Cancel Order Function
    cancelOrderAdmin(orderNumber) {
        if (!confirm(`Are you sure you want to cancel order #${orderNumber}? This action cannot be undone.`)) {
            return;
        }

        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
        
        if (orderIndex !== -1) {
            // Only allow cancellation for pending or processing orders
            if (orders[orderIndex].status === 'pending' || orders[orderIndex].status === 'processing') {
                orders[orderIndex].status = 'cancelled';
                localStorage.setItem('orderHistory', JSON.stringify(orders));
                
                this.showNotification(`Order #${orderNumber} has been cancelled`, 'success');
                this.loadOrders(); // Refresh the orders list
                this.loadDashboardData(); // Refresh dashboard stats
                this.loadAnalyticsData(); // Refresh analytics
            } else {
                this.showNotification('This order cannot be cancelled at this stage', 'error');
            }
        } else {
            this.showNotification('Order not found', 'error');
        }
    }

    initializeModals() {
        // Add Product Modal
        const addProductBtn = document.getElementById('add-product-btn');
        const cancelAddBtn = document.getElementById('cancel-add-product');
        const closeModalBtns = document.querySelectorAll('.close');

        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showAddProductModal());
        }

        if (cancelAddBtn) {
            cancelAddBtn.addEventListener('click', () => this.closeAddProductModal());
        }

        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Cancel Edit button
        const cancelEditBtn = document.getElementById('cancel-edit-product');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.closeEditProductModal());
        }

        // Form submissions
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        const editProductForm = document.getElementById('edit-product-form');
        if (editProductForm) {
            editProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProduct();
            });
        }

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-link');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                navItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
                
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        this.showSection('dashboard');
    }

    showSection(section) {
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const target = document.getElementById(section);
        if (target) {
            target.classList.add('active');
            this.updateHeaderContent(section);
            
            // Load section-specific data
            switch(section) {
                case 'dashboard':
                    this.loadDashboardData();
                    break;
                case 'product-management':
                    this.loadProducts();
                    break;
                case 'order-management':
                    this.loadOrders();
                    break;
                case 'user-management':
                    this.loadUsers();
                    break;
                case 'analytics':
                    this.loadAnalyticsData();
                    break;
            }
        }
    }

    updateHeaderContent(section) {
        const sectionData = {
            'dashboard': {
                title: 'Dashboard',
                description: 'Welcome to Lumière Admin Panel',
                button: ''
            },
            'product-management': {
                title: 'Product Management',
                description: 'Manage skincare products and inventory',
                button: ''
            },
            'order-management': {
                title: 'Order Management',
                description: 'View and manage customer orders',
                button: ''
            },
            'user-management': {
                title: 'Customer Management',
                description: 'View customer information and order history',
                button: ''
            },
            'analytics': {
                title: 'Analytics',
                description: 'Sales and performance analytics',
                button: ''
            }
        };
        
        const data = sectionData[section] || sectionData['dashboard'];
        const sectionTitle = document.getElementById('section-title');
        const sectionDescription = document.getElementById('section-description');
        const headerActions = document.getElementById('header-actions');
        
        if (sectionTitle) sectionTitle.textContent = data.title;
        if (sectionDescription) sectionDescription.textContent = data.description;
        if (headerActions) headerActions.innerHTML = data.button;

        // Re-attach event listeners for dynamically added buttons
        if (section === 'product-management') {
            const addProductBtn = document.getElementById('add-product-btn');
            if (addProductBtn) {
                addProductBtn.addEventListener('click', () => this.showAddProductModal());
            }
        }
    }

    updateUserProfile() {
        if (this.currentUser) {
            const userAvatar = document.getElementById('current-user-avatar');
            const userName = document.getElementById('current-user-name');
            
            if (userAvatar) {
                userAvatar.textContent = this.currentUser.firstName?.charAt(0) || 'A';
            }
            if (userName) {
                userName.textContent = this.currentUser.firstName || 'Admin';
            }
        }
    }

    // UPDATED: Dashboard Methods to Include Cancelled Orders
    loadDashboardData() {
        const orders = this.getOrders();
        const products = this.getProducts();
        const today = new Date().toDateString();
        
        // Calculate today's revenue from delivered orders only
        const todayRevenue = orders
            .filter(order => {
                const orderDate = new Date(order.date || order.timestamp).toDateString();
                return orderDate === today && order.status === 'delivered';
            })
            .reduce((total, order) => total + (order.total || 0), 0);

        // Count cancelled orders
        const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

        // Update dashboard stats
        const totalOrdersEl = document.getElementById('total-orders');
        const pendingOrdersEl = document.getElementById('pending-orders');
        const revenueTodayEl = document.getElementById('revenue-today');
        const totalProductsEl = document.getElementById('total-products');
        
        if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
        if (pendingOrdersEl) pendingOrdersEl.textContent = orders.filter(order => 
            ['pending', 'processing'].includes(order.status)).length;
        if (revenueTodayEl) revenueTodayEl.textContent = `₱${todayRevenue.toFixed(2)}`;
        if (totalProductsEl) totalProductsEl.textContent = products.length;

        // Load recent activity (include cancelled orders)
        this.loadRecentActivity(orders);
    }

    // UPDATED: Recent Activity to Show Cancellations
    loadRecentActivity(orders) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        const recentOrders = orders
            .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp))
            .slice(0, 5);

        if (recentOrders.length === 0) {
            container.innerHTML = '<div class="empty-state">No recent activity</div>';
            return;
        }

        container.innerHTML = recentOrders.map(order => {
            let activityType = '';
            let icon = '';
            
            switch(order.status) {
                case 'cancelled':
                    activityType = 'Order Cancelled';
                    icon = 'fa-times-circle';
                    break;
                case 'delivered':
                    activityType = 'Order Delivered';
                    icon = 'fa-check-circle';
                    break;
                case 'shipped':
                    activityType = 'Order Shipped';
                    icon = 'fa-shipping-fast';
                    break;
                case 'processing':
                    activityType = 'Order Processing';
                    icon = 'fa-cog';
                    break;
                default:
                    activityType = 'New Order';
                    icon = 'fa-shopping-bag';
            }
            
            return `
                <div class="activity-item">
                    <div class="activity-type ${order.status}">
                        <i class="fas ${icon}"></i>
                        ${activityType} - ${order.status.toUpperCase()}
                    </div>
                    <div class="activity-details">Order #${order.orderNumber} - ${order.customerName || 'Customer'}</div>
                    <div class="activity-time">${new Date(order.date || order.timestamp).toLocaleString()}</div>
                </div>
            `;
        }).join('');
    }

    // Product Management Methods
    loadProducts() {
        const products = this.getProducts();
        this.displayProducts(products);
    }

    getProducts() {
        try {
            // Try to get from skincare store data first
            const skincareStore = JSON.parse(localStorage.getItem('skincare_products'));
            if (skincareStore && skincareStore.products) {
                return skincareStore.products;
            }
            
            // Fallback to sample data or empty array
            return JSON.parse(localStorage.getItem('lumiere_products')) || [];
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    saveProducts(products) {
        try {
            localStorage.setItem('lumiere_products', JSON.stringify(products));
            // Also update the main store if needed
            if (window.store && window.store.products) {
                window.store.products = products;
            }
        } catch (error) {
            console.error('Error saving products:', error);
        }
    }

    displayProducts(products) {
        const container = document.getElementById('products-list');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No Products Found</h3>
                    <p>Get started by adding your first skincare product</p>
                </div>`;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-header">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">₱${product.price.toFixed(2)}</div>
                </div>
                <div class="product-type">${this.formatProductType(product.type)}</div>
                <p class="product-description">${product.description || 'No description available'}</p>
                <div class="product-details">
                    <div class="product-detail"><strong>Skin Types:</strong> ${Array.isArray(product.skinTypes) ? product.skinTypes.join(', ') : product.skinTypes || 'All'}</div>
                    <div class="product-detail"><strong>Concerns:</strong> ${Array.isArray(product.concerns) ? product.concerns.join(', ') : product.concerns || 'N/A'}</div>
                    <div class="product-detail"><strong>Sizes:</strong> ${product.sizes || 'N/A'}</div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm edit-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterProducts(category, searchTerm = '') {
        let products = this.getProducts();
        
        if (category !== 'all') {
            products = products.filter(product => product.type === category);
        }
        
        if (searchTerm) {
            products = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        this.displayProducts(products);
    }

    showAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('add-product-form').reset();
        }
    }

    closeAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveProduct() {
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value) || 0;
        const type = document.getElementById('product-type').value;
        const skinTypes = document.getElementById('product-skin-types').value.split(',').map(s => s.trim()).filter(s => s);
        const concerns = document.getElementById('product-concerns').value.split(',').map(s => s.trim()).filter(s => s);
        const description = document.getElementById('product-description').value.trim();
        const sizes = document.getElementById('product-sizes').value.trim();
        const image = document.getElementById('product-image').value.trim();
        const tags = document.getElementById('product-tags').value.split(',').map(s => s.trim()).filter(s => s);

        if (!name || !type) {
            this.showNotification('Please provide product name and type', 'error');
            return;
        }

        if (price <= 0) {
            this.showNotification('Please enter a valid price', 'error');
            return;
        }
        
        const products = this.getProducts();
        const newProduct = { 
            id: 'product_' + Date.now(),
            name, 
            price, 
            type, 
            skinTypes: skinTypes.length > 0 ? skinTypes : ['all'],
            concerns: concerns.length > 0 ? concerns : ['hydration'],
            description,
            sizes: sizes || '50ml',
            image: image || 'images/default-product.jpg',
            tags: tags.length > 0 ? tags : ['Skincare'],
            reviews: "0",
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        this.saveProducts(products);
        
        this.closeAddProductModal();
        this.loadProducts();
        this.showNotification('Product added successfully!', 'success');
    }

    editProduct(productId) {
        const products = this.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('edit-product-id').value = product.id;
            document.getElementById('edit-product-name').value = product.name;
            document.getElementById('edit-product-price').value = product.price;
            document.getElementById('edit-product-type').value = product.type;
            document.getElementById('edit-product-skin-types').value = Array.isArray(product.skinTypes) ? product.skinTypes.join(', ') : product.skinTypes || '';
            document.getElementById('edit-product-concerns').value = Array.isArray(product.concerns) ? product.concerns.join(', ') : product.concerns || '';
            document.getElementById('edit-product-description').value = product.description || '';
            document.getElementById('edit-product-sizes').value = product.sizes || '';
            document.getElementById('edit-product-image').value = product.image || '';
            document.getElementById('edit-product-tags').value = Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '';
            
            const modal = document.getElementById('edit-product-modal');
            if (modal) {
                modal.style.display = 'flex';
            }
        } else {
            this.showNotification('Product not found', 'error');
        }
    }

    closeEditProductModal() {
        const modal = document.getElementById('edit-product-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateProduct() {
        const productId = document.getElementById('edit-product-id').value;
        const name = document.getElementById('edit-product-name').value.trim();
        const price = parseFloat(document.getElementById('edit-product-price').value) || 0;
        const type = document.getElementById('edit-product-type').value;
        const skinTypes = document.getElementById('edit-product-skin-types').value.split(',').map(s => s.trim()).filter(s => s);
        const concerns = document.getElementById('edit-product-concerns').value.split(',').map(s => s.trim()).filter(s => s);
        const description = document.getElementById('edit-product-description').value.trim();
        const sizes = document.getElementById('edit-product-sizes').value.trim();
        const image = document.getElementById('edit-product-image').value.trim();
        const tags = document.getElementById('edit-product-tags').value.split(',').map(s => s.trim()).filter(s => s);

        if (!name || !type) {
            this.showNotification('Please provide product name and type', 'error');
            return;
        }

        if (price <= 0) {
            this.showNotification('Please enter a valid price', 'error');
            return;
        }
        
        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                name,
                price,
                type,
                skinTypes: skinTypes.length > 0 ? skinTypes : ['all'],
                concerns: concerns.length > 0 ? concerns : ['hydration'],
                description,
                sizes: sizes || '50ml',
                image: image || 'images/default-product.jpg',
                tags: tags.length > 0 ? tags : ['Skincare']
            };
            
            this.saveProducts(products);
            this.closeEditProductModal();
            this.loadProducts();
            this.showNotification('Product updated successfully!', 'success');
        } else {
            this.showNotification('Product not found', 'error');
        }
    }

    deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        let products = this.getProducts();
        const initialLength = products.length;
        products = products.filter(p => p.id !== productId);
        
        if (products.length < initialLength) {
            this.saveProducts(products);
            this.loadProducts();
            this.showNotification('Product deleted successfully!', 'success');
        } else {
            this.showNotification('Product not found', 'error');
        }
    }

    // UPDATED: Order Management Methods with Cancelled Orders
    loadOrders() {
        const orders = this.getOrders();
        this.displayOrders(orders);
    }

    getOrders() {
        try {
            return JSON.parse(localStorage.getItem('orderHistory')) || [];
        } catch (error) {
            console.error('Error loading orders:', error);
            return [];
        }
    }

    displayOrders(orders) {
        const container = document.getElementById('orders-list');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>No Orders Found</h3>
                    <p>No orders have been placed yet</p>
                </div>`;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-info">
                    <div class="order-header">
                        <div class="order-id">Order #${order.orderNumber}</div>
                        <div class="order-status ${order.status}">${order.status.toUpperCase()}</div>
                    </div>
                    <div class="order-details">
                        <div class="order-detail"><strong>Customer:</strong> ${order.customerName}</div>
                        <div class="order-detail"><strong>Email:</strong> ${order.email || 'N/A'}</div>
                        <div class="order-detail"><strong>Date:</strong> ${order.date}</div>
                        <div class="order-detail"><strong>Total:</strong> ₱${order.total.toFixed(2)}</div>
                        <div class="order-detail"><strong>Items:</strong> ${order.items.length} products</div>
                        <div class="order-detail"><strong>Payment:</strong> ${order.paymentMethod}</div>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-primary btn-sm view-order-btn" data-order="${order.orderNumber}">
                        <i class="fas fa-eye"></i> Details
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success btn-sm update-status-btn" data-order="${order.orderNumber}" data-status="processing">
                            Process
                        </button>
                        <button class="btn btn-danger btn-sm cancel-order-admin-btn" data-order="${order.orderNumber}">
                            Cancel
                        </button>
                    ` : ''}
                    ${order.status === 'processing' ? `
                        <button class="btn btn-warning btn-sm update-status-btn" data-order="${order.orderNumber}" data-status="shipped">
                            Ship
                        </button>
                        <button class="btn btn-danger btn-sm cancel-order-admin-btn" data-order="${order.orderNumber}">
                            Cancel
                        </button>
                    ` : ''}
                    ${order.status === 'shipped' ? `
                        <button class="btn btn-success btn-sm update-status-btn" data-order="${order.orderNumber}" data-status="delivered">
                            Deliver
                        </button>
                    ` : ''}
                    ${order.status === 'cancelled' ? `
                        <span class="cancelled-badge">CANCELLED</span>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    filterOrders(searchTerm) {
        let orders = this.getOrders();
        
        if (searchTerm) {
            orders = orders.filter(order => 
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        this.displayOrders(orders);
    }

    filterOrdersByStatus(status) {
        let orders = this.getOrders();
        
        if (status !== 'all') {
            orders = orders.filter(order => order.status === status);
        }
        
        this.displayOrders(orders);
    }

    // UPDATED: Order Details Modal to Show Cancellation Info
    viewOrderDetails(orderNumber) {
        const orders = this.getOrders();
        const order = orders.find(o => o.orderNumber === orderNumber);
        
        if (order) {
            const modal = document.getElementById('order-details-modal');
            const content = document.getElementById('order-details-content');
            
            if (modal && content) {
                const canCancel = order.status === 'pending' || order.status === 'processing';
                
                content.innerHTML = `
                    <div class="order-detail-section">
                        <h4>Order Information</h4>
                        <div class="order-detail"><strong>Order Number:</strong> ${order.orderNumber}</div>
                        <div class="order-detail"><strong>Status:</strong> <span class="order-status ${order.status}">${order.status.toUpperCase()}</span></div>
                        <div class="order-detail"><strong>Date:</strong> ${order.date}</div>
                        <div class="order-detail"><strong>Customer:</strong> ${order.customerName}</div>
                        <div class="order-detail"><strong>Email:</strong> ${order.email || 'N/A'}</div>
                        <div class="order-detail"><strong>Phone:</strong> ${order.phone || 'N/A'}</div>
                        <div class="order-detail"><strong>Payment Method:</strong> ${order.paymentMethod}</div>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4>Shipping Address</h4>
                        <div class="order-detail">${order.shippingAddress}</div>
                    </div>
                    
                    <div class="order-detail-section">
                        <h4>Order Items</h4>
                        <div class="order-items-list">
                            ${order.items.map(item => `
                                <div class="order-item-line">
                                    <span>${item.name} x ${item.quantity}</span>
                                    <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                            <div class="order-total-line">
                                <span>Total:</span>
                                <span>₱${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    ${canCancel ? `
                    <div class="order-detail-section">
                        <h4>Admin Actions</h4>
                        <div class="admin-actions">
                            <button class="btn btn-danger cancel-order-admin-btn" data-order="${order.orderNumber}">
                                <i class="fas fa-times-circle"></i> Cancel Order
                            </button>
                            <p class="admin-note"><small>This will cancel the order and notify the customer.</small></p>
                        </div>
                    </div>
                    ` : ''}

                    ${order.status === 'cancelled' ? `
                    <div class="order-detail-section cancelled-info">
                        <h4><i class="fas fa-exclamation-triangle"></i> Order Cancelled</h4>
                        <p>This order was cancelled and is no longer active.</p>
                    </div>
                    ` : ''}
                `;
                
                modal.style.display = 'flex';
            }
        } else {
            this.showNotification('Order not found', 'error');
        }
    }

    updateOrderStatus(orderNumber, newStatus) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('orderHistory', JSON.stringify(orders));
            this.loadOrders();
            this.loadDashboardData(); // Refresh dashboard stats
            this.loadAnalyticsData(); // Refresh analytics
            this.showNotification(`Order status updated to ${newStatus}`, 'success');
        } else {
            this.showNotification('Order not found', 'error');
        }
    }

    // User Management Methods
    loadUsers() {
        // For now, we'll create sample user data
        const sampleUsers = [
            {
                name: 'Iris Batumbakal',
                email: 'heart@gmail.com',
                orders: 3,
                totalSpent: 1560.00,
                joinDate: '2024-01-15'
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                orders: 1,
                totalSpent: 450.00,
                joinDate: '2024-02-01'
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                orders: 2,
                totalSpent: 890.00,
                joinDate: '2024-01-20'
            }
        ];
        
        this.displayUsers(sampleUsers);
    }

    displayUsers(users) {
        const container = document.getElementById('users-list');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Customers Found</h3>
                    <p>No customer accounts have been created yet</p>
                </div>`;
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="user-card">
                <div class="user-info">
                    <div class="user-avatar-small">${user.name.charAt(0)}</div>
                    <div class="user-details">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="user-stat">
                        <span class="user-stat-value">${user.orders}</span>
                        <span class="user-stat-label">Orders</span>
                    </div>
                    <div class="user-stat">
                        <span class="user-stat-value">₱${user.totalSpent.toFixed(2)}</span>
                        <span class="user-stat-label">Spent</span>
                    </div>
                    <div class="user-stat">
                        <span class="user-stat-value">${this.formatJoinDate(user.joinDate)}</span>
                        <span class="user-stat-label">Member Since</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterUsers(searchTerm) {
        // In a real app, this would filter from the database
        this.loadUsers();
    }

    // Analytics Methods
    loadAnalyticsData() {
        const orders = this.getOrders();
        const products = this.getProducts();
        
        // Update revenue summary
        this.updateRevenueSummary(orders);
        
        // Update sales chart
        this.updateSalesChart(orders);
        
        // Update top products
        this.updateTopProducts(orders, products);
        
        // Update order metrics
        this.updateOrderMetrics(orders);
    }

    initializeSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) {
            console.error('Sales chart canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (this.salesChart) {
            this.salesChart.destroy();
        }

        this.salesChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Daily Revenue (₱)',
                    data: [],
                    borderColor: '#2c2c2c',
                    backgroundColor: 'rgba(44, 44, 44, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#2c2c2c',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#2c2c2c',
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 44, 44, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#2c2c2c',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `Revenue: ₱${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                family: "'Inter', sans-serif"
                            },
                            callback: function(value) {
                                return '₱' + value;
                            }
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear'
                    }
                }
            }
        });

        console.log('Sales chart initialized');
    }

    updateSalesChart(orders) {
        if (!this.salesChart) {
            console.error('Sales chart not initialized');
            return;
        }

        // Generate last 7 days data - only count delivered orders for revenue
        const days = [];
        const revenue = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const dayOrders = orders.filter(order => {
                try {
                    const orderDate = new Date(order.date || order.timestamp);
                    return orderDate.toDateString() === dateString && order.status === 'delivered';
                } catch (error) {
                    console.error('Error parsing order date:', error);
                    return false;
                }
            });
            
            const dayRevenue = dayOrders.reduce((total, order) => total + (order.total || 0), 0);
            
            // Format date for display
            const dayLabel = date.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            days.push(dayLabel);
            revenue.push(dayRevenue);
        }
        
        console.log('Chart data:', { days, revenue });
        
        // Update chart data
        this.salesChart.data.labels = days;
        this.salesChart.data.datasets[0].data = revenue;
        
        // Update chart
        this.salesChart.update('active');
        
        console.log('Sales chart updated with data');
    }

    updateRevenueSummary(orders) {
        const today = new Date().toDateString();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Today's revenue from delivered orders
        const todayRevenue = orders
            .filter(order => {
                try {
                    const orderDate = new Date(order.date || order.timestamp);
                    return orderDate.toDateString() === today && order.status === 'delivered';
                } catch (error) {
                    return false;
                }
            })
            .reduce((total, order) => total + (order.total || 0), 0);
        
        // Weekly revenue
        const weeklyRevenue = orders
            .filter(order => {
                try {
                    const orderDate = new Date(order.date || order.timestamp);
                    return orderDate >= oneWeekAgo && order.status === 'delivered';
                } catch (error) {
                    return false;
                }
            })
            .reduce((total, order) => total + (order.total || 0), 0);
        
        // Monthly revenue
        const monthlyRevenue = orders
            .filter(order => {
                try {
                    const orderDate = new Date(order.date || order.timestamp);
                    return orderDate >= oneMonthAgo && order.status === 'delivered';
                } catch (error) {
                    return false;
                }
            })
            .reduce((total, order) => total + (order.total || 0), 0);
        
        // Total revenue
        const totalRevenue = orders
            .filter(order => order.status === 'delivered')
            .reduce((total, order) => total + (order.total || 0), 0);
        
        console.log('Revenue stats:', { todayRevenue, weeklyRevenue, monthlyRevenue, totalRevenue });
        
        // Update elements
        const todayRevenueEl = document.getElementById('today-revenue');
        const weeklyRevenueEl = document.getElementById('weekly-revenue');
        const monthlyRevenueEl = document.getElementById('monthly-revenue');
        const totalRevenueEl = document.getElementById('total-revenue');
        
        if (todayRevenueEl) todayRevenueEl.textContent = `₱${todayRevenue.toFixed(2)}`;
        if (weeklyRevenueEl) weeklyRevenueEl.textContent = `₱${weeklyRevenue.toFixed(2)}`;
        if (monthlyRevenueEl) monthlyRevenueEl.textContent = `₱${monthlyRevenue.toFixed(2)}`;
        if (totalRevenueEl) totalRevenueEl.textContent = `₱${totalRevenue.toFixed(2)}`;
    }

    updateOrderMetrics(orders) {
        const today = new Date().toDateString();
        
        // Today's orders
        const todayOrders = orders.filter(order => {
            try {
                const orderDate = new Date(order.date || order.timestamp);
                return orderDate.toDateString() === today;
            } catch (error) {
                return false;
            }
        });
        
        // Completed orders for average calculation
        const completedOrders = orders.filter(order => order.status === 'delivered');
        const totalRevenue = completedOrders.reduce((total, order) => total + (order.total || 0), 0);
        const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
        
        // Completion rate (delivered vs total)
        const completionRate = orders.length > 0 ? 
            (completedOrders.length / orders.length) * 100 : 0;

        // Cancellation rate
        const cancelledOrders = orders.filter(order => order.status === 'cancelled');
        const cancellationRate = orders.length > 0 ?
            (cancelledOrders.length / orders.length) * 100 : 0;
        
        console.log('Order metrics:', { 
            todayOrders: todayOrders.length,
            avgOrderValue,
            completionRate,
            cancellationRate,
            totalOrders: orders.length
        });
        
        // Update elements
        const todayOrdersEl = document.getElementById('today-orders');
        const avgOrderValueEl = document.getElementById('avg-order-value');
        const completionRateEl = document.getElementById('completion-rate');
        const totalOrdersEl = document.getElementById('total-orders-count');
        
        if (todayOrdersEl) todayOrdersEl.textContent = todayOrders.length;
        if (avgOrderValueEl) avgOrderValueEl.textContent = `₱${avgOrderValue.toFixed(2)}`;
        if (completionRateEl) completionRateEl.textContent = `${completionRate.toFixed(1)}%`;
        if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    }

    updateTopProducts(orders, products) {
        const container = document.getElementById('top-products-list');
        if (!container) return;

        const productSales = {};
        
        orders.forEach(order => {
            if (order.status === 'delivered') {
                order.items?.forEach(item => {
                    if (!productSales[item.id]) {
                        productSales[item.id] = {
                            id: item.id,
                            name: item.name,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[item.id].quantity += item.quantity || 1;
                    productSales[item.id].revenue += (item.price || 0) * (item.quantity || 1);
                });
            }
        });
        
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        if (topProducts.length === 0) {
            container.innerHTML = '<div class="empty-state">No sales data available</div>';
            return;
        }
        
        container.innerHTML = topProducts.map((product, index) => `
            <div class="top-item-card">
                <div class="top-item-info">
                    <div class="top-item-rank">${index + 1}</div>
                    <div class="top-item-details">
                        <h4>${product.name}</h4>
                        <p>${product.quantity} sold</p>
                    </div>
                </div>
                <div class="top-item-stats">
                    <div class="top-item-sales">₱${product.revenue.toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }

    // Utility Methods
    formatProductType(type) {
        const typeMap = {
            'cleanser': 'Cleanser',
            'moisturizer': 'Moisturizer',
            'serum': 'Serum',
            'sunscreen': 'Sunscreen',
            'treatment': 'Treatment'
        };
        return typeMap[type] || type;
    }

    formatJoinDate(joinDate) {
        if (!joinDate) return 'Recently';
        
        const join = new Date(joinDate);
        const now = new Date();
        const diffTime = Math.abs(now - join);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        
        return join.toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#2c2c2c'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions
function adminLogout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // No authentication check - admin panel is accessible directly
    window.lumiereAdmin = new LumiereAdmin();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    /* Admin Cancelled Order Styles */
    .cancelled-badge {
        background: #f8d7da;
        color: #721c24;
        padding: 0.4rem 0.8rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: 1px solid #f5c6cb;
    }

    .admin-actions {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid #e9ecef;
        margin-top: 1rem;
    }

    .admin-note {
        margin-top: 0.5rem;
        color: #6c757d;
        font-style: italic;
    }

    .cancelled-info {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 6px;
        padding: 1rem;
    }

    .cancelled-info h4 {
        color: #721c24;
        margin-bottom: 0.5rem;
    }

    .cancelled-info p {
        color: #721c24;
        margin: 0;
    }

    /* Activity Item Status Colors */
    .activity-item .activity-type.cancelled {
        color: #dc3545;
    }

    .activity-item .activity-type.delivered {
        color: #28a745;
    }

    .activity-item .activity-type.shipped {
        color: #17a2b8;
    }

    .activity-item .activity-type.processing {
        color: #ffc107;
    }

    .order-status.cancelled {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
`;
document.head.appendChild(style);