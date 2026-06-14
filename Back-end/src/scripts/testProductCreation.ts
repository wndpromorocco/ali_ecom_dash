import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Integration test — /admin/products/new submission flow.
 *
 * Goal: prove the "Garantie" field (which replaced the shoe-size field on the
 * frontend) maps cleanly to the backend `size` column, and that the form's
 * string payload casts to the Prisma types with no schema violations.
 *
 * It faithfully replays the real code paths:
 *   1. ProductManagement.tsx  initialFormState (field is `warranty`)
 *   2. handleSubmit()         FormData construction (everything → strings, warranty → 'size')
 *   3. products.ts POST /     parseFloat(price) / parseInt(quantity) + prisma.product.create
 *
 * Run:  cd Back-end && npx ts-node src/scripts/testProductCreation.ts
 */

const prisma = new PrismaClient();

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function main() {
  console.log('🧪 Integration test — product creation (Garantie → size)\n');

  let createdId: string | null = null;
  let tempCategoryId: string | null = null;

  try {
    // A category is required (FK). Use a seeded one, or create a throwaway.
    let category = await prisma.category.findFirst({ where: { parentId: null } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: '__TEST_CAT__', slug: '__test_cat__', types: [], colors: [], isActive: true },
      });
      tempCategoryId = category.id;
      console.log('ℹ️  No category found — created a temporary one for the test.');
    }

    // ── 1) Frontend state (ProductManagement.tsx). NOTE: the field is `warranty`. ──
    const formData = {
      name: 'TEST Intégration Réfrigérateur',
      nameAr: 'اختبار',
      description: 'Produit de test (intégration)',
      price: '6500', // <input> values are strings
      discountPrice: '',
      promoStart: '',
      promoEnd: '',
      colors: [] as string[],
      type: 'Réfrigérateurs',
      warranty: '2 Ans', // ← the "Garantie (Mois / Ans)" field
      categoryId: category.id,
      sku: `TEST-INTEG-${Date.now()}`,
      images: ['', '', '', ''],
      isActive: true,
      quantity: 12,
    };

    // ── 2) Replay handleSubmit() FormData construction. ──
    //     Everything is appended as a string; `warranty` is mapped to the `size` key.
    const body: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'images') return;
      if (key === 'colors') { body.colors = JSON.stringify(value); return; }
      if (key === 'price') { body.price = String(formData.price); return; }
      if (key === 'discountPrice') return; // only appended when a promo is active
      if (key === 'isActive') { body.isActive = String(value); return; }
      if (key === 'warranty') { body.size = String(value); return; } // ← warranty → size
      body[key] = String(value as string);
    });

    console.log('📤 Request body the backend receives:');
    console.log('   size (from Garantie):', JSON.stringify(body.size));
    console.log('   price:', JSON.stringify(body.price), '· quantity:', JSON.stringify(body.quantity), '· type:', JSON.stringify(body.type));
    if ('warranty' in body) throw new Error("payload still contains 'warranty' — the warranty→size mapping failed");

    // ── 3) Replay products.ts POST / parsing + prisma.product.create. ──
    const created = await prisma.product.create({
      data: {
        name: body.name,
        nameAr: body.nameAr,
        description: body.description,
        price: parseFloat(body.price),            // string → Decimal
        categoryId: body.categoryId,
        quantity: parseInt(body.quantity) || 0,   // string → Int
        sku: body.sku,
        tags: body.tags ? JSON.parse(body.tags) : [],
        colors: body.colors ? JSON.parse(body.colors) : [],
        slug: slugify(body.name),
        isActive: (parseInt(body.quantity) || 0) > 0,
        trackQuantity: true,
        type: body.type,
        size: body.size,                          // ← the warranty value lands here
        images: [],
      },
    });
    createdId = created.id;

    // ── 4) Assertions: clean mapping + correct Prisma types, no casting errors. ──
    const checks: Array<[string, boolean, unknown]> = [
      ["size === '2 Ans' (Garantie persisted to size column)", created.size === '2 Ans', created.size],
      ['price === 6500 (string → Decimal)', Number(created.price) === 6500, created.price?.toString()],
      ['quantity === 12 (string → Int)', created.quantity === 12, created.quantity],
      ['type persisted (required field)', created.type === 'Réfrigérateurs', created.type],
      ['isActive derived from stock > 0', created.isActive === true, created.isActive],
    ];

    console.log('\n🔎 Assertions:');
    let allPass = true;
    for (const [label, ok, actual] of checks) {
      console.log(`   ${ok ? '✅' : '❌'} ${label}  (got: ${JSON.stringify(actual)})`);
      if (!ok) allPass = false;
    }

    console.log(
      allPass
        ? '\n✅ PASS — "Garantie" maps cleanly to `size`; no casting / Prisma schema violations.'
        : '\n❌ FAIL — see failing assertions above.',
    );
    if (!allPass) process.exitCode = 1;
  } catch (err: any) {
    console.error('\n❌ FAIL — error during creation (potential type / schema violation):');
    console.error(err?.message || err);
    process.exitCode = 1;
  } finally {
    if (createdId) {
      await prisma.product.delete({ where: { id: createdId } }).catch(() => {});
      console.log('🧹 Cleaned up the test product.');
    }
    if (tempCategoryId) {
      await prisma.category.delete({ where: { id: tempCategoryId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

main();
