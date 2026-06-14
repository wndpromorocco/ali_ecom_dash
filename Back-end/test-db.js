const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testDatabase() {
    console.log('🚀 [TEST-DB] Starting database connection test...');
    console.log(`📍 Using DATABASE_URL: ${process.env.DATABASE_URL}`);

    const prisma = new PrismaClient();

    try {
        console.log('⏳ Attempting to connect...');
        await prisma.$connect();
        console.log('✅ Connection verified!');

        console.log('⏳ Running simple query...');
        const userCount = await prisma.user.count();
        console.log(`✅ Query successful! Number of users in database: ${userCount}`);

        console.log('\n🎉 [SUCCESS] Database is connected and working correctly!');
    } catch (error) {
        console.error('\n❌ [FAILURE] Database Error encountered:');
        console.error(error.message);
        console.error('\nFull Error Trace:', error);

        if (error.code === 'P1001') {
            console.error('>> Can\'t reach database server. Check if the IP address and Port are correct and reachable.');
        } else if (error.code === 'P1000') {
            console.error('>> Authentication failed. Check your database username and password.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();
