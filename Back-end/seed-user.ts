import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function seedUser() {
    const prisma = new PrismaClient();
    const email = 'r.yahia.dev@gmail.com';

    try {
        const hashedPassword = await bcrypt.hash('password123', 12);

        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                firstName: 'Yahia',
                lastName: 'Dev',
                role: 'CUSTOMER',
                isActive: true,
                isVerified: true
            }
        });

        console.log(`✅ [SEED] User ${email} created/verified!`);
    } catch (error) {
        console.error('❌ [SEED] Error seeding user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedUser();
