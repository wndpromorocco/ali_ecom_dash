/**
 * DEMO MOCK LAYER
 * ----------------
 * Intercepts every `/api/v1/*` fetch and answers it from the static fixtures
 * captured in ./fixtures (a snapshot of the live catalog). This lets the site +
 * dashboard run on Vercel with NO back-end. Activated only when the build sets
 * `VITE_USE_MOCK=true` (see main.tsx). Images are served locally from
 * /public/uploads, so the demo is fully self-contained.
 *
 * Nothing here touches the normal (non-mock) code paths, so `main` stays intact.
 */
import products from './fixtures/products.json';
import categories from './fixtures/categories.json';
import settings from './fixtures/settings.json';
import hero from './fixtures/hero.json';
import gallery from './fixtures/gallery.json';
import promo from './fixtures/promo.json';
import blackfriday from './fixtures/blackfriday.json';

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// A demo admin so the dashboard (ProtectedRoute requires role ADMIN) is viewable.
const adminUser = {
  id: 'demo-admin',
  email: 'admin@demo.local',
  firstName: 'Admin',
  lastName: 'Démo',
  name: 'Admin Démo',
  role: 'ADMIN',
};
const tokens = { accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' };

const whatsappValue =
  (settings as any)?.data?.find?.((s: any) => s?.key === 'whatsapp_number')?.value || '+212649595793';

/** `path` is everything after `/api/v1`, e.g. "/products", "/auth/login". */
function resolve(method: string, path: string): Response {
  // --- auth: always succeed so the client can open the dashboard ---
  if (path.startsWith('/auth/login') || path.startsWith('/auth/register')) {
    return jsonResponse({ success: true, message: 'Connexion démo', data: { user: adminUser, tokens } });
  }
  if (path.startsWith('/auth/me')) {
    return jsonResponse({ success: true, data: { user: adminUser } });
  }
  if (path.startsWith('/auth/logout')) {
    return jsonResponse({ success: true });
  }

  // --- read-only catalog / homepage data ---
  if (method === 'GET') {
    if (path.startsWith('/products')) return jsonResponse(products);
    if (path.startsWith('/categories')) return jsonResponse(categories);
    if (path.startsWith('/homepage/hero')) return jsonResponse(hero);
    if (path.startsWith('/homepage/gallery')) return jsonResponse(gallery);
    if (path.startsWith('/homepage/promo')) return jsonResponse(promo);
    if (path.startsWith('/homepage/blackfriday')) return jsonResponse(blackfriday);
    if (path.startsWith('/settings/whatsapp')) {
      return jsonResponse({ success: true, data: { key: 'whatsapp_number', value: whatsappValue } });
    }
    if (path.startsWith('/settings')) return jsonResponse(settings);
  }

  // --- orders: pretend the order was placed so checkout shows a confirmation ---
  if (path.startsWith('/orders')) {
    return jsonResponse({
      success: true,
      message: 'Commande enregistrée (démo)',
      data: { id: 'demo-order', orderNumber: 'DEMO-1001' },
    });
  }

  // --- any other call (dashboard create/update/delete, etc.) ---
  // Succeed so the UI doesn't error; changes are NOT persisted in the demo.
  return jsonResponse({ success: true, message: 'Mode démo — action simulée (non enregistrée).', data: {} });
}

export function installMock(): void {
  // Auto-authenticate in the demo: pre-seed the token so AuthContext's
  // /auth/me (mocked below) returns the admin and the dashboard opens with
  // NO login screen. The client can visit /<slug>/dashboard directly.
  try {
    if (!localStorage.getItem('accessToken')) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  } catch {
    /* ignore (e.g. storage disabled) */
  }

  const originalFetch = window.fetch.bind(window);
  const MARKER = '/api/v1';

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const rawUrl =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url;
      const method = (
        init?.method || (input instanceof Request ? input.method : 'GET') || 'GET'
      ).toUpperCase();

      const url = new URL(rawUrl, window.location.origin);
      const i = url.pathname.indexOf(MARKER);
      if (i >= 0) {
        const path = url.pathname.slice(i + MARKER.length) || '/';
        return resolve(method, path);
      }
    } catch {
      // fall through to the real fetch on any parsing error
    }
    return originalFetch(input as RequestInfo | URL, init);
  };

  // eslint-disable-next-line no-console
  console.info(
    '%c[DEMO] Mock API active — data is a static snapshot; changes are not saved.',
    'color:#16a34a;font-weight:bold',
  );
}
