import { http, HttpResponse } from 'msw';
import {
    MOCK_PRODUCTS,
    MOCK_CATEGORIES,
    MOCK_SETTINGS,
    MOCK_HERO_SLIDES,
    MOCK_PROMO,
    MOCK_GALLERY,
    MOCK_BLACKFRIDAY,
    MOCK_USER,
} from './data';

// Use relative paths or match against any host to be more resilient in tests
const BASE = '*/api/v1';

export const handlers = [

    // ── AUTH ──────────────────────────────────────────────
    http.post(`${BASE}/auth/login`, async ({ request }) => {
        const body = await request.json() as any;
        if (body.email === 'admin@hermado.com' &&
            body.password === 'password123') {
            return HttpResponse.json({
                success: true,
                data: { accessToken: MOCK_USER.accessToken }
            });
        }
        return HttpResponse.json(
            { success: false, message: 'Identifiants incorrects' },
            { status: 401 }
        );
    }),

    http.post(`${BASE}/auth/change-password`, () => {
        return HttpResponse.json({ success: true });
    }),

    // ── PRODUCTS ──────────────────────────────────────────
    http.get(`${BASE}/products`, () => {
        return HttpResponse.json({
            success: true,
            data: MOCK_PRODUCTS
        });
    }),

    http.get(`${BASE}/products/:id`, ({ params }) => {
        const product = MOCK_PRODUCTS.find(p => p.id === params.id);
        if (!product) {
            return HttpResponse.json(
                { success: false, message: 'Produit non trouvé' },
                { status: 404 }
            );
        }
        return HttpResponse.json({ success: true, data: product });
    }),

    http.post(`${BASE}/products`, () => {
        return HttpResponse.json({
            success: true,
            data: { ...MOCK_PRODUCTS[0], id: '99', name: 'New Product' }
        }, { status: 201 });
    }),

    http.put(`${BASE}/products/:id`, ({ params }) => {
        const product = MOCK_PRODUCTS.find(p => p.id === params.id);
        return HttpResponse.json({
            success: true,
            data: { ...product, name: 'Updated Product' }
        });
    }),

    http.delete(`${BASE}/products/:id`, () => {
        return HttpResponse.json({ success: true });
    }),

    // ── CATEGORIES ────────────────────────────────────────
    http.get(`${BASE}/categories`, () => {
        return HttpResponse.json({
            success: true,
            data: MOCK_CATEGORIES
        });
    }),

    http.post(`${BASE}/categories`, async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            data: { id: 'new-cat', ...body }
        }, { status: 201 });
    }),

    http.put(`${BASE}/categories/:id`, async ({ params, request }) => {
        const body = await request.json() as any;
        const cat = MOCK_CATEGORIES.find(c => c.id === params.id);
        return HttpResponse.json({
            success: true,
            data: { ...cat, ...body }
        });
    }),

    http.delete(`${BASE}/categories/:id`, () => {
        return HttpResponse.json({ success: true });
    }),

    // ── SETTINGS ──────────────────────────────────────────
    http.get(`${BASE}/settings/whatsapp_number`, () => {
        return HttpResponse.json({
            success: true,
            data: { value: MOCK_SETTINGS.whatsapp_number }
        });
    }),

    http.put(`${BASE}/settings/whatsapp`, () => {
        return HttpResponse.json({ success: true });
    }),

    // ── HOMEPAGE ──────────────────────────────────────────
    http.get(`${BASE}/homepage/hero`, () => {
        return HttpResponse.json({
            success: true,
            data: MOCK_HERO_SLIDES
        });
    }),

    http.post(`${BASE}/homepage/hero`, () => {
        return HttpResponse.json({
            success: true,
            data: { ...MOCK_HERO_SLIDES[0], id: 99 }
        }, { status: 201 });
    }),

    http.put(`${BASE}/homepage/hero/:id`, () => {
        return HttpResponse.json({ success: true });
    }),

    http.delete(`${BASE}/homepage/hero/:id`, () => {
        return HttpResponse.json({ success: true });
    }),

    http.get(`${BASE}/homepage/promo`, () => {
        return HttpResponse.json({
            success: true,
            data: MOCK_PROMO
        });
    }),

    http.put(`${BASE}/homepage/promo`, () => {
        return HttpResponse.json({ success: true });
    }),

    http.get(`${BASE}/homepage/gallery`, () => {
        return HttpResponse.json({
            success: true,
            data: MOCK_GALLERY
        });
    }),

    http.put(`${BASE}/homepage/gallery/:slot`, () => {
        return HttpResponse.json({ success: true });
    }),

    http.get(`${BASE}/homepage/blackfriday`, () => {
        return HttpResponse.json({
            success: true,
            data: MOCK_BLACKFRIDAY
        });
    }),

    http.put(`${BASE}/homepage/blackfriday`, () => {
        return HttpResponse.json({ success: true });
    }),
];
