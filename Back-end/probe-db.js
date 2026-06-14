const { PrismaClient } = require('@prisma/client');

async function probe(url, label) {
    console.log(`\n🔍 Probing: ${label}`);
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
        await prisma.$connect();
        console.log(`✅ SUCCESS: Connected with ${label}`);
        process.exit(0);
    } catch (e) {
        console.log(`❌ FAILED: ${e.message.split('\n')[0]}`);
    } finally {
        await prisma.$disconnect();
    }
}

async function run() {
    await probe('postgresql://postgres@localhost:5432/ecom', 'User: postgres, No Password');
    await probe('postgresql://yr@localhost:5432/ecom', 'User: yr, No Password');
    await probe('postgresql://postgres:password@localhost:5432/ecom', 'User: postgres, Pass: password');
    await probe('postgresql://postgres:root@localhost:5432/ecom', 'User: postgres, Pass: root');
    console.log('\n❌ All probes failed. Please provide the correct database password.');
}

run();
