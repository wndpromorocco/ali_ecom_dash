import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HERMADO_COLORS: Record<string, string> = {
  "CAMEL": "#C19A6B",
  "NOIR": "#000000",
  "BRUN": "#5C4033",
  "BEIGE": "#F5F5DC",
  "MARINE": "#000080",
  "GRIS ANTHRACITE": "#36454F",
  "BLANC": "#FFFFFF"
};

export const getValidCssColor = (colorVal: string) => {
  if (!colorVal) return "#FFFFFF";
  const upperVal = colorVal.toUpperCase().trim();
  return HERMADO_COLORS[upperVal] || colorVal;
};

export const HEX_TO_COLOR_NAME: Record<string, string> = {
  "#000000": "Noir",
  "#ffffff": "Blanc",
  "#c19a6b": "Camel",
  "#5c4033": "Brun",
  "#f5f5dc": "Beige",
  "#000080": "Marine",
  "#36454f": "Gris Anthracite",
  "#2b0d49": "Bleu Nuit",
  "#854a4a": "Bordeaux",
  "#8b4513": "Marron",
  "#5c2e00": "Marron Foncé",
  "#db6513": "Orange"
};

export const getColorName = (hexValue?: string) => {
  if (!hexValue) return "N/A";
  if (!hexValue.startsWith('#')) return hexValue;

  const lowerHex = hexValue.toLowerCase().trim();

  for (const [name, hex] of Object.entries(HERMADO_COLORS)) {
    if (hex.toLowerCase() === lowerHex) return name.charAt(0) + name.slice(1).toLowerCase();
  }

  return HEX_TO_COLOR_NAME[lowerHex] || hexValue;
};

export const getWhatsAppLink = (message: string, phoneNumber: string = '212649595793') => {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};
