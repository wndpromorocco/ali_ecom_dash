
import axios from 'axios';

// Configuration
const ERP_URL = process.env.ERP_ORDER_URL || 'https://herbio.liadtech-hosting.com/api/ecommerce/public/order';

console.log('--- ERP Connection Diagnostic ---');
console.log(`Target URL: ${ERP_URL}`);

// Dummy Payload (matches what ERPService sends)
const payload = {
    order_number: "TEST-DIAGNOSTIC-" + Date.now(),
    ecommerce_id: "test-uuid-" + Date.now(),
    date: new Date(),
    customer: {
        email: "test_diagnostic@example.com",
        first_name: "Test",
        last_name: "Diagnostic",
        phone: "0600000000",
        is_guest: true
    },
    shipping_address: {
        address1: "123 Diagnostic Lane",
        city: "Casablanca",
        region: "Casablanca-Settat",
        postal_code: "20000",
        country: "Morocco"
    },
    payment: {
        method: "Stripe",
        status: "PAID",
        currency: "MAD",
        subtotal: 100,
        shipping: 0,
        tax: 20,
        total: 120
    },
    items: [
        {
            product_id: "prod-123",
            sku: "TEST-SKU",
            name: "Test Product",
            quantity: 1,
            price: 100,
            total: 100
        }
    ],
    notes: "This is a diagnostic test from the backend."
};

async function runTest() {
    try {
        console.log('Sending payload:', JSON.stringify(payload, null, 2));
        const start = Date.now();
        const response = await axios.post(ERP_URL, payload);
        const duration = Date.now() - start;

        console.log('✅ Success!');
        console.log(`Status: ${response.status}`);
        console.log(`Time: ${duration}ms`);
        console.log('Response:', response.data);
    } catch (error: any) {
        console.log('❌ Failed!');
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log('Data:', error.response.data);
            console.log('Headers:', error.response.headers);
        } else if (error.request) {
            console.log('No response received (Network Error).');
            console.log(error.message);
        } else {
            console.log('Error setup:', error.message);
        }
    }
}

runTest();
