// Sample product data
const sampleData = {
  "products": [
    {
      "id": 1,
      "name": "Centella Ampoule Foam",
      "type": "cleanser",
      "price": 200.00,
      "skinTypes": ["combination", "dry", "sensitive"],
      "concerns": ["acne", "hydration", "brightening"],
      "ingredients": ["Centella", "Hyaluronic Acid", "Ceramides"],
      "description": "Low pH & Daily Foam Cleanser",
      "sizes": "125ml",
      "reviews": "173",
      "tags": ["Low pH", "Gentle"],
      "image": "images/centella-foam.png"
    },
    {
      "id": 2,
      "name": "Centella Cream",
      "type": "moisturizer",
      "price": 450.00,
      "skinTypes": ["dry", "sensitive"],
      "concerns": ["hydration", "aging"],
      "ingredients": ["Centella", "Peptides", "Ceramides"],
      "description": "Lightweight Moisturizing Cream",
      "sizes": "75ml",
      "reviews": "63",
      "tags": ["Lightweight", "Hydrating"],
      "image": "images/centella-cream.png"
    },
    {
      "id": 3,
      "name": "Hyalu-Cica Blue Serum",
      "type": "serum",
      "price": 650.00,
      "skinTypes": ["dry", "combination", "oily"],
      "concerns": ["hydration", "acne"],
      "ingredients": ["Hyaluronic Acid", "Centella", "Peptides"],
      "description": "All-in-one Lightweight Hydrating Serum",
      "sizes": " 50ml",
      "reviews": "29",
      "tags": ["All-in-one", "Lightweight"],
      "image": "images/centella-serum.png"
    },
    {
      "id": 4,
      "name": "Vitamin C Brightening Serum",
      "type": "serum",
      "price": 780.00,
      "skinTypes": ["all"],
      "concerns": ["brightening", "aging"],
      "ingredients": ["Vitamin C", "Ferulic Acid", "Vitamin E"],
      "description": "Powerful antioxidant serum for brightening",
      "sizes": " 50ml",
      "reviews": "142",
      "tags": ["Brightening", "Antioxidant"],
      "image": "images/vitc-serum.png"
    },
    {
      "id": 5,
      "name": "Mineral Sunscreen SPF 50",
      "type": "sunscreen",
      "price": 620.00,
      "skinTypes": ["all", "sensitive"],
      "concerns": ["aging", "hydration"],
      "ingredients": ["Zinc Oxide", "Titanium Dioxide"],
      "description": "Gentle mineral sunscreen protection",
      "sizes": " 100ml",
      "reviews": "88",
      "tags": ["Mineral", "SPF 50"],
      "image": "images/sunscreen-50.png"
    },
    {
      "id": 6,
      "name": "BHA Clarifying Treatment",
      "type": "treatment",
      "price": 550.00,
      "skinTypes": ["oily", "combination"],
      "concerns": ["acne", "brightening"],
      "ingredients": ["Salicylic Acid", "Green Tea"],
      "description": "Exfoliating treatment for clear skin",
      "sizes": " 60ml",
      "reviews": "56",
      "tags": ["Exfoliating", "Clarifying"],
      "image": "images/bha-treat.png"
    }
  ]
};

class SkincareStore {
    constructor() {
        this.products = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        console.log('Initializing SkincareStore...');
        this.loadProducts();
        this.setupEventListeners();
        this.setupLoginForm();
        this.setupProfileEvents();
        this.updateCartCount();
        this.setupCloseButtons();
        
        // Update profile button based on initial login state
        const isLoggedIn = this.isLoggedIn();
        this.updateProfileButton(isLoggedIn);
        console.log('Initial login state:', isLoggedIn);
        
        console.log('SkincareStore initialization complete');
    }

    isLoggedIn() {
        return localStorage.getItem('userLoggedIn') === 'true';
    }

