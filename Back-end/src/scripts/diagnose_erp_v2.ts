
import axios from 'axios';

// Configuration
const ERP_URL = process.env.ERP_ORDER_URL || 'https://herbio.liadtech-hosting.com/api/ecommerce/public/order';

console.log('--- ERP B2C Prefix Diagnostic ---');
console.log(`Target URL: ${ERP_URL}`);

// We will simulate what the ERP expects based on the UI screenshot
const payload = {
    order_number: "B2C-DIAG-" + Math.floor(Math.random() * 100000),
    ecommerce_id: "test-uuid-prefix-test",
    date: new Date(),
    customer: {
        email: "prefix_test@example.com",
        first_name: "Prefix",
        last_name: "Test",
        phone: "0612345678",
        is_guest: true
    },
    shipping_address: {
        address1: "Prefix Street",
        city: "Casablanca",
        region: "Casablanca-Settat",
        postal_code: "20000",
        country: "Morocco"
    },
    payment: {
        method: "Carte bancaire",
        status: "PAID",
        currency: "MAD",
        subtotal: 50,
        shipping: 10,
        tax: 10,
        total: 70
    },
    items: [
        {
            product_id: "prod-prefix",
            sku: "SKU-PREFIX",
            name: "Prefix Test Product",
            quantity: 1,
            price: 50,
            total: 50
        }
    ],
    notes: "Testing if B2C- prefix makes it visible in the ERP UI."
};

async function runTest() {
    try {
        console.log('Sending payload with B2C- prefix...');
        const response = await axios.post(ERP_URL, payload);
        console.log('✅ Success!');
        console.log('Response:', response.data);
        console.log(`Please check if order ${payload.order_number} appears in the ERP UI now.`);
    } catch (error: any) {
        console.log('❌ Failed!');
        console.log(error.response?.data || error.message);
    }
}

runTest();
