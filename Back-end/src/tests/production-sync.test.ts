import { describe, it, expect } from 'vitest';

describe('Production ERP Synchronization', () => {
    it('Should successfully sync a perfectly mapped B2C order payload to the ERP', async () => {

        // ============================================================================
        // ⚠️ REAL PRODUCTION IDs REQUIRED HERE ⚠️
        // ============================================================================
        const PRODUCTION_USER_UUID = '123e4567-e89b-12d3-a456-426614174000'; // Random valid UUID format
        const PRODUCTION_PRODUCT_UUID = '2718cecf-b00d-4a35-b4c8-e540d9bcc113';

        // Unique Order Number Generator
        const generateOrderNumber = (): string => {
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            return `B2C-TEST-${yyyy}${mm}${dd}-${random}`;
        };

        const orderNo = generateOrderNumber();
        console.log(`\n[Debug] Testing Order Sync: ${orderNo}`);

        // Blueprint matching the ERP Prisma Schema EXACTLY
        const testPayload = {
            order_number: orderNo,
            ecommerce_id: orderNo, // Treating orderNumber as ID for test
            user_id: PRODUCTION_USER_UUID,
            customer_id: PRODUCTION_USER_UUID,
            status: 'PENDING',
            payment_status: 'UNPAID',
            type: 'b2c',
            source: 'ecommerce',
            priority: 'medium',
            subtotal: Number(43.0),
            tax_amount: Number(0.0),
            shipping_amount: Number(40.0),
            total_amount: Number(83.0),
            date: new Date().toISOString(),
            estimated_delivery_date: new Date().toISOString(),
            customer: {
                name: 'Vitest Automated User',
                email: 'test@vitest.local',
                phone: '0600000000',
            },
            shipping_address: {
                firstName: 'Vitest',
                lastName: 'Automated',
                region: 'Casablanca-Settat',
                address1: '123 Debugging Ave',
                city: 'Casablanca',
                phone: '0600000000',
                email: 'test@vitest.local'
            },
            payment: {
                method: 'Paiement à la livraison',
                status: 'UNPAID',
                currency: 'MAD',
                subtotal: Number(43.0),
                shipping: Number(40.0),
                tax: Number(0.0),
                total: Number(83.0),
            },
            // Strictly modeled items array
            items: [
                {
                    product_id: PRODUCTION_PRODUCT_UUID,
                    name: 'Vitest Test Product',
                    quantity: Number(1),
                    price: Number(43.0),
                    total: Number(43.0),
                    unit: 'unit'
                }
            ]
        };

        try {
            const ERP_API_URL = 'https://herbio.liadtech-hosting.com/api/ecommerce/public/order';

            const response = await fetch(ERP_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // No Authorization or Credentials logic (per CORS workaround)
                },
                body: JSON.stringify(testPayload),
            });

            // ----------------------------------------------------
            // Deep Error Extraction & Console Output
            // ----------------------------------------------------
            if (response.status !== 201) {
                let errorData;
                const rawText = await response.text();

                try {
                    errorData = JSON.parse(rawText);
                } catch (e) {
                    errorData = rawText; // Fallback if not JSON
                }

                console.error('\n❌ [ERP SYNC REJECTED]');
                console.error(`Status Code: ${response.status}`);
                console.error('Prisma Error Details:');
                console.error(JSON.stringify(errorData, null, 2));

                // Let Vitest securely fail the test block with a loud message
                throw new Error(`ERP returned ${response.status}. See console output above for Prisma details.`);
            }

            console.log('\n✅ [ERP SYNC SUCCESS]');
            const successData = await response.json();
            expect(response.status).toBe(201);

        } catch (error) {
            // Re-throw so Vitest explicitly catches and prints the red stack trace error
            throw error;
        }
    });
});
