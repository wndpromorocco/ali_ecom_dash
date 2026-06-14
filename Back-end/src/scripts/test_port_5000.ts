
import axios from 'axios';

const ERP_IP = '10.10.12.197';
const PORT = '5000';
const ERP_URL = `http://${ERP_IP}:${PORT}/api/ecommerce/public/order`;

console.log(`--- Testing ERP on Port ${PORT} ---`);
console.log(`URL: ${ERP_URL}`);

const payload = {
    order_number: "PORT-TEST-5000",
    ecommerce_id: "port-test-5000",
    date: new Date(),
    customer: { email: "port@test.com", first_name: "Port", last_name: "Test", phone: "0600000000", is_guest: true },
    shipping_address: { address1: "Port St", city: "Casablanca", region: "Casablanca-Settat", postal_code: "20000", country: "Morocco" },
    payment: { method: "CASH", status: "PENDING", currency: "MAD", subtotal: 1, shipping: 0, tax: 0, total: 1 },
    items: [{ product_id: "1", sku: "1", name: "1", quantity: 1, price: 1, total: 1 }],
    notes: "Testing port 5000"
};

async function test() {
    try {
        const response = await axios.post(ERP_URL, payload, { timeout: 3000 });
        console.log('✅ Port 5000 is ACTIVE and accepted the order!');
        console.log('Response:', response.data);
    } catch (error: any) {
        console.log(`❌ Port 5000 failed or is unreachable: ${error.message}`);
    }
}

test();
