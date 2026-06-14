import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure, // Use config value (true for 465, false for 587)
    requireTLS: !config.email.secure, // Force STARTTLS if not using SSL
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
    logger: false,
    debug: false,
});

export const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('📧 Email service connection verified');
        return true;
    } catch (error: any) {
        console.error('❌ Email service connection failed:', error.message);
        return false;
    }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
    console.log(`[EMAIL] Attempting to send to ${to} via ${config.email.host}:${config.email.port}`);
    console.log(`[EMAIL] From: "${config.email.fromName}" <${config.email.fromAddress}>`);

    try {
        // Enforce a strict timeout for production resilience
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Email service timeout (10s)')), 10000)
        );

        const sendPromise = (async () => {
            await transporter.verify();
            console.log('[EMAIL] Connection verified');

            const text = html.replace(/<[^>]*>?/gm, '');

            const info = await transporter.sendMail({
                from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
                to,
                subject,
                html,
                text,
            });
            return info;
        })();

        const info: any = await Promise.race([sendPromise, timeoutPromise]);

        console.log('[EMAIL] Message sent successfully: %s', info.messageId);
        console.log('[EMAIL] Response: %s', info.response);
        return info;
    } catch (error: any) {
        console.error('[EMAIL] Send Failure:', error.message);

        if (error.message.includes('timeout')) {
            console.error('[EMAIL-TIMEOUT] The email provider took too long to respond. Check network/port blocks.');
        } else if (error.code === 'EAUTH') {
            console.error('[EMAIL-AUTH-FAIL] Authentication failed. Check SMTP_USER/PASS.');
        } else {
            console.error('[EMAIL-ERROR-DETAILS]', {
                code: error.code,
                command: error.command,
                stack: error.stack
            });
        }
        return null;
    }
};
