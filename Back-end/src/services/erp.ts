import PrismaService from './prisma';
import axios from 'axios';

const ERP_ORDER_URL = process.env.ERP_API_URL || '';

export class ERPService {
    /**
     * Synchronizes an order with the ERP endpoint.
     * DISABLED: Legacy URLs removed per user request.
     */
    static async syncOrder(orderId: string) {
        if (!ERP_ORDER_URL) {
            console.log(`[ERP-Sync] Synchronization disabled: No ERP_API_URL configured.`);
            return;
        }
        try {
            // Logic stays here for future non-legacy ERP configuration
            console.log(`[ERP-Sync] Starting synchronization for order: ${orderId}`);


            const order = await PrismaService.getInstance().order.findUnique({
                where: { id: orderId },
                include: {
                    address: true,
                    user: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true
                        }
                    },
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            if (!order) {
                console.error(`[ERP-Sync] Order ${orderId} not found in database.`);
                return;
            }

            const payload = {
                order_number: order.orderNumber, // MATCHING POSTGRES SCHEMA key
                ecommerce_id: order.id,
                status: 'pending',
                type: 'b2c',
                priority: 'medium',
                customer: {
                    name: `${order.user?.firstName || order.guestFirstName || ''} ${order.user?.lastName || order.guestLastName || ''}`.trim(),
                    email: order.user?.email || order.guestEmail,
                    phone: order.user?.phone || order.address.phone,
                },
                shipping_address: {
                    firstName: order.address.firstName,
                    lastName: order.address.lastName,
                    region: order.address.region,
                    address: [order.address.address1, order.address.address2].filter(Boolean).join(' '),
                    city: order.address.city,
                    phone: order.address.phone,
                    email: order.address.email || order.user?.email || order.guestEmail
                },
                payment: {
                    method: getReadablePaymentMethod(order.paymentMethod),
                    status: order.paymentStatus === 'PENDING' ? 'unpaid' : 'paid',
                    currency: 'MAD',
                    subtotal: Number(order.subtotal),
                    total_price: Number(order.totalAmount),
                },
                shippingMethod: 'Livraison standard',
                estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: order.notes || "",
                internalNotes: "",
                deliveryNote: "",
                pickupPoint: "",
                estimatedDeliveryTime: "",
                tags: [],
                items: order.items.map(item => ({
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: Number(item.price),
                    unit: 'kg',
                    notes: "",
                    finishedProductStockId: item.productId,
                    totalPrice: Number(item.total),
                    id: item.id
                })),
                clientType: 'individual',
                source: 'web'
            };

            // Send to ERP
            const response = await axios.post(ERP_ORDER_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    // Add expected headers like auth tokens if needed by ERP
                    // 'Authorization': `Bearer ${process.env.ERP_API_KEY}` 
                }
            });

            if (response.status === 200 || response.status === 201) {
                console.log(`[ERP-Sync-Success] Order ${order.orderNumber} successfully sent to ERP.`);
                return response.data;
            } else {
                console.error(`[ERP-Sync-Error] ERP returned unexpected status: ${response.status}`);
                throw new Error(`ERP failed with status ${response.status}`);
            }

        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const responseData = error.response.data;

                if (status === 400) {
                    console.error(`[ERP-Sync-Error] 400 Bad Request: The ERP rejected the payload when syncing order ${orderId}. Exact reason:`, responseData);
                } else if (status === 401) {
                    console.error(`[ERP-Sync-Error] 401 Unauthorized: Invalid or missing authentication for ERP when syncing order ${orderId}.`);
                } else if (status === 403) {
                    console.error(`[ERP-Sync-Error] 403 Forbidden: Insufficient permissions for ERP when syncing order ${orderId}.`);
                } else if (status === 404) {
                    console.error(`[ERP-Sync-Error] 404 Not Found: The ERP endpoint could not be found when syncing order ${orderId}. Exact reason:`, responseData);
                } else if (status === 500) {
                    console.error(`[ERP-Sync-Error] 500 Internal Server Error: The ERP encountered an unexpected condition when syncing order ${orderId}. Exact reason:`, responseData);
                } else {
                    console.error(`[ERP-Sync-Error] Failed to sync order ${orderId} with status ${status}:`, responseData);
                }
            } else {
                console.error(`[ERP-Sync-Error] Network or unexpected error when syncing order ${orderId} to ERP:`, error.message);
            }
            // We log the error but don't crash the main process.
            // A cron job could later retry failed syncs. 
        }
    }
}

export default ERPService;

function getReadablePaymentMethod(method: string | null): string {
    switch (method) {
        case 'CASH_ON_DELIVERY': return 'Paiement à la livraison';
        case 'CARD': return 'Carte bancaire';
        case 'STRIPE': return 'Carte bancaire';
        case 'BANK_TRANSFER': return 'Virement bancaire';
        default: return method || 'Autre';
    }
}
