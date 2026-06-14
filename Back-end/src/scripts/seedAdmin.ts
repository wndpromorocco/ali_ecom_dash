import bcrypt from 'bcryptjs';
import PrismaService from '../services/prisma';
import { UserRole } from '../types';

async function seedAdmin() {
    const email = 'admin@fadeltrading.com';
    const password = 'AdminPassword2026!'; // Change this in production
    const firstName = 'Mehdi';
    const lastName = 'Admin';

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await PrismaService.getInstance().user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: UserRole.ADMIN,
            },
            create: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: UserRole.ADMIN,
                isVerified: true,
            },
        });

        console.log(`✅ Admin user ${user.email} created/updated successfully.`);
        console.log(`🔑 Login credentials confirmed: ${email} / ${password}`);
    } catch (error: any) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    } finally {
        await PrismaService.getInstance().$disconnect();
        process.exit(0);
    }
}

seedAdmin();
