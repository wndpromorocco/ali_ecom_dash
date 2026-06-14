import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Seed: Fadel Trading — Homepage storefront (/admin/homepage · "Gestion de Vitrine")
 * Fills the 4 modules: HERO · PROMO · GALERIE · BLACK FRIDAY.
 *
 * Model map (traced from prisma/schema.prisma):
 *   HERO         → HeroSlide        (hero_slides)        : imageUrl, title, subtitle, order, isActive   [many]
 *   PROMO        → HomepagePromo    (homepage_promo)     : imageUrl, sectionTitle, sectionSubtitle,
 *                                                          promoEndDate, productId, isActive            [single — findFirst]
 *   GALERIE      → GalleryImage     (gallery_images)     : slot (1..5, unique), imageUrl, altText        [up to 5]
 *   BLACK FRIDAY → BlackFridayConfig(blackfriday_config) : line1, line2, badgeText, emoji, colors,
 *                                                          isActive  (NO image/subtitle fields)          [single]
 *
 * Run:  cd Back-end && npx ts-node src/scripts/seedHomepage.ts
 */

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding homepage storefront — Fadel Trading\n');

  // ── 1) HERO — 2 carousel slides ──────────────────────────────────
  await prisma.heroSlide.deleteMany({});
  await prisma.heroSlide.createMany({
    data: [
      {
        title: 'RÉVOLUTIONNEZ VOTRE CUISINE',
        subtitle: 'Jusqu’à -30% sur le gros électroménager intelligent de grande marque.',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1920&q=80',
        order: 1,
        isActive: true,
      },
      {
        title: 'L’EXPÉRIENCE CINÉMA À LA MAISON',
        subtitle: 'Découvrez notre nouvelle sélection de Smart TVs OLED 4K Premium.',
        imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1920&q=80',
        order: 2,
        isActive: true,
      },
    ],
  });
  console.log('🖼️  HERO       : 2 slides');

  // ── 2) PROMO — single promo section (linked to a real product) ───
  // Schema supports ONE promo (the API reads it via findFirst). Seeding "Promo 1".
  const promoProduct = await prisma.product.findUnique({ where: { sku: 'PE-FRI-AIR' } });
  const promoData = {
    isActive: true,
    sectionTitle: 'Pack Petit Électroménager',
    sectionSubtitle: 'Blender Pro + AirFryer XL acheté = un presse-agrumes offert.',
    imageUrl: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=800',
    promoEndDate: new Date('2026-12-31T23:59:00Z'),
    productId: promoProduct?.id ?? null,
  };
  const existingPromo = await prisma.homepagePromo.findFirst();
  if (existingPromo) {
    await prisma.homepagePromo.update({ where: { id: existingPromo.id }, data: promoData });
  } else {
    await prisma.homepagePromo.create({ data: promoData });
  }
  console.log(`💸 PROMO      : "${promoData.sectionTitle}"${promoProduct ? ` (→ ${promoProduct.name})` : ''}`);

  // ── 3) GALERIE — gallery grid (slots 1..5, slot is unique → upsert) ──
  const gallery = [
    { slot: 1, imageUrl: 'https://images.pexels.com/photos/6835104/pexels-photo-6835104.jpeg?auto=compress&cs=tinysrgb&w=600', altText: 'Cuisine — Gros Électroménager' },
    { slot: 2, imageUrl: 'https://images.pexels.com/photos/5591460/pexels-photo-5591460.jpeg?auto=compress&cs=tinysrgb&w=600', altText: 'Lave-linge & Essentiels' },
    { slot: 3, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', altText: 'Audio & Gadgets' },
    { slot: 4, imageUrl: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=600', altText: 'Smart TV & Image' },
    { slot: 5, imageUrl: 'https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg?auto=compress&cs=tinysrgb&w=600', altText: 'Réfrigération' },
  ];
  for (const g of gallery) {
    await prisma.galleryImage.upsert({
      where: { slot: g.slot },
      update: { imageUrl: g.imageUrl, altText: g.altText },
      create: g,
    });
  }
  console.log(`🧱 GALERIE    : ${gallery.length} slots (3 fournis + 2 complémentaires)`);

  // ── 4) BLACK FRIDAY — colored text card (no image/subtitle in schema) ──
  // Mapping: Titre → line1/line2, Tagline → badgeText, emoji → ⚡ (was 👟).
  const bfData = {
    isActive: true,
    emoji: '⚡',
    line1: 'WEEK-END',
    line2: 'CHOC ELECTROS',
    badgeText: 'VENTE FLASH MAD',
    bgColor: '#0F172A',
    textColor: '#FFFFFF',
    borderColor: '#06B6D4',
  };
  const existingBf = await prisma.blackFridayConfig.findFirst();
  if (existingBf) {
    await prisma.blackFridayConfig.update({ where: { id: existingBf.id }, data: bfData });
  } else {
    await prisma.blackFridayConfig.create({ data: bfData });
  }
  console.log('⚡ BLACK FRIDAY: "WEEK-END / CHOC ELECTROS" · badge "VENTE FLASH MAD"');

  // ── Summary ──
  const [hero, promo, gal, bf] = await Promise.all([
    prisma.heroSlide.count(),
    prisma.homepagePromo.count(),
    prisma.galleryImage.count(),
    prisma.blackFridayConfig.count(),
  ]);
  console.log(`\n🎉 Vitrine remplie — hero:${hero} · promo:${promo} · galerie:${gal} · blackfriday:${bf}`);
}

main()
  .catch((e) => {
    console.error('❌ Homepage seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