    loadProducts() {
        this.products = sampleData.products;
        this.renderProducts();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchClose').addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Profile button
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                console.log('Profile button clicked');
                this.openProfile();
            });
        }
        
        // Cart button
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCart());
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Filters
        const skinTypeFilter = document.getElementById('skinTypeFilter');
        const concernFilter = document.getElementById('concernFilter');
        const productTypeFilter = document.getElementById('productTypeFilter');
        
        if (skinTypeFilter) skinTypeFilter.addEventListener('change', () => this.filterProducts());
        if (concernFilter) concernFilter.addEventListener('change', () => this.filterProducts());
        if (productTypeFilter) productTypeFilter.addEventListener('change', () => this.filterProducts());

        // Track Orders button
        const trackOrdersBtn = document.getElementById('trackOrdersBtn');
        if (trackOrdersBtn) {
            trackOrdersBtn.addEventListener('click', () => {
                this.openTrackOrdersModal();
            });
        }

        // EVENT DELEGATION FOR CART MODAL
        document.addEventListener('click', (e) => {
            // Continue shopping button in cart modal
            if (e.target.id === 'continueShoppingBtn' || 
                (e.target.closest && e.target.closest('#continueShoppingBtn'))) {
                e.preventDefault();
                console.log('Continue shopping clicked via delegation');
                this.closeAllModals();
            }
            
            // Final continue shopping button in order confirmation
            if (e.target.id === 'finalContinueShoppingBtn' || 
                (e.target.closest && e.target.closest('#finalContinueShoppingBtn'))) {
                e.preventDefault();
                console.log('Final continue shopping clicked via delegation');
                this.completeOrder();
            }

            // Track order lookup button
            if (e.target.id === 'lookupOrderBtn' || e.target.closest('#lookupOrderBtn')) {
                e.preventDefault();
                this.lookupOrder();
            }

            // Cancel order button
            if (e.target.classList.contains('cancel-order-btn')) {
                const orderNumber = e.target.getAttribute('data-order');
                if (orderNumber) {
                    this.cancelOrder(orderNumber);
                }
            }
        });

        console.log('Event listeners setup complete');
    }

    // NEW: Open Track Orders Modal
    openTrackOrdersModal() {
        this.closeAllModals();
        const modal = document.createElement('div');
        modal.id = 'trackOrdersModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Track Your Order</h2>
                <p>Enter your order number and email to view order status</p>
                
                <form id="trackOrderForm">
                    <div class="form-group">
                        <label for="lookupOrderNumber">Order Number</label>
                        <input type="text" id="lookupOrderNumber" placeholder="e.g., GLOW123456" required>
                    </div>
                    <div class="form-group">
                        <label for="lookupEmail">Email Address</label>
                        <input type="email" id="lookupEmail" placeholder="your@email.com" required>
                    </div>
                    <button type="button" class="btn-primary" id="lookupOrderBtn">Track Order</button>
                </form>
                
                <div id="orderLookupResult" style="margin-top: 1.5rem; display: none;"></div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal events
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // NEW: Lookup Order for Guest Users
    lookupOrder() {
        const orderNumber = document.getElementById('lookupOrderNumber').value.trim();
        const email = document.getElementById('lookupEmail').value.trim();
        
        if (!orderNumber || !email) {
            this.showNotification('Please enter both order number and email');
            return;
        }

        const orders = this.loadOrderHistory();
        const order = orders.find(o => 
            o.orderNumber === orderNumber && 
            o.email && o.email.toLowerCase() === email.toLowerCase()
        );

        const resultDiv = document.getElementById('orderLookupResult');
        
        if (order) {
            resultDiv.innerHTML = `
                <div class="order-lookup-result">
                    <h3>Order Found</h3>
                    <div class="order-details">
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></p>
                        <p><strong>Date:</strong> ${order.date}</p>
                        <p><strong>Total:</strong> ₱${order.total.toFixed(2)}</p>
                        <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                    </div>
                    <div class="order-items">
                        <h4>Items:</h4>
                        ${order.items.map(item => `
                            <div class="order-item-line">
                                <span>${item.name} x ${item.quantity}</span>
                                <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${order.status === 'pending' || order.status === 'processing' ? `
                        <div class="order-actions">
                            <button class="btn btn-danger cancel-order-btn" data-order="${order.orderNumber}">
                                Cancel Order
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="order-not-found">
                    <p>Order not found. Please check your order number and email address.</p>
                </div>
            `;
        }
        
        resultDiv.style.display = 'block';
    }

    // NEW: Cancel Order Functionality
    cancelOrder(orderNumber) {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            return;
        }

        const orders = this.loadOrderHistory();
        const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);
        
        if (orderIndex !== -1) {
            // Only allow cancellation for pending or processing orders
            if (orders[orderIndex].status === 'pending' || orders[orderIndex].status === 'processing') {
                orders[orderIndex].status = 'cancelled';
                localStorage.setItem('orderHistory', JSON.stringify(orders));
                
                this.showNotification('Order cancelled successfully');
                
                // Refresh the display
                if (this.isLoggedIn()) {
                    this.renderOrderHistory();
                }
                
                // Close track orders modal if open
                const trackModal = document.getElementById('trackOrdersModal');
                if (trackModal) {
                    trackModal.remove();
                }
            } else {
                this.showNotification('This order cannot be cancelled at this stage');
            }
        } else {
            this.showNotification('Order not found');
        }
    }

    filterProducts() {
        const skinType = document.getElementById('skinTypeFilter').value;
        const concern = document.getElementById('concernFilter').value;
        
        console.log('Filtering products:', { skinType, concern });
        
        let filteredProducts = this.products;
        
        // Filter by skin type
        if (skinType) {
            filteredProducts = filteredProducts.filter(product => 
                product.skinTypes.includes(skinType) || product.skinTypes.includes('all')
            );
        }
        
        // Filter by concern
        if (concern) {
            filteredProducts = filteredProducts.filter(product => 
                product.concerns.includes(concern)
            );
        }
        
        console.log('Filtered products:', filteredProducts.length);
        this.renderProducts(filteredProducts);
    }

    // UPDATED: Save order with email
    saveOrderToHistory(orderNumber, formData, items, total) {
        const history = JSON.parse(localStorage.getItem("orderHistory")) || [];
        
        console.log('Saving order to history:', { orderNumber, history: history });

        const newOrder = {
            orderNumber,
            date: new Date().toLocaleString(),
            items: [...items],
            total,
            shippingAddress: `${formData.address}, ${formData.city}, ${formData.province}, ${formData.zipCode}`,
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email, // Store email for guest lookup
            paymentMethod: this.formatPaymentMethod(formData.paymentMethod),
            status: 'pending' // Default status for new orders
        };

        if (Array.isArray(history)) {
            history.push(newOrder);
            localStorage.setItem("orderHistory", JSON.stringify(history));
            console.log('Order saved successfully to history with status: pending');
        } else {
            console.warn('History was not an array, creating new array');
            localStorage.setItem("orderHistory", JSON.stringify([newOrder]));
        }
    }

    // Load order history
    loadOrderHistory() {
        try {
            const history = JSON.parse(localStorage.getItem("orderHistory"));
            return Array.isArray(history) ? history : [];
        } catch (error) {
            console.error('Error loading order history:', error);
            return [];
        }
    }

    // UPDATED: Render order history in profile modal
    renderOrderHistory() {
        const container = document.getElementById("orderHistoryList");
        if (!container) {
            console.error('Order history container not found');
            return;
        }

        const history = this.loadOrderHistory();
        console.log('Rendering order history:', history);

        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-order-history">
                    <i class="fas fa-receipt"></i>
                    <h3>No Orders Yet</h3>
                    <p>Your order history will appear here</p>
                    <p class="small-text">Don't see your orders? <a href="#" id="trackOrdersBtn" style="color: #2c2c2c; text-decoration: underline;">Track your order here</a></p>
                </div>`;
            
            // Add event listener to track orders button
            setTimeout(() => {
                const trackBtn = document.getElementById('trackOrdersBtn');
                if (trackBtn) {
                    trackBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openTrackOrdersModal();
                    });
                }
            }, 100);
            
            return;
        }

        // Filter orders for current user if logged in
        const userData = JSON.parse(localStorage.getItem('userData'));
        let userOrders = history;
        
        if (userData && userData.email) {
            userOrders = history.filter(order => order.email === userData.email);
        }

        if (userOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-order-history">
                    <i class="fas fa-receipt"></i>
                    <h3>No Orders Found</h3>
                    <p>No orders found for your account</p>
                    <p class="small-text">Looking for guest orders? <a href="#" id="trackOrdersBtn" style="color: #2c2c2c; text-decoration: underline;">Track your order here</a></p>
                </div>`;
            
            setTimeout(() => {
                const trackBtn = document.getElementById('trackOrdersBtn');
                if (trackBtn) {
                    trackBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openTrackOrdersModal();
                    });
                }
            }, 100);
            return;
        }

        container.innerHTML = userOrders.map(order => `
            <div class="order-history-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Order #${order.orderNumber}</h4>
                        <p class="order-date">${order.date}</p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span>
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="item-info">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">Qty: ${item.quantity}</span>
                            </div>
                            <span class="item-price">₱${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <div class="order-total">₱${order.total.toFixed(2)}</div>
                    <div class="order-actions">
                        ${(order.status === 'pending' || order.status === 'processing') ? `
                            <button class="cancel-order-btn" data-order="${order.orderNumber}">
                                Cancel Order
                            </button>
                        ` : ''}
                        <button class="reorder-btn">Reorder</button>
                    </div>
                </div>
            </div>
        `).join("");
    }

    // LOGIN FUNCTIONALITY
    setupLoginForm() {
        console.log('Setting up login form...');
        
        // Login button
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');
        if (loginSubmitBtn) {
            loginSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Sign up button (in login modal)
        const showSignupBtn = document.getElementById('showSignupBtn');
        if (showSignupBtn) {
            showSignupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignupModal();
            });
        }
        
        // Sign up submit button
        const signupSubmitBtn = document.getElementById('signupSubmitBtn');
        if (signupSubmitBtn) {
            signupSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSignUp();
            });
        }
        
        // Show login button (in signup modal)
        const showLoginBtn = document.getElementById('showLoginBtn');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }
        
        // Forgot password button
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordModal();
            });
        }
        
        // Back to login button
        const backToLoginBtn = document.getElementById('backToLoginBtn');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }
        
        // Send reset link button
        const sendResetLinkBtn = document.getElementById('sendResetLinkBtn');
        if (sendResetLinkBtn) {
            sendResetLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
        
        console.log('Login form setup complete');
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Login attempt:', { email, password });
        
        // Basic validation
        if (!email || !password) {
            this.showNotification('Please fill in all fields');
            return;
        }
        
        // Show loading state
        const loginBtn = document.getElementById('loginSubmitBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnSpinner = loginBtn.querySelector('.btn-spinner');
        
        btnText.style.display = 'none';
        btnSpinner.style.display = 'block';
        loginBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Reset button state
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
            loginBtn.disabled = false;
            
            // Save user data (in real app, this would come from backend)
            const userData = {
                firstName: 'Iris',
                lastName: 'Batumbakal',
                email: email,
                phone: '+1 (555) 123-4567'
            };
            
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userLoggedIn', 'true');
            
            this.showNotification('Login successful! Welcome back!');
            this.closeAllModals();
            this.updateProfileButton(true);
            
            // IMPORTANT: Load profile data immediately after login
            this.loadProfileData();
            
            // Clear form
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            
            console.log('Login successful, user data saved:', userData);
        }, 1500);
    }

    handleSignUp() {
        const firstName = document.getElementById('signupFirstName').value;
        const lastName = document.getElementById('signupLastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        console.log('Signup attempt:', { firstName, lastName, email, password, confirmPassword, agreeTerms });
        
        // Basic validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            this.showNotification('Please fill in all fields');
            return;
        }
        
        if (!agreeTerms) {
            this.showNotification('Please agree to the terms and conditions');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            this.showNotification('Password must be at least 8 characters long');
            return;
        }
        
        // Show loading state
        const signupBtn = document.getElementById('signupSubmitBtn');
        const btnText = signupBtn.querySelector('.btn-text');
        const btnSpinner = signupBtn.querySelector('.btn-spinner');
        
        btnText.style.display = 'none';
        btnSpinner.style.display = 'block';
        signupBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Reset button state
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
            signupBtn.disabled = false;
            
            // Save user data
            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: '+1 (555) 123-4567'
            };
            
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userLoggedIn', 'true');
            
            this.showNotification(`Account created successfully! Welcome to Lumière, ${firstName}!`);
            this.closeAllModals();
            this.updateProfileButton(true);
            
            // Clear form
            document.getElementById('signupFirstName').value = '';
            document.getElementById('signupLastName').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('signupConfirmPassword').value = '';
            document.getElementById('agreeTerms').checked = false;
        }, 2000);
    }

    handleForgotPassword() {
        const email = document.getElementById('forgotPasswordEmail').value;
        
        if (!email) {
            this.showNotification('Please enter your email address');
            return;
        }
        
        // Show loading state
        const resetBtn = document.getElementById('sendResetLinkBtn');
        const btnText = resetBtn.querySelector('.btn-text');
        const btnSpinner = resetBtn.querySelector('.btn-spinner');
        
        btnText.style.display = 'none';
        btnSpinner.style.display = 'block';
        resetBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Reset button state
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
            resetBtn.disabled = false;
            
            this.showNotification(`Password reset link sent to ${email}`);
            this.closeAllModals();
            
            // Clear form
            document.getElementById('forgotPasswordEmail').value = '';
        }, 1500);
    }

    openProfile() {
        console.log('Profile button clicked - current login state:', this.isLoggedIn());
        if (this.isLoggedIn()) {
            console.log('User is logged in, opening profile modal');
            this.openProfileModal();
        } else {
            console.log('User is not logged in, opening login modal');
            this.openLoginModal();
        }
    }

    openProfileModal() {
        this.closeAllModals();
        const modal = document.getElementById("profileModal");
        modal.style.display = "block";

        // Always load fresh data when opening profile
        this.loadProfileData();
        this.renderOrderHistory();
        console.log('Profile modal opened with fresh data');
    }

    openLoginModal() {
        console.log('Opening login modal');
        this.closeAllModals();
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'block';
        } else {
            console.error('Login modal not found in DOM');
        }
    }

    closeAllModals() {
        console.log('Closing all modals');
        const modals = ['loginModal', 'signupModal', 'forgotPasswordModal', 'profileModal', 'cartModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    clearFilters() {
        document.getElementById('skinTypeFilter').value = '';
        document.getElementById('concernFilter').value = '';
        this.renderProducts();
    }

    loadProfileData() {
        try {
            // Load user data from localStorage or use defaults
            const userData = JSON.parse(localStorage.getItem('userData')) || {
                firstName: 'Iris',
                lastName: 'Batumbakal',
                email: 'heart@gmail.com',
                phone: '+1 (555) 123-4567'
            };
            
            console.log('Loading profile data:', userData);
            
            // Update profile display with correct IDs
            const userNameElement = document.getElementById('profileUserName');
            const userEmailElement = document.getElementById('profileUserEmail');
            const userEmailDetailElement = document.getElementById('profileUserEmailDetail');
            const userPhoneElement = document.getElementById('profileUserPhone');
            
            if (userNameElement) userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
            if (userEmailElement) userEmailElement.textContent = userData.email;
            if (userEmailDetailElement) userEmailDetailElement.textContent = userData.email;
            if (userPhoneElement) userPhoneElement.textContent = userData.phone;
            
            console.log('Profile data loaded successfully');
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    }

    handleLogout() {
        console.log('Logging out user');
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userData');
        this.showNotification('You have been logged out');
        this.closeAllModals();
        this.updateProfileButton(false);
        
        // Clear any profile data from the UI
        document.getElementById('profileUserName').textContent = 'User Name';
        document.getElementById('profileUserEmail').textContent = 'user@email.com';
        document.getElementById('profileUserEmailDetail').textContent = 'user@email.com';
        document.getElementById('profileUserPhone').textContent = '+1 (555) 123-4567';
        
        console.log('Logout completed');
    }

    setupProfileEvents() {
        console.log('Setting up profile events');
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
            console.log('Logout button event listener added');
        } else {
            console.warn('Logout button not found');
        }
        
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openEditProfileModal();
            });
        }
        
        // Add address button
        const addAddressBtn = document.querySelector('.add-address-btn');
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Add address feature coming soon!');
            });
        }
        
        // Profile modal close button
        const profileCloseBtn = document.querySelector('#profileModal .close');
        if (profileCloseBtn) {
            profileCloseBtn.addEventListener('click', () => {
                this.closeProfileModal();
            });
        }
    }

    openEditProfileModal() {
        this.closeAllModals();
        
        const userData = JSON.parse(localStorage.getItem('userData')) || {
            firstName: 'Iris',
            lastName: 'Batumbakal',
            email: 'heart@gmail.com',
            phone: '+1 (555) 123-4567'
        };

        const modal = document.createElement('div');
        modal.id = 'editProfileModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Edit Profile</h2>
                
                <form id="editProfileForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editFirstName">First Name</label>
                            <input type="text" id="editFirstName" name="firstName" value="${userData.firstName}" required>
                        </div>
                        <div class="form-group">
                            <label for="editLastName">Last Name</label>
                            <input type="text" id="editLastName" name="lastName" value="${userData.lastName}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" name="email" value="${userData.email}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editPhone">Phone</label>
                        <input type="tel" id="editPhone" name="phone" value="${userData.phone}" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancelEditBtn">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupEditProfileEvents();
    }

    setupEditProfileEvents() {
        const modal = document.getElementById('editProfileModal');
        
        // Close button
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Cancel button
        const cancelBtn = document.getElementById('cancelEditBtn');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Form submission
        const form = document.getElementById('editProfileForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfileChanges();
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveProfileChanges() {
        const formData = {
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value
        };
        
        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email) {
            this.showNotification('Please fill in all required fields');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(formData));
        
        // Close modal and show success message
        document.getElementById('editProfileModal').remove();
        this.showNotification('Profile updated successfully!');
        
        // Reload profile data if profile modal is open
        this.loadProfileData();
    }

    updateProfileButton(isLoggedIn) {
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            if (isLoggedIn) {
                profileBtn.innerHTML = '<i class="fas fa-user-check"></i>';
                profileBtn.title = 'My Account';
                console.log('Profile button updated to logged in state');
            } else {
                profileBtn.innerHTML = '<i class="fas fa-user"></i>';
                profileBtn.title = 'Login';
                console.log('Profile button updated to logged out state');
            }
        } else {
            console.error('Profile button not found');
        }
    }

    closeProfileModal() {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.style.display = 'none';
        }
    }

    // SEARCH FUNCTIONALITY
    toggleSearch() {
        const searchBar = document.getElementById('searchBar');
        searchBar.classList.toggle('active');
        
        if (searchBar.classList.contains('active')) {
            document.getElementById('searchInput').focus();
        } else {
            document.getElementById('searchInput').value = '';
            this.renderProducts();
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.renderProducts();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm)) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        this.renderProducts(filtered);
    }

    setupCloseButtons() {
        // Close modals when clicking X - use event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                console.log('Close button clicked via delegation');
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                console.log('Modal background clicked');
                e.target.style.display = 'none';
            }
        });
    }

    // UPDATED CART FUNCTIONALITY
    addToCart(productId) {
        console.log('Adding to cart:', productId);
        
        const product = this.products.find(p => p.id === productId);
        
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }

        // Check if item already in cart
        const existingItemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex > -1) {
            // Update quantity if item exists
            this.cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item to cart
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        // Save to localStorage and update UI
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`Added ${product.name} to cart!`);
        
        console.log('Cart updated:', this.cart);
    }

    // AUTH MODAL FUNCTIONS
    openLoginModal() {
        this.closeAllModals();
        document.getElementById('loginModal').style.display = 'block';
        console.log('Login modal opened');
    }

    showSignupModal() {
        this.closeAllModals();
        document.getElementById('signupModal').style.display = 'block';
        console.log('Signup modal opened');
    }

    showForgotPasswordModal() {
        this.closeAllModals();
        document.getElementById('forgotPasswordModal').style.display = 'block';
        console.log('Forgot password modal opened');
    }

    // PRODUCT DISPLAY
    renderProducts(productsToRender = null) {
        const products = productsToRender || this.products;
        const grid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button class="btn-secondary" onclick="store.clearFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" />
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-header">
                        <div class="product-title-rating">
                            <h3>${product.name}</h3>
                            <div class="product-sizes">${product.sizes}</div>
                            <div class="product-rating">
                                <div class="stars">★★★★★</div>
                                <span class="rating-count">${product.reviews} Reviews</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="product-description">
                        ${product.description}
                    </div>
                    
                    <div class="product-tags">
                        ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    
                    <div class="product-footer">
                        <div class="product-price">
                            ${product.originalPrice ? `<span class="original-price">₱${product.originalPrice.toFixed(2)}</span>` : ''}
                            ₱${product.price.toFixed(2)}
                        </div>
                        <button class="add-to-cart-btn" data-product-id="${product.id}">
                            Add to Bag
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to all Add to Bag buttons
        grid.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(button.getAttribute('data-product-id'));
                this.addToCart(productId);
            });
        });
    }

    clearFilters() {
        document.getElementById('skinTypeFilter').value = '';
        document.getElementById('concernFilter').value = '';
        document.getElementById('productTypeFilter').value = '';
        this.renderProducts();
    }

    // CART FUNCTIONALITY
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.renderCart();
            }
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
            console.log('Cart count updated to:', count);
        }
    }

    openCart() {
        this.renderCart();
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'block';
        
        // Set up the continue shopping button
        this.setupCartContinueShopping();
    }

    setupCartContinueShopping() {
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');
        if (continueShoppingBtn) {
            // Remove any existing event listeners first
            continueShoppingBtn.replaceWith(continueShoppingBtn.cloneNode(true));
            
            // Get the fresh button reference
            const freshBtn = document.getElementById('continueShoppingBtn');
            freshBtn.addEventListener('click', () => {
                console.log('Continue shopping from cart clicked');
                this.closeAllModals();
            });
        }
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" data-product-id="${item.id}">+</button>
                        <button class="quantity-btn remove-btn" data-action="remove" data-product-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            // Add event listeners to cart buttons
            cartItems.querySelectorAll('.quantity-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(button.getAttribute('data-product-id'));
                    const action = button.getAttribute('data-action');
                    
                    if (action === 'increase') {
                        this.updateQuantity(productId, 1);
                    } else if (action === 'decrease') {
                        this.updateQuantity(productId, -1);
                    } else if (action === 'remove') {
                        this.removeFromCart(productId);
                    }
                });
            });
        }

        document.getElementById('cartTotal').textContent = total.toFixed(2);
        
        // Set up the continue shopping button after rendering
        this.setupCartContinueShopping();
    }

    checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Create checkout modal with form
        this.createCheckoutModal();
    }

    createCheckoutModal() {
        // Remove existing checkout modal if any
        const existingModal = document.getElementById('checkoutModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'checkoutModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        modal.innerHTML = `
            <div class="modal-content checkout-modal">
                <span class="close">&times;</span>
                <h2>Checkout</h2>
                
                <div class="checkout-content">
                    <!-- Order Summary -->
                    <div class="checkout-section">
                        <h3>Order Summary</h3>
                        <div class="order-items">
                            ${this.cart.map(item => `
                                <div class="order-item">
                                    <span class="item-name">${item.name} x ${item.quantity}</span>
                                    <span class="item-price">₱${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-total">
                            <strong>Total: ₱${total.toFixed(2)}</strong>
                        </div>
                    </div>

                    <!-- Customer Information -->
                    <div class="checkout-section">
                        <h3>Customer Information</h3>
                        <form id="checkoutForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">First Name *</label>
                                    <input type="text" id="firstName" name="firstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Last Name *</label>
                                    <input type="text" id="lastName" name="lastName" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">Email Address *</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="phone">Phone Number *</label>
                                <input type="tel" id="phone" name="phone" required placeholder="09XXXXXXXXX">
                            </div>
                        </form>
                    </div>

                    <!-- Shipping Address -->
                    <div class="checkout-section">
                        <h3>Shipping Address</h3>
                        <div class="form-group">
                            <label for="address">Street Address *</label>
                            <input type="text" id="address" name="address" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City *</label>
                                <input type="text" id="city" name="city" required>
                            </div>
                            <div class="form-group">
                                <label for="province">Province *</label>
                                <input type="text" id="province" name="province" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="zipCode">ZIP Code *</label>
                                <input type="text" id="zipCode" name="zipCode" required>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Method -->
                    <div class="checkout-section">
                        <h3>Payment Method</h3>
                        <div class="payment-options">
                            <label class="payment-option">
                                <input type="radio" name="paymentMethod" value="gcash" required>
                                <div class="payment-content">
                                    <i class="fab fa-google-wallet"></i>
                                    <span>GCash</span>
                                </div>
                            </label>
                            
                            <label class="payment-option">
                                <input type="radio" name="paymentMethod" value="paymaya" required>
                                <div class="payment-content">
                                    <i class="fas fa-mobile-alt"></i>
                                    <span>PayMaya</span>
                                </div>
                            </label>
                            
                            <label class="payment-option">
                                <input type="radio" name="paymentMethod" value="creditCard" required>
                                <div class="payment-content">
                                    <i class="far fa-credit-card"></i>
                                    <span>Credit/Debit Card</span>
                                </div>
                            </label>
                            
                            <label class="payment-option">
                                <input type="radio" name="paymentMethod" value="bankTransfer" required>
                                <div class="payment-content">
                                    <i class="fas fa-university"></i>
                                    <span>Bank Transfer</span>
                                </div>
                            </label>
                            
                            <label class="payment-option">
                                <input type="radio" name="paymentMethod" value="cod" required>
                                <div class="payment-content">
                                    <i class="fas fa-money-bill-wave"></i>
                                    <span>Cash on Delivery</span>
                                </div>
                            </label>
                        </div>

                        <!-- Credit Card Details (shown when credit card is selected) -->
                        <div id="creditCardDetails" class="credit-card-details" style="display: none;">
                            <div class="form-group">
                                <label for="cardNumber">Card Number *</label>
                                <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="expiryDate">Expiry Date *</label>
                                    <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY">
                                </div>
                                <div class="form-group">
                                    <label for="cvv">CVV *</label>
                                    <input type="text" id="cvv" name="cvv" placeholder="123">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="cardName">Name on Card *</label>
                                <input type="text" id="cardName" name="cardName">
                            </div>
                        </div>
                    </div>

                    <!-- Order Notes -->
                    <div class="checkout-section">
                        <h3>Additional Information</h3>
                        <div class="form-group">
                            <label for="orderNotes">Order Notes (Optional)</label>
                            <textarea id="orderNotes" name="orderNotes" placeholder="Any special instructions for your order..."></textarea>
                        </div>
                    </div>
                </div>

                <div class="checkout-actions">
                    <button type="button" class="btn-secondary" id="continueShoppingBtn">
                        Continue Shopping
                    </button>
                    <button type="button" class="btn-primary" id="placeOrderBtn">
                        Place Order - ₱${total.toFixed(2)}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for the checkout form
        this.setupCheckoutEventListeners();
    }

    setupCheckoutEventListeners() {
        const checkoutModal = document.getElementById('checkoutModal');
        
        // Close button for checkout modal
        const closeBtn = checkoutModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Close button clicked');
                checkoutModal.style.display = 'none';
            });
        }

        // Payment method change
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const creditCardDetails = document.getElementById('creditCardDetails');
                if (e.target.value === 'creditCard') {
                    creditCardDetails.style.display = 'block';
                } else {
                    creditCardDetails.style.display = 'none';
                }
            });
        });

        // Place order button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                this.processOrder();
            });
        }

        // Continue shopping button
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                checkoutModal.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.style.display = 'none';
            }
        });
    }

    processOrder() {
        // Get form values
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            province: document.getElementById('province').value,
            zipCode: document.getElementById('zipCode').value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value,
            orderNotes: document.getElementById('orderNotes').value,
            cardNumber: document.getElementById('cardNumber')?.value,
            expiryDate: document.getElementById('expiryDate')?.value,
            cvv: document.getElementById('cvv')?.value,
            cardName: document.getElementById('cardName')?.value
        };

        // Basic validation
        if (!this.validateCheckoutForm(formData)) {
            return;
        }

        // Process the order
        const orderNumber = 'GLOW' + Date.now().toString().slice(-6);
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Show order confirmation
        this.showOrderConfirmation(orderNumber, formData, total);

        this.lastOrderForm = formData;
    }

    validateCheckoutForm(formData) {
        // Check required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'province', 'zipCode', 'paymentMethod'];
        
        for (let field of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address');
            return false;
        }

        // Phone validation (Philippines format)
        const phoneRegex = /^(09|\+639)\d{9}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            alert('Please enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX)');
            return false;
        }

        // Credit card validation if selected
        if (formData.paymentMethod === 'creditCard') {
            if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
                alert('Please fill in all credit card details');
                return false;
            }
        }

        return true;
    }

    showOrderConfirmation(orderNumber, formData, total) {
        const modal = document.getElementById('checkoutModal');
        
        modal.innerHTML = `
            <div class="modal-content order-confirmation">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h2>Order Confirmed!</h2>
                    <p>Thank you for your purchase</p>
                </div>
                
                <div class="confirmation-details">
                    <div class="detail-item">
                        <strong>Order Number:</strong>
                        <span>${orderNumber}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Customer:</strong>
                        <span>${formData.firstName} ${formData.lastName}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Email:</strong>
                        <span>${formData.email}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Phone:</strong>
                        <span>${formData.phone}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Shipping Address:</strong>
                        <span>${formData.address}, ${formData.city}, ${formData.province} ${formData.zipCode}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Payment Method:</strong>
                        <span>${this.formatPaymentMethod(formData.paymentMethod)}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Total Amount:</strong>
                        <span>₱${total.toFixed(2)}</span>
                    </div>
                </div>

                <div class="order-items-summary">
                    <h4>Order Items:</h4>
                    ${this.cart.map(item => `
                        <div class="order-item-summary">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>₱${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="confirmation-message">
                    <p>A confirmation email has been sent to ${formData.email}</p>
                    <p>Your order will be shipped within 2-3 business days</p>
                    <p><strong>Order Number: ${orderNumber}</strong> - Keep this for tracking</p>
                    ${formData.paymentMethod === 'cod' ? '<p>Please prepare cash for delivery</p>' : ''}
                    <p>You can track your order anytime using your order number and email.</p>
                </div>

                <div class="confirmation-actions">
                    <button class="btn-primary" id="finalContinueShoppingBtn">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;

        // Set up the button immediately after creating it
        const continueBtn = document.getElementById('finalContinueShoppingBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                console.log('Confirmation continue button clicked');
                this.completeOrder();
            });
        }
    }

    formatPaymentMethod(method) {
        const methods = {
            'gcash': 'GCash',
            'paymaya': 'PayMaya',
            'creditCard': 'Credit/Debit Card',
            'bankTransfer': 'Bank Transfer',
            'cod': 'Cash on Delivery'
        };
        return methods[method] || method;
    }

    completeOrder() {
        console.log('Completing order and closing modals...');
        
        try {
            // Save order to history
            if (this.lastOrderForm && this.cart.length > 0) {
                const orderNumber = "GLOW" + Date.now().toString().slice(-6);
                const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                console.log('Saving order to history...');
                this.saveOrderToHistory(
                    orderNumber,
                    this.lastOrderForm,
                    this.cart,
                    total
                );
                console.log('Order saved to history successfully with status: pending');
            } else {
                console.warn('No order data to save to history');
            }
            
            // Clear cart
            this.cart = [];
            this.saveCart();
            this.updateCartCount();
            
            // Close ALL modals
            this.closeAllModals();
            
            // Remove dynamically created checkout modal
            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal) {
                checkoutModal.remove();
            }
            
            this.showNotification('Thank you for your order!');
            
            // Optional: Refresh the page
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Error in completeOrder:', error);
            this.showNotification('Error completing order. Please try again.');
        }
    }

    showNotification(message) {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification-toast');
        existingNotifications.forEach(notif => notif.remove());

        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #2c2c2c;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the store when page loads
let store;
document.addEventListener('DOMContentLoaded', function() {
    store = new SkincareStore();
    window.store = store; // Make it available globally
    console.log('Store initialized');
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .btn-secondary {
        background: transparent;
        color: #2c2c2c;
        border: 1px solid #2c2c2c;
        padding: 12px 25px;
        border-radius: 0;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 400;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
        background: #2c2c2c;
        color: white;
    }
    
    .no-products {
        text-align: center;
        padding: 3rem;
        grid-column: 1 / -1;
    }
    
    .no-products h3 {
        margin-bottom: 1rem;
        color: #2c2c2c;
    }
    
    .no-products p {
        color: #666;
        margin-bottom: 1.5rem;
    }

    /* Order Lookup Styles */
    .order-lookup-result {
        background: #f8f8f8;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
    }

    .order-lookup-result h3 {
        margin-bottom: 1rem;
        color: #2c2c2c;
    }

    .order-details p {
        margin: 0.5rem 0;
    }

    .order-actions {
        margin-top: 1rem;
        display: flex;
        gap: 1rem;
    }

    .cancel-order-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .cancel-order-btn:hover {
        background: #c82333;
    }

    .order-not-found {
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 4px;
        text-align: center;
    }
`;
document.head.appendChild(style);

// Global event delegation for dynamically created buttons
document.addEventListener('click', function(e) {
    // Handle confirmation continue shopping button
    if (e.target.id === 'confirmationContinueBtn' || e.target.closest('#confirmationContinueBtn')) {
        e.preventDefault();
        console.log('Confirmation continue shopping clicked via global listener');
        if (window.store) {
            window.store.completeOrder();
        }
    }
    
    // Handle cart continue shopping button
    if (e.target.id === 'continueShoppingBtn' || e.target.closest('#continueShoppingBtn')) {
        e.preventDefault();
        console.log('Cart continue shopping clicked via global listener');
        if (window.store) {
            window.store.closeAllModals();
        }
    }

    // Handle track orders button in empty state
    if (e.target.id === 'trackOrdersBtn' || e.target.closest('#trackOrdersBtn')) {
        e.preventDefault();
        console.log('Track orders clicked via global listener');
        if (window.store) {
            window.store.openTrackOrdersModal();
        }
    }
});