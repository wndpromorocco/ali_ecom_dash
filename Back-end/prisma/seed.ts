import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'herbs' },
      update: {},
      create: {
        name: 'Herbes',
        slug: 'herbs',
        description: 'Herbes fraîches et séchées pour la cuisine et la santé',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'spices' },
      update: {},
      create: {
        name: 'Épices',
        slug: 'spices',
        description: 'Épices authentiques du Maroc et du monde',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'essential-oils' },
      update: {},
      create: {
        name: 'Huiles Essentielles',
        slug: 'essential-oils',
        description: 'Huiles essentielles pures et naturelles',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'natural-cosmetics' },
      update: {},
      create: {
        name: 'Cosmétiques Naturels',
        slug: 'natural-cosmetics',
        description: 'Produits de beauté naturels et bio',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'herbal-teas' },
      update: {},
      create: {
        name: 'Tisanes',
        slug: 'herbal-teas',
        description: 'Tisanes et thés aux herbes pour le bien-être',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create admin user
  const hashedPassword = await hashPassword('admin123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@herbio.ma' },
    update: {},
    create: {
      email: 'admin@herbio.ma',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Herbio',
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Admin user created');

  // Create sample products
  const products = await Promise.all([
    // Herbs category products
    prisma.product.upsert({
      where: { slug: 'menthe-fraiche' },
      update: {},
      create: {
        name: 'Menthe Fraîche',
        slug: 'menthe-fraiche',
        description: 'Menthe fraîche cultivée localement, parfaite pour les thés et la cuisine marocaine.',
        shortDescription: 'Menthe fraîche locale de qualité premium',
        sku: 'HERB-MINT-001',
        price: 15.00,
        comparePrice: 20.00,
        quantity: 100,
        weight: 0.1,
        isActive: true,
        isFeatured: true,
        categoryId: categories[0].id,
        tags: ['menthe', 'fraîche', 'local', 'bio'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'basilic-sacre' },
      update: {},
      create: {
        name: 'Basilic Sacré',
        slug: 'basilic-sacre',
        description: 'Basilic sacré séché, connu pour ses propriétés adaptogènes et son arôme unique.',
        shortDescription: 'Basilic sacré séché aux propriétés exceptionnelles',
        sku: 'HERB-BASIL-001',
        price: 45.00,
        quantity: 50,
        weight: 0.05,
        isActive: true,
        categoryId: categories[0].id,
        tags: ['basilic', 'sacré', 'adaptogène', 'séché'],
      },
    }),
    // Spices category products
    prisma.product.upsert({
      where: { slug: 'ras-el-hanout' },
      update: {},
      create: {
        name: 'Ras El Hanout',
        slug: 'ras-el-hanout',
        description: 'Mélange d\'épices traditionnel marocain, composé de plus de 20 épices soigneusement sélectionnées.',
        shortDescription: 'Mélange d\'épices marocain authentique',
        sku: 'SPICE-REH-001',
        price: 65.00,
        comparePrice: 80.00,
        quantity: 75,
        weight: 0.1,
        isActive: true,
        isFeatured: true,
        categoryId: categories[1].id,
        tags: ['ras-el-hanout', 'épices', 'marocain', 'traditionnel'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'curcuma-bio' },
      update: {},
      create: {
        name: 'Curcuma Bio',
        slug: 'curcuma-bio',
        description: 'Curcuma bio en poudre, riche en curcumine, aux propriétés anti-inflammatoires reconnues.',
        shortDescription: 'Curcuma bio de qualité supérieure',
        sku: 'SPICE-TUR-001',
        price: 35.00,
        quantity: 120,
        weight: 0.1,
        isActive: true,
        categoryId: categories[1].id,
        tags: ['curcuma', 'bio', 'anti-inflammatoire', 'curcumine'],
      },
    }),
    // Essential oils category products
    prisma.product.upsert({
      where: { slug: 'huile-argan-pure' },
      update: {},
      create: {
        name: 'Huile d\'Argan Pure',
        slug: 'huile-argan-pure',
        description: 'Huile d\'argan 100% pure et naturelle, extraite à froid des noix d\'arganier du Maroc.',
        shortDescription: 'Huile d\'argan pure extraction à froid',
        sku: 'OIL-ARG-001',
        price: 120.00,
        comparePrice: 150.00,
        quantity: 30,
        weight: 0.05,
        isActive: true,
        isFeatured: true,
        categoryId: categories[2].id,
        tags: ['argan', 'huile', 'pure', 'naturelle', 'maroc'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'huile-lavande' },
      update: {},
      create: {
        name: 'Huile Essentielle de Lavande',
        slug: 'huile-lavande',
        description: 'Huile essentielle de lavande vraie, apaisante et relaxante, parfaite pour l\'aromathérapie.',
        shortDescription: 'Huile essentielle de lavande apaisante',
        sku: 'OIL-LAV-001',
        price: 85.00,
        quantity: 40,
        weight: 0.01,
        isActive: true,
        categoryId: categories[2].id,
        tags: ['lavande', 'huile-essentielle', 'apaisante', 'aromathérapie'],
      },
    }),
  ]);

  console.log('✅ Products created');

  // Create product images
  const productImages = await Promise.all([
    // Menthe fraîche images
    prisma.productImage.create({
      data: {
        productId: products[0].id,
        url: '/images/products/menthe-fraiche-1.jpg',
        altText: 'Menthe fraîche - Vue principale',
        position: 0,
      },
    }),
    prisma.productImage.create({
      data: {
        productId: products[0].id,
        url: '/images/products/menthe-fraiche-2.jpg',
        altText: 'Menthe fraîche - Détail des feuilles',
        position: 1,
      },
    }),
    // Ras El Hanout images
    prisma.productImage.create({
      data: {
        productId: products[2].id,
        url: '/images/products/ras-el-hanout-1.jpg',
        altText: 'Ras El Hanout - Mélange d\'épices',
        position: 0,
      },
    }),
    // Huile d'argan images
    prisma.productImage.create({
      data: {
        productId: products[4].id,
        url: '/images/products/huile-argan-1.jpg',
        altText: 'Huile d\'argan pure - Flacon',
        position: 0,
      },
    }),
  ]);

  console.log('✅ Product images created');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - 1 admin user`);
  console.log(`   - ${products.length} products`);
  console.log(`   - ${productImages.length} product images`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });