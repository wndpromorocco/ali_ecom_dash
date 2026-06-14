const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendHelloWorld() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || user;
    const fromName = process.env.EMAIL_FROM_NAME || 'Herbio Test';

    console.log(`\n🚀 [HELLO-WORLD-SMTP] Starting test...`);
    console.log(`📍 Using Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}:587`);
    console.log(`👤 Using User: ${user}`);
    console.log(`✉️  Using From: "${fromName}" <${fromAddress}>`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user, pass },
        logger: true,
        debug: true,
    });

    try {
        console.log('⏳ Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified!');

        console.log('⏳ Sending test email...');
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to: 'r.yahia.dev@gmail.com', // Send to user specifically
            subject: 'Hello World - Herbio SMTP Test',
            text: 'This is a test email from the Herbio backend. If you received this, your SMTP configuration is aligned and working!',
            html: '<b>This is a test email from the Herbio backend.</b><br><p>If you received this, your SMTP configuration is aligned and working!</p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('\n❌ [FAILURE] SMTP Error encountered:');
        console.error(error.message);
        if (error.code === 'EAUTH') {
            console.error('>> AUTHENTICATION FAILED. Gmail requires the "From" address match the SMTP_USER and an "App Password" must be used.');
        }
    }
}

sendHelloWorld();
