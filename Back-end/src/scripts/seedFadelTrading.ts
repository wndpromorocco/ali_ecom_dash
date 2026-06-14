import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Seed: Fadel Trading — Home Appliances & Electronics
 * (الأجهزة الإلكترونية المنزلية والكهربائية)
 *
 * 30 products across the 3 main categories. Idempotent (upsert by category
 * `name` / product `sku`). Makes the catalog EXACTLY these 30 products
 * (removes any product whose SKU is not in this list).
 *
 * Schema mapping:
 *   - specs              → product.description (full technical specs string)
 *   - "Garantie: X"      → product.size  (the column the "Garantie" UI field writes)
 *   - tech attributes    → category.colors[]  (the "Attributs Techniques" column)
 *
 * Run:  cd Back-end && npx ts-node src/scripts/seedFadelTrading.ts
 */

const prisma = new PrismaClient();

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Extract the warranty out of the specs string → stored in `size`.
const warrantyOf = (specs: string): string => {
  const m = specs.match(/Garantie\s*:\s*([^,]+)/i);
  return m ? m[1].trim() : '';
};

// Main categories: Arabic label + the technical-attribute set applied to their sub-categories.
const CATEGORIES: Record<string, { nameAr: string; attrs: string[] }> = {
  'Gros Électroménager': {
    nameAr: 'الأجهزة الكبيرة',
    attrs: ['Marque', 'Capacité (Litres)', 'Classe Énergétique'],
  },
  'Petit Électroménager': {
    nameAr: 'الأجهزة الصغيرة',
    attrs: ['Puissance (Watt)', 'Vitesse', 'Couleur'],
  },
  'Électronique & TV': {
    nameAr: 'الإلكترونيات والتلفزيونات',
    attrs: ['Résolution (4K/8K)', "Taille d'écran (Pouces)"],
  },
};

type SeedProduct = {
  name: string;
  price: number;
  stock: number;
  sku: string;
  image: string;
  specs: string;
  type: string;     // sub-category
  category: keyof typeof CATEGORIES;
};

