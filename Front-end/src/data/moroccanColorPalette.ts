/**
 * Palette de Couleurs Marocaine Complète
 * Inspirée par les paysages, l'artisanat et la culture du Maroc
 */

export interface ColorPalette {
  name: string;
  description: string;
  hex: string;
  rgb: string;
  inspiration: string;
}

export interface ColorCategory {
  category: string;
  description: string;
  colors: ColorPalette[];
}

export const moroccanColorPalette: ColorCategory[] = [
  {
    category: "Primary",
    description: "Couleurs principales représentant l'identité de la coopérative",
    colors: [
      {
        name: "Oasis Bleue",
        description: "Bleu profond des oasis du Sahara",
        hex: "#2563EB",
        rgb: "rgb(37, 99, 235)",
        inspiration: "Les eaux cristallines des oasis marocaines"
      },
      {
        name: "Terre Cuite",
        description: "Rouge terre des poteries traditionnelles",
        hex: "#DC2626",
        rgb: "rgb(220, 38, 38)",
        inspiration: "L'argile rouge de Salé et les poteries de Fès"
      },
      {
        name: "Vert Harmonie",
        description: "Vert olive des oliveraies du Moyen Atlas",
        hex: "#2D5016",
        rgb: "rgb(45, 80, 22)",
        inspiration: "Les oliveraies centenaires du Moyen Atlas"
      }
    ]
  },
  {
    category: "Dark",
    description: "Nuances sombres pour les contrastes et la profondeur",
    colors: [
      {
        name: "Oasis Nuit",
        description: "Bleu nuit des déserts étoilés",
        hex: "#1D4ED8",
        rgb: "rgb(29, 78, 216)",
        inspiration: "Le ciel nocturne du Sahara"
      },
      {
        name: "Terre Brûlée",
        description: "Rouge sombre des terres cuites au soleil",
        hex: "#B91C1C",
        rgb: "rgb(185, 28, 28)",
        inspiration: "Les murs d'argile séchés au soleil"
      },
      {
        name: "Vert Profond",
        description: "Vert foncé des cèdres de l'Atlas",
        hex: "#1A3009",
        rgb: "rgb(26, 48, 9)",
        inspiration: "Les forêts de cèdres du Haut Atlas"
      },
      {
        name: "Indigo Berbère",
        description: "Bleu indigo des tissus traditionnels",
        hex: "#1E1B4B",
        rgb: "rgb(30, 27, 75)",
        inspiration: "Les voiles indigo des Touaregs"
      }
    ]
  },
  {
    category: "Secondary",
    description: "Couleurs complémentaires pour l'harmonie visuelle",
    colors: [
      {
        name: "Ciel Atlas",
        description: "Bleu clair des sommets enneigés",
        hex: "#0EA5E9",
        rgb: "rgb(14, 165, 233)",
        inspiration: "Le ciel pur au-dessus de l'Atlas"
      },
      {
        name: "Sable Doré",
        description: "Beige doré des dunes du Sahara",
        hex: "#CD853F",
        rgb: "rgb(205, 133, 63)",
        inspiration: "Les dunes dorées de Merzouga"
      },
      {
        name: "Vert Sauge",
        description: "Vert tendre des jardins de Majorelle",
        hex: "#8FBC8F",
        rgb: "rgb(143, 188, 143)",
        inspiration: "Les jardins botaniques de Marrakech"
      },
      {
        name: "Rose Poudré",
        description: "Rose délicat des murs de Marrakech",
        hex: "#F4A6A6",
        rgb: "rgb(244, 166, 166)",
        inspiration: "Les murs roses de la médina de Marrakech"
      }
    ]
  },
  {
    category: "Accent",
    description: "Couleurs d'accent pour les détails et les highlights",
    colors: [
      {
        name: "Or Marocain",
        description: "Or brillant des bijoux traditionnels",
        hex: "#DAA520",
        rgb: "rgb(218, 165, 32)",
        inspiration: "Les bijoux en or des artisans de Fès"
      },
      {
        name: "Ambre Solaire",
        description: "Orange chaud du soleil couchant",
        hex: "#F59E0B",
        rgb: "rgb(245, 158, 11)",
        inspiration: "Les couchers de soleil sur le désert"
      },
      {
        name: "Turquoise Atlantique",
        description: "Turquoise des côtes atlantiques",
        hex: "#06B6D4",
        rgb: "rgb(6, 182, 212)",
        inspiration: "Les eaux turquoise d'Essaouira"
      },
      {
        name: "Corail Berbère",
        description: "Rouge corail des tapis berbères",
        hex: "#FF6347",
        rgb: "rgb(255, 99, 71)",
        inspiration: "Les motifs colorés des tapis du Moyen Atlas"
      },
      {
        name: "Menthe Fraîche",
        description: "Vert menthe du thé traditionnel",
        hex: "#D1FAE5",
        rgb: "rgb(209, 250, 229)",
        inspiration: "La menthe fraîche du thé à la menthe"
      },
      {
        name: "Safran Précieux",
        description: "Jaune safran des épices de Taliouine",
        hex: "#FCD34D",
        rgb: "rgb(252, 211, 77)",
        inspiration: "Le safran doré de Taliouine"
      }
    ]
  }
];

