import { chromium } from '@playwright/test';

const BASE = process.argv[2] || 'https://ali-ecom-frontend.vercel.app';
const ADMIN = process.argv[3] || 'admin';
const PRODUCT_NAMES = ['Black mono', 'Hermado prestige noir'];

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

async function imgStats() {
  return page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const up = imgs.filter((i) => (i.currentSrc || i.src).includes('/uploads/'));
    return {
      totalImgs: imgs.length,
      uploadImgs: up.length,
      uploadLoaded: up.filter((i) => i.naturalWidth > 0).length,
      brokenUploads: up.filter((i) => i.naturalWidth === 0).map((i) => i.currentSrc || i.src).slice(0, 5),
    };
  });
}
async function countNames() {
  const out = {};
  for (const n of PRODUCT_NAMES) out[n] = await page.getByText(n, { exact: false }).count();
  return out;
}

// ---- 1) Public site: try homepage then catalogue routes ----
let names = {}, imgs = {};
for (const path of ['/', '/catalogue', '/produits', '/products', '/shop']) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);
  names = await countNames();
  imgs = await imgStats();
  const anyName = Object.values(names).some((c) => c > 0);
  console.log(`[${path}] names=${JSON.stringify(names)} imgs=${JSON.stringify(imgs)}`);
  if (anyName && imgs.uploadLoaded > 0) { console.log(`>> products + images OK on ${path}`); break; }
}

// ---- 2) Dashboard: login via mock auth ----
let dashboardOK = false, dashboardNote = '';
try {
  await page.goto(`${BASE}/${ADMIN}/login`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1500);
  const emailField = page.locator('input[type="email"], input[name="email"], input[name="identifier"]').first();
  const passField = page.locator('input[type="password"]').first();
  if (await emailField.count()) await emailField.fill('admin@demo.local');
  if (await passField.count()) await passField.fill('demo1234');
  const submit = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")').first();
  if (await submit.count()) await submit.click();
  await page.waitForTimeout(3500);
  const url = page.url();
  dashboardOK = /dashboard|admin/i.test(url) && !/login/i.test(url);
  dashboardNote = `landed at ${url}`;
} catch (e) { dashboardNote = 'login flow error: ' + e.message; }

console.log('\n==== SUMMARY ====');
console.log('Product names visible :', JSON.stringify(names));
console.log('Upload images loaded  :', `${imgs.uploadLoaded}/${imgs.uploadImgs}` , imgs.brokenUploads.length ? `broken: ${JSON.stringify(imgs.brokenUploads)}` : '');
console.log('Dashboard login       :', dashboardOK ? 'OK — ' + dashboardNote : 'NOT confirmed — ' + dashboardNote);
console.log('Console errors        :', errors.length, errors.slice(0, 6));

await browser.close();
const pass = Object.values(names).some((c) => c > 0) && imgs.uploadLoaded > 0;
console.log('\nRESULT:', pass ? 'PASS ✅' : 'FAIL ❌');
process.exit(pass ? 0 : 1);
