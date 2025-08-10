<?php
/**
 * Shoptet Webhook Handler for Mock Payment Integration
 * 
 * This file handles incoming webhooks from Shoptet and forwards them
 * to your mock payment backend for processing.
 */

// Configuration
$BACKEND_URL = 'http://localhost:3001'; // Your backend URL
$WEBHOOK_SECRET = 'your-webhook-secret'; // Set this in your Shoptet webhook configuration

// Get the raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Verify webhook signature (optional but recommended)
function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', $payload, $secret);
    return hash_equals($signature, $expectedSignature);
}

// Log webhook for debugging
error_log('Shoptet Webhook Received: ' . $input);

// Check if this is a valid webhook
if (!$data || !isset($data['event'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid webhook data']);
    exit;
}

// Handle different webhook events
switch ($data['event']) {
    case 'order:created':
    case 'order:changed':
        handleOrderEvent($data);
        break;
    
    case 'order:paid':
        handleOrderPaidEvent($data);
        break;
    
    case 'order:cancelled':
        handleOrderCancelledEvent($data);
        break;
    
    default:
        error_log('Unhandled webhook event: ' . $data['event']);
        break;
}

function handleOrderEvent($data) {
    global $BACKEND_URL;
    
    $orderData = $data['data'];
    
    // Extract relevant information
    $payload = [
        'customer_email' => $orderData['customer']['email'] ?? '',
        'product_id' => $orderData['items'][0]['code'] ?? '', // Use first item code as product ID
        'amount' => $orderData['price']['withVat'] ?? 0,
        'currency' => $orderData['currencyCode'] ?? 'USD',
        'shoptet_order_id' => $orderData['code'] ?? '',
        'interval' => determineSubscriptionInterval($orderData),
        'payment_method' => mapPaymentMethod($orderData['paymentMethod']['code'] ?? 'card')
    ];
    
    // Validate required fields
    if (empty($payload['customer_email']) || empty($payload['amount'])) {
        error_log('Missing required order data');
        return;
    }
    
    // Send to backend
    $response = sendToBackend('/api/orders', $payload);
    
    if ($response) {
        error_log('Order processed successfully: ' . json_encode($response));
    } else {
        error_log('Failed to process order');
    }
}

function handleOrderPaidEvent($data) {
    global $BACKEND_URL;
    
    $orderData = $data['data'];
    $shoptetOrderId = $orderData['code'] ?? '';
    
    // You might want to update payment status or trigger additional processing
    error_log('Order paid: ' . $shoptetOrderId);
    
    // Optional: Send confirmation to backend
    $payload = [
        'shoptet_order_id' => $shoptetOrderId,
        'status' => 'paid',
        'paid_at' => date('c')
    ];
    
    sendToBackend('/api/orders/shoptet-status-update', $payload);
}

function handleOrderCancelledEvent($data) {
    global $BACKEND_URL;
    
    $orderData = $data['data'];
    $shoptetOrderId = $orderData['code'] ?? '';
    
    error_log('Order cancelled: ' . $shoptetOrderId);
    
    // Optional: Handle cancellation in backend
    $payload = [
        'shoptet_order_id' => $shoptetOrderId,
        'status' => 'cancelled',
        'cancelled_at' => date('c')
    ];
    
    sendToBackend('/api/orders/shoptet-status-update', $payload);
}

function determineSubscriptionInterval($orderData) {
    // Check if this is a subscription product
    // This logic depends on how you identify subscription products in Shoptet
    
    foreach ($orderData['items'] as $item) {
        $productCode = $item['code'] ?? '';
        $productName = $item['name'] ?? '';
        
        // Example: Check if product code or name contains subscription indicators
        if (strpos($productCode, 'SUB_') === 0) {
            // Extract interval from product code (e.g., SUB_MONTHLY, SUB_YEARLY)
            if (strpos($productCode, 'MONTHLY') !== false) return 'monthly';
            if (strpos($productCode, 'YEARLY') !== false) return 'yearly';
            if (strpos($productCode, 'WEEKLY') !== false) return 'weekly';
            if (strpos($productCode, 'QUARTERLY') !== false) return 'quarterly';
        }
        
        // Check product name for subscription keywords
        $nameLower = strtolower($productName);
        if (strpos($nameLower, 'monthly') !== false) return 'monthly';
        if (strpos($nameLower, 'yearly') !== false) return 'yearly';
        if (strpos($nameLower, 'weekly') !== false) return 'weekly';
        if (strpos($nameLower, 'quarterly') !== false) return 'quarterly';
    }
    
    // Default to one-time payment
    return 'once';
}

function mapPaymentMethod($shoptetPaymentMethod) {
    // Map Shoptet payment methods to your system
    $mapping = [
        'card' => 'card',
        'bank-transfer' => 'bank_transfer',
        'paypal' => 'paypal',
        'cash-on-delivery' => 'cod',
        'bitcoin' => 'crypto'
    ];
    
    return $mapping[$shoptetPaymentMethod] ?? 'card';
}

function sendToBackend($endpoint, $payload) {
    global $BACKEND_URL;
    
    $url = $BACKEND_URL . $endpoint;
    
    $options = [
        'http' => [
            'header' => [
                'Content-Type: application/json',
                'User-Agent: Shoptet-Webhook-Handler/1.0'
            ],
            'method' => 'POST',
            'content' => json_encode($payload),
            'timeout' => 30
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === false) {
        error_log('Failed to send request to backend: ' . $url);
        return false;
    }
    
    return json_decode($result, true);
}

// Send success response to Shoptet
http_response_code(200);
echo json_encode(['status' => 'success', 'message' => 'Webhook processed']);
?>