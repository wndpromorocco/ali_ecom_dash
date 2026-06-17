import { chromium } from '@playwright/test';

const BASE = process.argv[2] || 'https://ali-ecom-frontend.vercel.app';
const ADMIN = process.argv[3] || 'admin';
const PRODUCT_NAMES = ['Réfrigérateur NoFrost', "Smart TV LED 55", 'Micro-ondes Digital', 'AirFryer'];

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

const imgStats = () => page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')];
  const prod = imgs.filter((i) => /pexels|unsplash/.test(i.currentSrc || i.src));
  return {
    totalImgs: imgs.length,
    productImgs: prod.length,
    productLoaded: prod.filter((i) => i.naturalWidth > 0).length,
    broken: prod.filter((i) => i.naturalWidth === 0).map((i) => i.currentSrc || i.src).slice(0, 5),
  };
});
async function countNames() {
  const out = {};
  for (const n of PRODUCT_NAMES) out[n] = await page.getByText(n, { exact: false }).count();
  return out;
}

let names = {}, imgs = {};
for (const path of ['/', '/catalogue', '/produits', '/products', '/shop']) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2500);
  names = await countNames();
  imgs = await imgStats();
  const anyName = Object.values(names).some((c) => c > 0);
  console.log(`[${path}] names=${JSON.stringify(names)} imgs=${JSON.stringify(imgs)}`);
  if (anyName && imgs.productLoaded > 0) { console.log(`>> products + images OK on ${path}`); break; }
}

// Dashboard must open DIRECTLY with no login (auto-auth in demo).
let dashboardOK = false, dashboardNote = '';
try {
  await page.goto(`${BASE}/${ADMIN}/dashboard`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3500);
  const url = page.url();
  dashboardOK = /dashboard/i.test(url) && !/login/i.test(url);
  dashboardNote = `direct visit landed at ${url}`;
} catch (e) { dashboardNote = 'dashboard error: ' + e.message; }

console.log('\n==== SUMMARY ====');
console.log('Product names visible :', JSON.stringify(names));
console.log('Product images loaded :', `${imgs.productLoaded}/${imgs.productImgs}`, imgs.broken.length ? `broken: ${JSON.stringify(imgs.broken)}` : '');
console.log('Dashboard (no login)  :', dashboardOK ? 'OK — ' + dashboardNote : 'NOT confirmed — ' + dashboardNote);
console.log('Console errors        :', errors.length, errors.slice(0, 6));

await browser.close();
const pass = Object.values(names).some((c) => c > 0) && imgs.productLoaded > 0 && dashboardOK;
console.log('\nRESULT:', pass ? 'PASS ✅' : 'FAIL ❌');
process.exit(pass ? 0 : 1);
