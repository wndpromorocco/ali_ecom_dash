import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Gallery Images...');
    for (let i = 1; i <= 5; i++) {
        await prisma.galleryImage.upsert({
            where: { slot: i },
            update: {},
            create: {
                slot: i,
                imageUrl: `/images/gallery/gallery-${i}.jpg`,
                altText: '',
            },
        });
    }

    console.log('Seeding Black Friday Config...');
    await prisma.blackFridayConfig.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            isActive: true,
            emoji: '⚡',
            line1: 'BLACK',
            line2: 'FRIDAY',
            badgeText: 'Super Soldes',
            bgColor: '#0F172A',
            textColor: '#FFFFFF',
            borderColor: '#06B6D4',
        },
    });

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
