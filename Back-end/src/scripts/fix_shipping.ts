import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixShippingRates() {
    console.log('🔄 Starting database cleanup for shipping rates...');

    try {
        // Find all orders where shipping was previously calculated as 25 MAD
        const orders = await prisma.order.findMany({
            where: {
                shippingAmount: 25.0
            }
        });

        console.log(`Found ${orders.length} orders with 25 MAD shipping.`);

        for (const order of orders) {
            // Set new shipping amount
            const newShipping = 40.0;
            // Calculate new total: subtotal + new shipping + existing tax
            const newTotal = Number(order.subtotal) + newShipping + Number(order.taxAmount);

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    shippingAmount: newShipping,
                    totalAmount: newTotal
                }
            });

            console.log(`✅ Updated Order ${order.orderNumber || order.id}: Total is now ${newTotal} MAD`);
        }

        console.log('🎉 Database cleanup complete!');
    } catch (error) {
        console.error('❌ Error updating orders:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixShippingRates();
