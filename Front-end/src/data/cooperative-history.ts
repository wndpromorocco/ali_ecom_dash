export interface HistoryEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  image: string;
  category: 'foundation' | 'growth' | 'certification' | 'expansion' | 'innovation' | 'community';
  achievements?: string[];
}

export interface CooperativeStats {
  foundedYear: number;
  membersCount: number;
  farmsCount: number;
  productsCount: number;
  regionsCount: number;
  certifications: string[];
}

export const cooperativeStats: CooperativeStats = {
  foundedYear: 1995,
  membersCount: 450,
  farmsCount: 85,
  productsCount: 120,
  regionsCount: 8,
  certifications: ['Bio Maroc', 'Ecocert', 'Fair Trade', 'ISO 22000']
};

export const historyEvents: HistoryEvent[] = [
  {
    id: 'foundation-1995',
    year: 1995,
    title: 'Fondation de la Coopérative',
    description: 'Création de la coopérative agricole Herbio par un groupe de 12 agriculteurs passionnés dans la région de Meknès, avec pour vision de promouvoir l\'agriculture biologique au Maroc.',
    image: '/assets/hero-farm.jpg',
    category: 'foundation',
    achievements: [
      '12 membres fondateurs',
      'Première ferme biologique certifiée',
      'Engagement pour l\'agriculture durable'
    ]
  },
  {
    id: 'first-certification-1998',
    year: 1998,
    title: 'Première Certification Bio',
    description: 'Obtention de la première certification biologique officielle, marquant notre engagement vers une agriculture respectueuse de l\'environnement et de la santé des consommateurs.',
    image: '/assets/fresh-produce.jpg',
    category: 'certification',
    achievements: [
      'Certification Bio Maroc',
      '25 hectares certifiés',
      'Premiers produits bio commercialisés'
    ]
  },
  {
    id: 'expansion-2003',
    year: 2003,
    title: 'Expansion Régionale',
    description: 'Extension de nos activités vers les régions de Fès et Rabat, intégrant 45 nouveaux agriculteurs et diversifiant notre production avec les herbes aromatiques traditionnelles.',
    image: '/assets/spices.jpg',
    category: 'expansion',
    achievements: [
      '45 nouveaux membres',
      'Extension à 3 régions',
      'Diversification des cultures'
    ]
  },
  {
    id: 'international-certification-2008',
    year: 2008,
    title: 'Certification Internationale',
    description: 'Obtention des certifications Ecocert et Fair Trade, ouvrant nos produits aux marchés internationaux et renforçant notre engagement social et environnemental.',
    image: '/assets/jars-honey-arrangement.jpg',
    category: 'certification',
    achievements: [
      'Certification Ecocert',
      'Label Fair Trade',
      'Accès aux marchés européens'
    ]
  },
  {
    id: 'innovation-center-2012',
    year: 2012,
    title: 'Centre d\'Innovation',
    description: 'Création de notre centre de recherche et développement pour améliorer les techniques agricoles biologiques et développer de nouveaux produits respectueux de l\'environnement.',
    image: '/assets/fresh-produce.jpg',
    category: 'innovation',
    achievements: [
      'Centre R&D moderne',
      'Nouvelles techniques bio',
      'Partenariats universitaires'
    ]
  },
  {
    id: 'digital-transformation-2018',
    year: 2018,
    title: 'Transformation Digitale',
    description: 'Lancement de notre plateforme e-commerce et digitalisation de nos processus, permettant une meilleure traçabilité et un accès direct aux consommateurs.',
    image: '/assets/hero-farm.jpg',
    category: 'innovation',
    achievements: [
      'Plateforme e-commerce',
      'Traçabilité digitale',
      'Application mobile'
    ]
  },
  {
    id: 'community-impact-2020',
    year: 2020,
    title: 'Impact Communautaire',
    description: 'Lancement de programmes sociaux pour soutenir les communautés rurales : formation, microfinance et développement durable, touchant plus de 1000 familles.',
    image: '/assets/spices.jpg',
    category: 'community',
    achievements: [
      '1000+ familles aidées',
      'Programmes de formation',
      'Microfinance rurale'
    ]
  },
  {
    id: 'sustainability-2023',
    year: 2023,
    title: 'Excellence Durable',
    description: 'Reconnaissance internationale pour nos pratiques durables et obtention de la certification ISO 22000, consolidant notre position de leader de l\'agriculture biologique au Maroc.',
    image: '/assets/jars-honey-arrangement.jpg',
    category: 'certification',
    achievements: [
      'Certification ISO 22000',
      'Prix excellence durable',
      '450 membres actifs'
    ]
  }
];

export const cooperativeValues = [
  {
    id: 'sustainability',
    title: 'Durabilité',
    description: 'Engagement pour une agriculture respectueuse de l\'environnement',
    icon: '🌱'
  },
  {
    id: 'quality',
    title: 'Qualité',
    description: 'Produits biologiques de la plus haute qualité',
    icon: '⭐'
  },
  {
    id: 'community',
    title: 'Communauté',
    description: 'Soutien et développement des communautés rurales',
    icon: '🤝'
  },
  {
    id: 'innovation',
    title: 'Innovation',
    description: 'Adoption des meilleures pratiques et technologies',
    icon: '💡'
  },
  {
    id: 'tradition',
    title: 'Tradition',
    description: 'Préservation du savoir-faire agricole marocain',
    icon: '🏛️'
  },
  {
    id: 'transparency',
    title: 'Transparence',
    description: 'Traçabilité complète de nos produits',
    icon: '🔍'
  }
];