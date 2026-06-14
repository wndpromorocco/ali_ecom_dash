import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTaxRates() {
    console.log('🔄 Starting database cleanup for tax removal...');

    try {
        // Find all orders that have a tax amount > 0
        const orders = await prisma.order.findMany({
            where: {
                taxAmount: {
                    gt: 0
                }
            }
        });

        console.log(`Found ${orders.length} orders with tax applied.`);

        for (const order of orders) {
            // Calculate new total: subtotal + shipping (without tax)
            const newTotal = Number(order.subtotal) + Number(order.shippingAmount);

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    taxAmount: 0,
                    totalAmount: newTotal
                }
            });

            console.log(`✅ Updated Order ${order.orderNumber || order.id}: Removed ${order.taxAmount} MAD tax. Total is now ${newTotal} MAD`);
        }

        console.log('🎉 Database tax cleanup complete!');
    } catch (error) {
        console.error('❌ Error updating orders:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixTaxRates();