// Palette organisée par thèmes pour l'utilisation dans les composants
export const themeColors = {
  primary: {
    oasisBleue: "#2563EB",
    terreCuite: "#DC2626",
    vertHarmonie: "#2D5016"
  },
  dark: {
    oasisNuit: "#1D4ED8",
    terreBrulee: "#B91C1C",
    vertProfond: "#1A3009",
    indigoBerbere: "#1E1B4B"
  },
  secondary: {
    cielAtlas: "#0EA5E9",
    sableDore: "#CD853F",
    vertSauge: "#8FBC8F",
    rosePoudre: "#F4A6A6"
  },
  accent: {
    orMarocain: "#DAA520",
    ambreSolaire: "#F59E0B",
    turquoiseAtlantique: "#06B6D4",
    corailBerbere: "#FF6347",
    mentheFraiche: "#D1FAE5",
    safranPrecieux: "#FCD34D"
  }
};

// Combinaisons de couleurs harmonieuses pour différents contextes
export const colorCombinations = {
  desert: {
    name: "Désert Marocain",
    primary: themeColors.primary.terreCuite,
    secondary: themeColors.secondary.sableDore,
    accent: themeColors.accent.ambreSolaire,
    background: "#FDF5E6"
  },
  oasis: {
    name: "Oasis Bleue",
    primary: themeColors.primary.oasisBleue,
    secondary: themeColors.secondary.cielAtlas,
    accent: themeColors.accent.turquoiseAtlantique,
    background: "#F0F9FF"
  },
  jardin: {
    name: "Jardin Harmonieux",
    primary: themeColors.primary.vertHarmonie,
    secondary: themeColors.secondary.vertSauge,
    accent: themeColors.accent.mentheFraiche,
    background: "#F8FDF8"
  },
  artisan: {
    name: "Artisanat Traditionnel",
    primary: themeColors.primary.terreCuite,
    secondary: themeColors.accent.orMarocain,
    accent: themeColors.accent.corailBerbere,
    background: "#FFFBF0"
  }
};

// Mapping des noms de palettes aux noms de couleurs marocains
export const paletteColorNames = {
  "Vert Harmonie": {
    primary: "Vert Harmonie",
    primaryDark: "Vert Profond", 
    secondary: "Ambre Solaire",
    accent: "Menthe Fraîche"
  },
  "Oasis Bleue": {
    primary: "Azur Oasis",
    primaryDark: "Nuit Oasis",
    secondary: "Ciel Atlas", 
    accent: "Bleu Clair"
  },
  "Terre Cuite": {
    primary: "Terre Cuite",
    primaryDark: "Terre Brûlée",
    secondary: "Ambre Solaire",
    accent: "Rose Pâle"
  }
};

export default moroccanColorPalette;