export interface CatalogueItem {
  id: string;
  title: string;
  description: string;
  category: string;
  pdfUrl: string;
  thumbnailUrl: string;
  fileSize: string;
  pages: number;
  language: string;
  publishDate: string;
}

export const catalogues: CatalogueItem[] = [
  {
    id: 'catalogue-herbio-2024',
    title: 'Catalogue Herbio 2024',
    description: 'Découvrez notre sélection complète de produits biologiques cultivés dans nos fermes marocaines. Ce catalogue présente tous nos produits avec leurs caractéristiques nutritionnelles.',
    category: 'Catalogue',
    pdfUrl: '/pdfs/catalogue-legumes.pdf', // Fichier PDF local
    thumbnailUrl: '/placeholder.svg',
    fileSize: '13 KB',
    pages: 1,
    language: 'Français',
    publishDate: '2024-01-15'
  }
];

export const categories = [
  'Tous',
  'Catalogue'
];