const PRODUCTS: SeedProduct[] = [
  // ── CATEGORY 1: Gros Électroménager ──────────────────────────────
  { name: "Réfrigérateur NoFrost MultiAir 450L", price: 6800, stock: 15, sku: "GE-REF-450", type: "Réfrigérateurs", category: "Gros Électroménager", image: "https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Capacité: 450L, Garantie: 2 Ans, Classe: A++" },
  { name: "Machine à Laver Hublot Inverter 8kg", price: 4200, stock: 22, sku: "GE-MAL-008", type: "Machines à laver", category: "Gros Électroménager", image: "https://images.pexels.com/photos/5591460/pexels-photo-5591460.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Capacité: 8kg, Vitesse: 1400 tr/min, Garantie: 2 Ans" },
  { name: "Lave-Vaisselle Intégrable 13 Couverts", price: 3800, stock: 10, sku: "GE-LV-013", type: "Lave-vaisselle", category: "Gros Électroménager", image: "https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=500", specs: "13 Couverts, 6 Programmes, Garantie: 1 An" },
  { name: "Cuisinière Piano à Gaz 4 Foyers Inox", price: 2950, stock: 14, sku: "GE-CUI-4F", type: "Cuisinières", category: "Gros Électroménager", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500", specs: "Inox, Four Électrique intégré, Garantie: 1 An" },
  { name: "Congélateur Coffre Horizontal 200L", price: 2600, stock: 8, sku: "GE-CON-200", type: "Congélateurs", category: "Gros Électroménager", image: "https://images.pexels.com/photos/2079698/pexels-photo-2079698.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Volume: 200L, Autonomie 24h, Garantie: 2 Ans" },
  { name: "Four Encastrable Chaleur Tournante", price: 3100, stock: 19, sku: "GE-FOU-ENC", type: "Fours", category: "Gros Électroménager", image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500", specs: "Volume: 70L, Minuterie Digitale, Garantie: 2 Ans" },
  { name: "Plaque de Cuisson Induction 3 Zones", price: 2400, stock: 12, sku: "GE-PLA-IND", type: "Plaques de cuisson", category: "Gros Électroménager", image: "https://images.pexels.com/photos/15668079/pexels-photo-15668079.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Commande Tactile, Booster, Garantie: 1 An" },
  { name: "Hotte Aspirante Pyramidale 60cm Inox", price: 1250, stock: 25, sku: "GE-HOT-060", type: "Hottes", category: "Gros Électroménager", image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=500", specs: "Débit: 450 m³/h, Éclairage LED, Garantie: 1 An" },
  { name: "Chauffe-Eau Électrique Blindé 80L", price: 1450, stock: 30, sku: "GE-CHE-080", type: "Chauffe-eau", category: "Gros Électroménager", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500", specs: "Capacité: 80L, Cuve Émaillée, Garantie: 1 An" },
  { name: "Climatiseur Split Tropicalisé 12000 BTU", price: 3990, stock: 18, sku: "GE-CLI-012", type: "Climatiseurs", category: "Gros Électroménager", image: "https://images.pexels.com/photos/16848596/pexels-photo-16848596.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Inverter, Chaud/Froid, Garantie: 2 Ans" },

  // ── CATEGORY 2: Petit Électroménager ─────────────────────────────
  { name: "Blender Mixeur Professionnel 1200W", price: 750, stock: 40, sku: "PE-BLE-120", type: "Blenders & Mixeurs", category: "Petit Électroménager", image: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500", specs: "Puissance: 1200W, Bol en Verre 1.5L, Garantie: 1 An" },
  { name: "Aspirateur Balai Sans Fil Cyclonique", price: 1650, stock: 28, sku: "PE-ASP-BAL", type: "Aspirateurs", category: "Petit Électroménager", image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500", specs: "Autonomie: 45 min, Filtre HEPA, Garantie: 1 An" },
  { name: "Micro-ondes Digital Grill 25L Inox", price: 1100, stock: 35, sku: "PE-MIC-025", type: "Micro-ondes", category: "Petit Électroménager", image: "https://images.pexels.com/photos/4686822/pexels-photo-4686822.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Puissance: 900W, Mode Grill, Garantie: 1 An" },
  { name: "Machine à Café Expresso 15 Bars", price: 1350, stock: 20, sku: "PE-CAF-EXP", type: "Machines à café", category: "Petit Électroménager", image: "https://images.pexels.com/photos/4993062/pexels-photo-4993062.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Pression: 15 Bars, Buse Vapeur, Garantie: 2 Ans" },
  { name: "Friteuse Sans Huile AirFryer XL 4.5L", price: 990, stock: 50, sku: "PE-FRI-AIR", type: "Friteuses", category: "Petit Électroménager", image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500", specs: "Capacité: 4.5L, Écran Tactile, Garantie: 1 An" },
  { name: "Robot Pétrin Multifonctions 5L", price: 1850, stock: 15, sku: "PE-ROB-PET", type: "Robots de cuisine", category: "Petit Électroménager", image: "https://images.pexels.com/photos/8357682/pexels-photo-8357682.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Puissance: 1500W, Bol Inox, Garantie: 2 Ans" },
  { name: "Presse-Agrumes Électrique Automatique", price: 320, stock: 60, sku: "PE-PRE-AGR", type: "Presse-agrumes", category: "Petit Électroménager", image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500", specs: "Puissance: 85W, Double Cône, Garantie: 1 An" },
  { name: "Bouilloire Électrique en Verre LED 1.7L", price: 250, stock: 80, sku: "PE-BOU-LED", type: "Bouilloires", category: "Petit Électroménager", image: "https://images.pexels.com/photos/6994196/pexels-photo-6994196.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "Arrêt Automatique, Socle 360°, Garantie: 1 An" },
  { name: "Grille-Pain 2 Fentes Inox Brossé", price: 290, stock: 45, sku: "PE-GRI-PAI", type: "Grille-pain", category: "Petit Électroménager", image: "https://images.pexels.com/photos/5825716/pexels-photo-5825716.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "7 Niveaux de dorage, Garantie: 1 An" },
  { name: "Centrifugeuse Extracteur de Jus Pro", price: 890, stock: 22, sku: "PE-CEN-EXT", type: "Extracteurs de jus", category: "Petit Électroménager", image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500", specs: "Large Goulotte, Vitesse Réglable, Garantie: 1 An" },

  // ── CATEGORY 3: Électronique & TV ────────────────────────────────
  { name: "Smart TV LED 55'' Ultra HD 4K", price: 4300, stock: 12, sku: "EL-TV-055", type: "Smart TVs", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500", specs: "Résolution: 4K UHD, OS: Android TV, Garantie: 2 Ans" },
  { name: "Barre de Son Home Cinéma Bluetooth", price: 1150, stock: 25, sku: "EL-BDS-HOM", type: "Barres de son", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500", specs: "Puissance: 120W, Caisson de Basse, Garantie: 1 An" },
  { name: "Récepteur Satellite Numérique 4K WiFi", price: 450, stock: 70, sku: "EL-REC-4KW", type: "Récepteurs", category: "Électronique & TV", image: "https://images.pexels.com/photos/18186205/pexels-photo-18186205.jpeg?auto=compress&cs=tinysrgb&w=500", specs: "IPTV Compatible, Port USB, Garantie: 1 An" },
  { name: "Smart TV OLED 65'' Premium Cinematic", price: 11500, stock: 5, sku: "EL-TV-065", type: "Smart TVs", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500", specs: "Écran OLED, HDR10+, Garantie: 2 Ans" },
  { name: "Android TV Box Streamer 4K Ultra", price: 550, stock: 55, sku: "EL-BOX-AND", type: "Box TV", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", specs: "Ram: 4GB, Stockage: 32GB, Garantie: 1 An" },
  { name: "Vidéoprojecteur Home Cinema Full HD", price: 2800, stock: 14, sku: "EL-VID-PRO", type: "Vidéoprojecteurs", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500", specs: "Luminosité: 3500 Lumens, WiFi, Garantie: 1 An" },
  { name: "Support Mural TV Orientable 32-65''", price: 180, stock: 120, sku: "EL-SUP-MUR", type: "Accessoires TV", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500", specs: "Poids Max: 45kg, Inclinaison +/-15°" },
  { name: "Casque Audio Sans Fil Réduction de Bruit", price: 650, stock: 40, sku: "EL-CAS-ANC", type: "Audio", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", specs: "Autonomie: 30h, Bluetooth 5.2, Garantie: 1 An" },
  { name: "Enceinte Connectée Intelligente Assistant", price: 490, stock: 38, sku: "EL-ENC-INT", type: "Audio", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500", specs: "Contrôle Vocal WiFi, Bluetooth, Garantie: 1 An" },
  { name: "Câble HDMI 2.1 Haute Vitesse 4K/8K 3M", price: 95, stock: 200, sku: "EL-CAB-HDM", type: "Accessoires TV", category: "Électronique & TV", image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=500", specs: "Longueur: 3 Mètres, Connecteurs Dorés" },
];

async function main() {
  console.log('🌱 Seeding Fadel Trading — 30 products (Home Appliances & Electronics)\n');

  // ── STEP 1: main categories + sub-categories (types) ──
  const mainIds: Record<string, string> = {};
  for (const [name, meta] of Object.entries(CATEGORIES)) {
    const parent = await prisma.category.upsert({
      where: { name },
      update: { nameAr: meta.nameAr, parentId: null, isActive: true },
      create: { name, nameAr: meta.nameAr, slug: slugify(name), parentId: null, types: [], colors: [], isActive: true },
    });
    mainIds[name] = parent.id;
  }

  // distinct (category, type) → sub-category records carrying that category's attributes
  const subSeen = new Set<string>();
  for (const p of PRODUCTS) {
    if (subSeen.has(p.type)) continue;
    subSeen.add(p.type);
    await prisma.category.upsert({
      where: { name: p.type },
      update: { parentId: mainIds[p.category], colors: CATEGORIES[p.category].attrs, isActive: true },
      create: {
        name: p.type,
        slug: slugify(p.type),
        parentId: mainIds[p.category],
        types: [],
        colors: CATEGORIES[p.category].attrs,
        isActive: true,
      },
    });
  }
  console.log(`📂 Catégories: 3 principales · ${subSeen.size} sous-catégories\n`);

  // ── STEP 2: make the catalog exactly these 30 products ──
  const allSkus = PRODUCTS.map((p) => p.sku);
  const removed = await prisma.product.deleteMany({ where: { sku: { notIn: allSkus } } });
  if (removed.count > 0) console.log(`🧹 Removed ${removed.count} product(s) not in the 30-item list.\n`);

  let n = 0;
  for (const p of PRODUCTS) {
    const data = {
      name: p.name,
      slug: slugify(p.name),
      sku: p.sku,
      price: p.price,
      quantity: p.stock,
      size: warrantyOf(p.specs),     // ← "Garantie: X" → size column
      type: p.type,
      categoryId: mainIds[p.category],
      images: [p.image],
      description: p.specs,           // ← full specs string
      isActive: p.stock > 0,
    };
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: data,
      create: { ...data, tags: [], colors: [], isFeatured: false, trackQuantity: true },
    });
    n++;
    console.log(`   ${String(n).padStart(2, '0')}. ✅ ${product.name}  ·  ${Number(product.price)} MAD  ·  stock ${product.quantity}  ·  garantie ${product.size || '—'}`);
  }

  const total = await prisma.product.count();
  console.log(`\n🎉 Terminé. Produits dans le catalogue: ${total}`);
  if (total !== 30) console.warn(`⚠️  Expected 30 products, found ${total}.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
