import axios from 'axios';

export const sendWhatsAppConfirmation = async (phone: string, orderNumber: string, clientName: string) => {
    try {
        // Format phone number to ensure it has +212 country code
        let formattedPhone = phone.replace(/\s+/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+212' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('212')) {
            formattedPhone = '+' + formattedPhone;
        } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone;
        }

        const message = `Bonjour ${clientName},\n\nNous confirmons la réception de votre commande #${orderNumber} sur Fadel trading !\n\nNotre équipe préparera votre commande avec soin. Merci pour votre confiance ! ❤️`;

        console.log(`[WhatsApp Bot] Sending automated confirmation to ${formattedPhone}`);

        if (process.env.WHATSAPP_API_URL) {
            await axios.post(process.env.WHATSAPP_API_URL!, {
                phone: formattedPhone,
                message: message
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN || ''}`
                }
            });
        } else {
            console.log(`[WhatsApp Bot] Simulated success: Message delivered to ${formattedPhone}`);
            // No API URL provided, simulating successful sending
        }
    } catch (error) {
        console.error('[WhatsApp Bot] Failed to send confirmation message:', error);
    }
};
