const axios = require('axios');
require('dotenv').config();

const ERP_API_URL = process.env.ERP_API_URL || 'https://herbio.liadtech-hosting.com/api/ecommerce/public/order';

async function pingERP() {
    console.log(`Pinging ERP at: ${ERP_API_URL}`);

    // We send a minimal/dummy payload to see how the ERP responds.
    // A 400 Bad Request actually proves the endpoint exists and is listening!
    const dummyPayload = {
        ping: true,
        test_connection: "Hello from E-commerce"
    };

    try {
        const response = await axios.post(ERP_API_URL, dummyPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(`[SUCCESS] ERP is reachable! Status Code: ${response.status}`);
        console.log(`[DATA]`, response.data);
    } catch (error) {
        if (error.response) {
            console.log(`[REACHABLE BUT REJECTED] ERP is online but rejected the dummy payload.`);
            console.log(`[STATUS] ${error.response.status} ${error.response.statusText}`);
            console.log(`[EXACT REASON]`, error.response.data);
        } else if (error.request) {
            console.error(`[FAILED] No response received from ERP. Is the server down?`);
        } else {
            console.error(`[FAILED] Request Error:`, error.message);
        }
    }
}

pingERP();
