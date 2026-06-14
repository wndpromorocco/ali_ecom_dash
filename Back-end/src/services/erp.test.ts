import ERPService from './erp';
import PrismaService from './prisma';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('./prisma');

describe('ERPService.syncOrder', () => {
    const mockOrder = {
        id: 'order-123',
        orderNumber: 'ORD-001',
        createdAt: new Date('2024-01-26T12:00:00Z'),
        user: {
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+212600000000'
        },
        guestEmail: null,
        guestFirstName: null,
        guestLastName: null,
        userId: 'user-123',
        paymentMethod: 'CARD', // Should map to 'Carte bancaire'
        paymentStatus: 'PENDING', // Should map to 'unpaid'
        currency: 'MAD',
        subtotal: '100.00',
        shippingAmount: '20.00',
        taxAmount: '10.00',
        totalAmount: '130.00',
        notes: 'Test note',
        address: {
            firstName: 'John',
            lastName: 'Doe',
            address1: '123 Test St',
            address2: 'Apt 4B',
            city: 'Casablanca',
            region: 'Casablanca-Settat',
            postalCode: '20000',
            country: 'Morocco',
            phone: '+212600000000',
            email: 'test@example.com'
        },
        items: [
            {
                id: 'item-1',
                productId: 'prod-1',
                quantity: 2,
                price: '50.00',
                total: '100.00',
                product: {
                    name: 'Test Product',
                    sku: 'SKU-001'
                }
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup Prisma mock
        const mockPrismaClient = {
            order: {
                findUnique: jest.fn().mockResolvedValue(mockOrder)
            }
        };
        (PrismaService.getInstance as jest.Mock).mockReturnValue(mockPrismaClient);
    });

    it('should construct the correct payload and send to ERP', async () => {
        (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: { success: true } });

        await ERPService.syncOrder('order-123');

        expect(axios.post).toHaveBeenCalledTimes(1);

        // Verify payload structure matches requirements
        const calledPayload = (axios.post as jest.Mock).mock.calls[0][1];

        expect(calledPayload).toEqual({
            orderNumber: 'ORD-001',
            status: 'pending',
            type: 'b2c',
            priority: 'medium',
            customerName: 'John Doe',
            customerEmail: 'test@example.com',
            customerPhone: '+212600000000',
            customerAddress: {
                firstName: 'John',
                lastName: 'Doe',
                region: 'Casablanca-Settat',
                address: '123 Test St Apt 4B',
                city: 'Casablanca',
                phone: '+212600000000',
                email: 'test@example.com'
            },
            subtotal: 100,
            totalAmount: 130,
            paymentMethod: 'Carte bancaire',
            shippingMethod: 'Livraison standard',
            estimatedDeliveryDate: expect.any(String), // Date string
            notes: 'Test note',
            internalNotes: "",
            deliveryNote: "",
            pickupPoint: "",
            estimatedDeliveryTime: "",
            tags: [],
            items: [
                {
                    productId: 'prod-1',
                    productName: 'Test Product',
                    quantity: 2,
                    unitPrice: 50,
                    unit: 'kg',
                    notes: "",
                    finishedProductStockId: 'prod-1',
                    totalPrice: 100,
                    id: 'item-1'
                }
            ],
            clientType: 'individual',
            currency: 'MAD',
            paymentStatus: 'unpaid', // "PENDING" -> "unpaid"
            source: 'web'
        });
    });

    it('should handle cash on delivery payment method mapping', async () => {
        const codOrder = { ...mockOrder, paymentMethod: 'CASH_ON_DELIVERY' };
        const mockPrismaClient = {
            order: {
                findUnique: jest.fn().mockResolvedValue(codOrder)
            }
        };
        (PrismaService.getInstance as jest.Mock).mockReturnValue(mockPrismaClient);
        (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: { success: true } });

        await ERPService.syncOrder('order-123');

        const calledPayload = (axios.post as jest.Mock).mock.calls[0][1];
        expect(calledPayload.paymentMethod).toBe('Paiement à la livraison');
    });
});
