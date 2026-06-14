export const MOCK_PRODUCTS = [
    {
        id: '1',
        name: 'Nike Air Max 270',
        nameAr: 'نايك اير ماكس',
        sku: 'HRM-001',
        price: 1290,
        discountPrice: 990,
        promoStart: '2026-01-01T00:00:00.000Z',
        promoEnd: '2026-12-31T23:59:00.000Z',
        color: 'Noir',
        type: 'Sneakers',
        size: '40-45',
        categoryId: 'cat-1',
        category: 'Hommes',
        images: ['https://images.pexels.com/photos/5591460/pexels-photo-5591460.jpeg?auto=compress&cs=tinysrgb&w=800'],
        isActive: true,
        quantity: 15,
        description: 'Chaussure de sport premium',
    },
    {
        id: '2',
        name: 'Adidas Ultraboost 22',
        nameAr: 'اديداس الترابوست',
        sku: 'HRM-002',
        price: 1490,
        discountPrice: null,
        promoStart: null,
        promoEnd: null,
        color: 'Blanc',
        type: 'Running',
        size: '38-44',
        categoryId: 'cat-2',
        category: 'Femmes',
        images: ['https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=800'],
        isActive: true,
        quantity: 0,
        description: 'Chaussure de running légère',
    },
    {
        id: '3',
        name: 'Puma Suede Classic',
        nameAr: 'بوما سويد',
        sku: 'HRM-003',
        price: 850,
        discountPrice: null,
        promoStart: null,
        promoEnd: null,
        color: 'Camel',
        type: 'Casual',
        size: '36-42',
        categoryId: 'cat-3',
        category: 'Enfants',
        images: [],
        isActive: false,
        quantity: 5,
        description: '',
    },
];

export const MOCK_CATEGORIES = [
    {
        id: 'cat-1',
        name: 'Hommes',
        nameAr: 'رجال',
        parentId: null,
        colors: [],
        types: []
    },
    {
        id: 'cat-2',
        name: 'Femmes',
        nameAr: 'نساء',
        parentId: null,
        colors: [],
        types: []
    },
    {
        id: 'cat-3',
        name: 'Enfants',
        nameAr: 'أطفال',
        parentId: null,
        colors: [],
        types: []
    },
    {
        id: 'sub-1',
        name: 'Sneakers',
        nameAr: 'سنيكرز',
        parentId: 'cat-1',
        colors: ['Noir', 'Blanc', 'Rouge Hermado']
    },
    {
        id: 'sub-2',
        name: 'Running',
        nameAr: 'جري',
        parentId: 'cat-2',
        colors: ['Blanc', 'Gris Clair']
    },
];

export const MOCK_SETTINGS = {
    whatsapp_number: '+212649595793',
};

export const MOCK_HERO_SLIDES = [
    {
        id: 1,
        imageUrl: 'https://images.pexels.com/photos/15668079/pexels-photo-15668079.jpeg?auto=compress&cs=tinysrgb&w=1400',
        title: 'Collection Automne',
        subtitle: 'Nouveautés 2026',
        order: 0,
        isActive: true,
    },
    {
        id: 2,
        imageUrl: 'https://images.pexels.com/photos/18186205/pexels-photo-18186205.jpeg?auto=compress&cs=tinysrgb&w=1400',
        title: 'Soldes Hiver',
        subtitle: 'Jusqu\'à -50%',
        order: 1,
        isActive: true,
    },
];

export const MOCK_PROMO = {
    id: 1,
    isActive: true,
    promoEndDate: '2026-12-31T23:59:00.000Z',
    sectionTitle: 'Offre de Bienvenue',
    sectionSubtitle: 'Notre plus grande démarque saisonnière.',
    productId: 1,
    product: MOCK_PRODUCTS[0],
};

export const MOCK_GALLERY = [
    { id: 1, slot: 1, imageUrl: 'https://images.pexels.com/photos/6835104/pexels-photo-6835104.jpeg?auto=compress&cs=tinysrgb&w=800', altText: '' },
    { id: 2, slot: 2, imageUrl: 'https://images.pexels.com/photos/5591460/pexels-photo-5591460.jpeg?auto=compress&cs=tinysrgb&w=800', altText: '' },
    { id: 3, slot: 3, imageUrl: 'https://images.pexels.com/photos/11097671/pexels-photo-11097671.jpeg?auto=compress&cs=tinysrgb&w=800', altText: '' },
    { id: 4, slot: 4, imageUrl: 'https://images.pexels.com/photos/15668079/pexels-photo-15668079.jpeg?auto=compress&cs=tinysrgb&w=800', altText: '' },
    { id: 5, slot: 5, imageUrl: 'https://images.pexels.com/photos/18186205/pexels-photo-18186205.jpeg?auto=compress&cs=tinysrgb&w=800', altText: '' },
];

export const MOCK_BLACKFRIDAY = {
    id: 1,
    isActive: true,
    emoji: '📺',
    line1: 'BLACK',
    line2: 'FRIDAY',
    badgeText: 'SOLDES FOLES',
    bgColor: '#0F172A',
    textColor: '#FFFFFF',
    borderColor: '#06B6D4',
};

export const MOCK_USER = {
    id: 'u-1',
    email: 'admin@fadeltrading.com',
    role: 'ADMIN',
    accessToken: 'mock-jwt-token-hermado-2026',
};
