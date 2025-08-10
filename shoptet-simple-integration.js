/**
 * Simple Shoptet Integration for Mock Payments
 * Add this script to your Shoptet theme to enable mock payment processing
 */

class SimpleShoptetPayment {
  constructor() {
    this.backendUrl = 'http://localhost:3001'; // Change to your backend URL
    this.init();
  }

  init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Add mock payment option to checkout
    this.addMockPaymentOption();
    
    // Handle form submission
    this.handleCheckoutForm();
  }

  addMockPaymentOption() {
    const paymentMethods = document.querySelector('.payment-methods, #payment-methods');
    if (paymentMethods) {
      const mockOption = document.createElement('div');
      mockOption.innerHTML = `
        <label class="payment-method">
          <input type="radio" name="payment-method" value="mock-payment" />
          <span>Test Payment (Mock)</span>
          <small style="display: block; color: #666;">For testing purposes only</small>
        </label>
      `;
      paymentMethods.appendChild(mockOption);
    }
  }

  handleCheckoutForm() {
    const form = document.querySelector('#checkout-form, .checkout-form, form[action*="checkout"]');
    if (form) {
      form.addEventListener('submit', async (e) => {
        const selectedPayment = document.querySelector('input[name="payment-method"]:checked');
        
        if (selectedPayment && selectedPayment.value === 'mock-payment') {
          e.preventDefault();
          await this.processMockPayment();
        }
      });
    }
  }

  async processMockPayment() {
    try {
      // Show loading
      this.showMessage('Processing payment...', 'info');
      
      // Get order data
      const orderData = this.getOrderData();
      
      // Send to backend
      const response = await fetch(`${this.backendUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage('Payment successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/checkout/success?payment_id=' + result.payment_id;
        }, 2000);
      } else {
        this.showMessage('Payment failed: ' + result.error, 'error');
      }
    } catch (error) {
      this.showMessage('Payment error: ' + error.message, 'error');
    }
  }

  getOrderData() {
    // Extract basic order information
    const email = document.querySelector('input[type="email"], input[name="email"]')?.value || 'test@shoptet.com';
    const total = this.extractTotal();
    
    return {
      customer_email: email,
      product_id: 'SHOPTET_PRODUCT_' + Date.now(),
      amount: total,
      currency: 'USD',
      shoptet_order_id: 'SHOPTET_' + Date.now()
    };
  }

  extractTotal() {
    // Try to find total amount
    const totalElement = document.querySelector('.total-price, .final-price, [data-total]');
    if (totalElement) {
      const text = totalElement.textContent.replace(/[^\d.,]/g, '');
      return parseFloat(text.replace(',', '.')) || 10.00;
    }
    return 10.00; // Default amount
  }

  showMessage(message, type) {
    let messageDiv = document.querySelector('.payment-message');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.className = 'payment-message';
      const form = document.querySelector('#checkout-form, .checkout-form');
      if (form) form.insertBefore(messageDiv, form.firstChild);
    }

    messageDiv.textContent = message;
    messageDiv.className = `payment-message ${type}`;
    messageDiv.style.cssText = `
      padding: 10px; margin: 10px 0; border-radius: 4px; font-weight: bold;
      ${type === 'success' ? 'background: #d4edda; color: #155724;' : ''}
      ${type === 'error' ? 'background: #f8d7da; color: #721c24;' : ''}
      ${type === 'info' ? 'background: #d1ecf1; color: #0c5460;' : ''}
    `;
  }
}

// Initialize when page loads
new SimpleShoptetPayment();