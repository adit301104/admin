/**
 * Shoptet Frontend Integration for Mock Payment System
 * 
 * This script can be embedded in your Shoptet theme to handle
 * payment processing with your mock payment backend.
 */

class ShoptetMockPaymentIntegration {
    constructor(config) {
        this.backendUrl = config.backendUrl || 'http://localhost:3001';
        this.apiKey = config.apiKey || '';
        this.debug = config.debug || false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        // Listen for checkout form submission
        const checkoutForm = document.querySelector('#checkout-form, .checkout-form, form[action*="checkout"]');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
        }
        
        // Listen for payment method changes
        const paymentMethods = document.querySelectorAll('input[name="payment-method"], input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => this.handlePaymentMethodChange(e));
        });
        
        // Add custom payment buttons if needed
        this.addCustomPaymentButtons();
    }
    
    async handleCheckoutSubmit(event) {
        // Check if this is a mock payment method
        const selectedPaymentMethod = this.getSelectedPaymentMethod();
        
        if (!this.isMockPaymentMethod(selectedPaymentMethod)) {
            return; // Let Shoptet handle normal payments
        }
        
        event.preventDefault();
        
        try {
            const orderData = this.extractOrderData();
            const result = await this.processPayment(orderData);
            
            if (result.success) {
                this.handlePaymentSuccess(result);
            } else {
                this.handlePaymentError(result.error || 'Payment failed');
            }
        } catch (error) {
            this.handlePaymentError(error.message);
        }
    }
    
    extractOrderData() {
        // Extract order information from the checkout form
        const form = document.querySelector('#checkout-form, .checkout-form, form[action*="checkout"]');
        const formData = new FormData(form);
        
        // Get customer information
        const customerEmail = formData.get('email') || 
                            document.querySelector('input[name="email"], input[type="email"]')?.value ||
                            this.getCustomerEmailFromShoptet();
        
        // Get cart items and calculate total
        const cartItems = this.getCartItems();
        const total = this.calculateTotal(cartItems);
        
        // Determine if this is a subscription
        const subscriptionInterval = this.determineSubscriptionInterval(cartItems);
        
        return {
            customer_email: customerEmail,
            product_id: cartItems[0]?.code || 'unknown',
            amount: total,
            currency: this.getCurrency(),
            interval: subscriptionInterval,
            payment_method: this.mapPaymentMethod(this.getSelectedPaymentMethod()),
            metadata: {
                cart_items: cartItems,
                customer_data: this.getCustomerData(formData),
                shoptet_session: this.getShoptetSessionId()
            }
        };
    }
    
    getCartItems() {
        // Extract cart items from Shoptet's cart
        const cartItems = [];
        
        // Try to get from Shoptet's global variables
        if (window.shoptet && window.shoptet.cart) {
            return window.shoptet.cart.items || [];
        }
        
        // Fallback: parse from DOM
        const itemElements = document.querySelectorAll('.cart-item, .checkout-item, [data-product-code]');
        itemElements.forEach(element => {
            const item = {
                code: element.dataset.productCode || element.querySelector('[data-product-code]')?.dataset.productCode,
                name: element.querySelector('.product-name, .item-name')?.textContent?.trim(),
                price: parseFloat(element.querySelector('.price, .item-price')?.textContent?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
                quantity: parseInt(element.querySelector('.quantity, .item-quantity')?.textContent || '1')
            };
            
            if (item.code) {
                cartItems.push(item);
            }
        });
        
        return cartItems;
    }
    
    calculateTotal(cartItems) {
        return cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    determineSubscriptionInterval(cartItems) {
        // Check if any item is a subscription product
        for (const item of cartItems) {
            const code = item.code?.toLowerCase() || '';
            const name = item.name?.toLowerCase() || '';
            
            // Check product code patterns
            if (code.includes('sub_monthly') || name.includes('monthly')) return 'monthly';
            if (code.includes('sub_yearly') || name.includes('yearly')) return 'yearly';
            if (code.includes('sub_weekly') || name.includes('weekly')) return 'weekly';
            if (code.includes('sub_quarterly') || name.includes('quarterly')) return 'quarterly';
        }
        
        return 'once'; // One-time payment
    }
    
    getCurrency() {
        // Get currency from Shoptet
        if (window.shoptet && window.shoptet.config) {
            return window.shoptet.config.currency || 'USD';
        }
        
        // Fallback: look for currency in DOM
        const currencyElement = document.querySelector('.currency, [data-currency]');
        if (currencyElement) {
            return currencyElement.textContent?.trim() || currencyElement.dataset.currency || 'USD';
        }
        
        return 'USD';
    }
    
    getSelectedPaymentMethod() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked, input[name="paymentMethod"]:checked');
        return selectedMethod?.value || 'card';
    }
    
    isMockPaymentMethod(method) {
        // Define which payment methods should use mock processing
        const mockMethods = ['mock-card', 'mock-bank', 'mock-paypal', 'test-payment'];
        return mockMethods.includes(method);
    }
    
    mapPaymentMethod(shoptetMethod) {
        const mapping = {
            'mock-card': 'card',
            'mock-bank': 'bank_transfer',
            'mock-paypal': 'paypal',
            'test-payment': 'card'
        };
        
        return mapping[shoptetMethod] || 'card';
    }
    
    getCustomerEmailFromShoptet() {
        // Try to get customer email from Shoptet's customer data
        if (window.shoptet && window.shoptet.customer) {
            return window.shoptet.customer.email;
        }
        
        return '';
    }
    
    getCustomerData(formData) {
        return {
            name: formData.get('name') || formData.get('firstName') + ' ' + formData.get('lastName'),
            phone: formData.get('phone'),
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                zip: formData.get('zip'),
                country: formData.get('country')
            }
        };
    }
    
    getShoptetSessionId() {
        // Get Shoptet session ID if available
        if (window.shoptet && window.shoptet.session) {
            return window.shoptet.session.id;
        }
        
        return null;
    }
    
    async processPayment(orderData) {
        const response = await fetch(`${this.backendUrl}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : undefined
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    handlePaymentSuccess(result) {
        this.log('Payment successful:', result);
        
        // Show success message
        this.showMessage('Payment processed successfully!', 'success');
        
        // Redirect to success page or update UI
        if (result.order && result.payment) {
            // Store payment info for confirmation page
            sessionStorage.setItem('mockPaymentResult', JSON.stringify(result));
            
            // Redirect to success page
            window.location.href = '/checkout/success?payment_id=' + result.payment.payment_id;
        }
    }
    
    handlePaymentError(error) {
        this.log('Payment error:', error);
        
        // Show error message
        this.showMessage('Payment failed: ' + error, 'error');
        
        // Re-enable form
        this.enableCheckoutForm();
    }
    
    showMessage(message, type = 'info') {
        // Create or update message element
        let messageElement = document.querySelector('.mock-payment-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'mock-payment-message';
            
            // Insert at top of checkout form
            const form = document.querySelector('#checkout-form, .checkout-form');
            if (form) {
                form.insertBefore(messageElement, form.firstChild);
            }
        }
        
        messageElement.className = `mock-payment-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-weight: bold;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
            ${type === 'error' ? 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : ''}
            ${type === 'info' ? 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;' : ''}
        `;
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }
    
    enableCheckoutForm() {
        const form = document.querySelector('#checkout-form, .checkout-form');
        if (form) {
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText || 'Complete Order';
            }
        }
    }
    
    addCustomPaymentButtons() {
        // Add custom payment method options to Shoptet checkout
        const paymentMethodsContainer = document.querySelector('.payment-methods, .checkout-payment-methods');
        
        if (paymentMethodsContainer) {
            const mockPaymentOption = document.createElement('div');
            mockPaymentOption.className = 'payment-method-option';
            mockPaymentOption.innerHTML = `
                <label>
                    <input type="radio" name="payment-method" value="mock-card">
                    <span>Test Credit Card (Mock Payment)</span>
                </label>
            `;
            
            paymentMethodsContainer.appendChild(mockPaymentOption);
        }
    }
    
    log(...args) {
        if (this.debug) {
            console.log('[ShoptetMockPayment]', ...args);
        }
    }
}

// Initialize the integration when the script loads
document.addEventListener('DOMContentLoaded', () => {
    // Configuration - adjust these values for your setup
    const config = {
        backendUrl: 'http://localhost:3001', // Your backend URL
        apiKey: '', // Optional API key for authentication
        debug: true // Set to false in production
    };
    
    new ShoptetMockPaymentIntegration(config);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoptetMockPaymentIntegration;
}