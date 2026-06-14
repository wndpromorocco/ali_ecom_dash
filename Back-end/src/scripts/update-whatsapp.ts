import PrismaService from '../services/prisma';

async function updateWhatsApp() {
    const key = 'whatsapp_number';
    const value = '0649595793';

    try {
        const setting = await PrismaService.getInstance().setting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        console.log(`✅ WhatsApp number updated successfully to: ${setting.value}`);
    } catch (error: any) {
        console.error('❌ Error updating WhatsApp number:', error);
        process.exit(1);
    } finally {
        await PrismaService.getInstance().$disconnect();
        process.exit(0);
    }
}

updateWhatsApp();
