const nodemailer = require('nodemailer');
require('dotenv').config();

async function testConnection() {
    console.log(`[TEST-SMTP] Testing connection to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} as ${process.env.SMTP_USER}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        requireTLS: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        logger: true, // Enable detailed debug output
        debug: true,
    });

    try {
        await transporter.verify();
        console.log('\n✅ [SUCCESS] SMTP connection verified successfully!');
        console.log('You can now send emails from this backend.');
    } catch (error) {
        console.error('\n❌ [FAILURE] Failed to connect to SMTP server.');
        if (error.code === 'EAUTH') {
            console.error('>> Authentication Failed. Check if your App Password is correct and 2FA is active.');
        } else if (error.code === 'EENVELOPE') {
            console.error('>> Bad Envelope. Make sure SMTP_USER is a full email address.');
        } else if (error.code === 'ESOCKET') {
            console.error('>> Socket Error. Ensure the port (587) matches and is open on your host firewall.');
        }
        console.error('\nFull Error Trace:', error);
    }
}

testConnection();
