import React, { createContext, useContext, useState, useEffect } from 'react';

// Default color palette based on the existing themes
export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  isCustom?: boolean;
}

export interface ColorPaletteContextType {
  currentPalette: ColorPalette;
  availablePalettes: ColorPalette[];
  setCurrentPalette: (palette: ColorPalette) => void;
  updateCustomPalette: (paletteId: string, colors: Partial<Omit<ColorPalette, 'id' | 'name' | 'isCustom'>>) => void;
  createCustomPalette: (name: string, colors: Omit<ColorPalette, 'id' | 'name' | 'isCustom'>) => ColorPalette;
  resetToDefaults: () => void;
}

// Default palettes based on existing themes
const defaultPalettes: ColorPalette[] = [
  {
    id: 'green-harmony',
    name: 'Vert Harmonie',
    primary: '#10B981',
    primaryDark: '#059669',
    secondary: '#F59E0B',
    accent: '#D1FAE5',
  },
  {
    id: 'oasis-blue',
    name: 'Oasis Bleue',
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    secondary: '#0EA5E9',
    accent: '#DBEAFE',
  },
  {
    id: 'terre-cuite',
    name: 'Terre Cuite',
    primary: '#DC2626',
    primaryDark: '#B91C1C',
    secondary: '#F59E0B',
    accent: '#FEE2E2',
  },
];

const ColorPaletteContext = createContext<ColorPaletteContextType | undefined>(undefined);

// Helper function to convert hex to HSL
const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Apply colors to CSS variables
const applyColorsToCSS = (palette: ColorPalette) => {
  const root = document.documentElement;
  
  root.style.setProperty('--primary', hexToHsl(palette.primary));
  root.style.setProperty('--primary-dark', hexToHsl(palette.primaryDark));
  root.style.setProperty('--secondary', hexToHsl(palette.secondary));
  root.style.setProperty('--accent', hexToHsl(palette.accent));
  root.style.setProperty('--ring', hexToHsl(palette.primary));
  
  // Update gradients
  root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${palette.primary}95, ${palette.primaryDark}95)`);
  root.style.setProperty('--shadow-glow', `0 0 20px ${palette.primary}4D`);
};

export const ColorPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPalette, setCurrentPaletteState] = useState<ColorPalette>(defaultPalettes[0]);
  const [availablePalettes, setAvailablePalettes] = useState<ColorPalette[]>(defaultPalettes);

  // Load saved palette from localStorage on mount
  useEffect(() => {
    const savedPalette = localStorage.getItem('herbio-color-palette');
    const savedCustomPalettes = localStorage.getItem('herbio-custom-palettes');
    
    if (savedCustomPalettes) {
      try {
        const customPalettes = JSON.parse(savedCustomPalettes);
        setAvailablePalettes([...defaultPalettes, ...customPalettes]);
      } catch (error) {
        console.error('Error loading custom palettes:', error);
      }
    }
    
    if (savedPalette) {
      try {
        const palette = JSON.parse(savedPalette);
        setCurrentPaletteState(palette);
        applyColorsToCSS(palette);
      } catch (error) {
        console.error('Error loading saved palette:', error);
        applyColorsToCSS(defaultPalettes[0]);
      }
    } else {
      applyColorsToCSS(defaultPalettes[0]);
    }
  }, []);

  const setCurrentPalette = (palette: ColorPalette) => {
    setCurrentPaletteState(palette);
    applyColorsToCSS(palette);
    localStorage.setItem('herbio-color-palette', JSON.stringify(palette));
  };

  const updateCustomPalette = (paletteId: string, colors: Partial<Omit<ColorPalette, 'id' | 'name' | 'isCustom'>>) => {
    const updatedPalettes = availablePalettes.map(palette => {
      if (palette.id === paletteId) {
        const updatedPalette = { ...palette, ...colors };
        if (currentPalette.id === paletteId) {
          setCurrentPalette(updatedPalette);
        }
        return updatedPalette;
      }
      return palette;
    });
    
    setAvailablePalettes(updatedPalettes);
    
    // Save custom palettes to localStorage
    const customPalettes = updatedPalettes.filter(p => p.isCustom);
    localStorage.setItem('herbio-custom-palettes', JSON.stringify(customPalettes));
  };

  const createCustomPalette = (name: string, colors: Omit<ColorPalette, 'id' | 'name' | 'isCustom'>) => {
    const newPalette: ColorPalette = {
      id: `custom-${Date.now()}`,
      name,
      isCustom: true,
      ...colors,
    };
    
    const updatedPalettes = [...availablePalettes, newPalette];
    setAvailablePalettes(updatedPalettes);
    
    // Save custom palettes to localStorage
    const customPalettes = updatedPalettes.filter(p => p.isCustom);
    localStorage.setItem('herbio-custom-palettes', JSON.stringify(customPalettes));
    
    return newPalette;
  };

  const resetToDefaults = () => {
    setAvailablePalettes(defaultPalettes);
    setCurrentPalette(defaultPalettes[0]);
    localStorage.removeItem('herbio-custom-palettes');
    localStorage.removeItem('herbio-color-palette');
  };

  return (
    <ColorPaletteContext.Provider value={{
      currentPalette,
      availablePalettes,
      setCurrentPalette,
      updateCustomPalette,
      createCustomPalette,
      resetToDefaults,
    }}>
      {children}
    </ColorPaletteContext.Provider>
  );
};

export const useColorPalette = () => {
  const context = useContext(ColorPaletteContext);
  if (context === undefined) {
    throw new Error('useColorPalette must be used within a ColorPaletteProvider');
  }
  return context;
};