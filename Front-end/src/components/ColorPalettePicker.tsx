import React, { useState } from 'react';
import { Palette, Plus, RotateCcw, Edit3, Check, X, Pipette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useColorPalette, ColorPalette } from '@/contexts/ColorPaletteContext';
import { paletteColorNames } from '@/data/moroccanColorPalette';

// Function to get Moroccan color names based on palette name and color type
const getMoroccanColorName = (paletteName: string, colorType: 'primary' | 'primaryDark' | 'secondary' | 'accent'): string => {
  const paletteMapping = paletteColorNames[paletteName as keyof typeof paletteColorNames];
  
  if (paletteMapping) {
    return paletteMapping[colorType];
  }
  
  // Fallback to French labels for custom palettes
  switch (colorType) {
    case 'primary':
      return 'Principale';
    case 'primaryDark':
      return 'Sombre';
    case 'secondary':
      return 'Secondaire';
    case 'accent':
      return 'Accent';
    default:
      return colorType;
  }
};

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleColorChange = (newColor: string) => {
    setTempValue(newColor);
    onChange(newColor);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start gap-2 h-10"
          >
            <div 
              className="w-4 h-4 rounded border border-border" 
              style={{ backgroundColor: value }}
            />
            <span className="font-mono text-sm">{value.toUpperCase()}</span>
            <Pipette className="w-4 h-4 ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Hex Color</Label>
              <Input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => {
                  if (/^#[0-9A-F]{6}$/i.test(tempValue)) {
                    onChange(tempValue);
                  } else {
                    setTempValue(value);
                  }
                }}
                className="font-mono text-sm mt-1"
                placeholder="#000000"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Color Picker</Label>
              <input
                type="color"
                value={value}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 rounded border border-border cursor-pointer mt-1"
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {/* Predefined color suggestions */}
              {[
                '#2D5016', '#1A3009', '#8FBC8F', '#F4A6A6', // Vert Harmonie set
                '#10B981', '#059669', '#047857', // Greens
                '#2563EB', '#1D4ED8', '#1E40AF', // Blues
                '#DC2626', '#B91C1C', '#991B1B', // Reds
                '#F59E0B', '#D97706', '#B45309', // Oranges
                '#8B5CF6', '#7C3AED', '#6D28D9', // Purples
                '#EC4899', '#DB2777', '#BE185D', // Pinks
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface PalettePreviewProps {
  palette: ColorPalette;
  isActive?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  showEditButton?: boolean;
}

const PalettePreview: React.FC<PalettePreviewProps> = ({ 
  palette, 
  isActive, 
  onSelect, 
  onEdit, 
  showEditButton 
}) => {
  return (
    <div 
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-border hover:border-muted-foreground hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground">{palette.name}</h4>
        {showEditButton && palette.isCustom && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="h-6 w-6 p-0"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-2">
        <div className="space-y-1">
          <div 
            className="w-full h-6 rounded" 
            style={{ backgroundColor: palette.primary }}
          />
          <span className="text-xs text-muted-foreground">{getMoroccanColorName(palette.name, 'primary')}</span>
        </div>
        <div className="space-y-1">
          <div 
            className="w-full h-6 rounded" 
            style={{ backgroundColor: palette.primaryDark }}
          />
          <span className="text-xs text-muted-foreground">{getMoroccanColorName(palette.name, 'primaryDark')}</span>
        </div>
        <div className="space-y-1">
          <div 
            className="w-full h-6 rounded" 
            style={{ backgroundColor: palette.secondary }}
          />
          <span className="text-xs text-muted-foreground">{getMoroccanColorName(palette.name, 'secondary')}</span>
        </div>
        <div className="space-y-1">
          <div 
            className="w-full h-6 rounded" 
            style={{ backgroundColor: palette.accent }}
          />
          <span className="text-xs text-muted-foreground">{getMoroccanColorName(palette.name, 'accent')}</span>
        </div>
      </div>
      
      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export const ColorPalettePicker: React.FC = () => {
  const { 
    currentPalette, 
    availablePalettes, 
    setCurrentPalette, 
    updateCustomPalette, 
    createCustomPalette, 
    resetToDefaults 
  } = useColorPalette();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPalette, setEditingPalette] = useState<ColorPalette | null>(null);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [tempColors, setTempColors] = useState({
    primary: '#2D5016',
    primaryDark: '#1A3009',
    secondary: '#8FBC8F',
    accent: '#F4A6A6',
  });

  const handleCreateCustomPalette = () => {
    if (newPaletteName.trim()) {
      const newPalette = createCustomPalette(newPaletteName.trim(), tempColors);
      setCurrentPalette(newPalette);
      setNewPaletteName('');
      setIsDialogOpen(false);
    }
  };

  const handleEditPalette = (palette: ColorPalette) => {
    setEditingPalette(palette);
    setTempColors({
      primary: palette.primary,
      primaryDark: palette.primaryDark,
      secondary: palette.secondary,
      accent: palette.accent,
    });
  };

  const handleSaveEdit = () => {
    if (editingPalette) {
      updateCustomPalette(editingPalette.id, tempColors);
      setEditingPalette(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPalette(null);
    setTempColors({
      primary: '#10B981',
      primaryDark: '#059669',
      secondary: '#F59E0B',
      accent: '#D1FAE5',
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Personnaliser les couleurs
          </DialogTitle>
          <DialogDescription>
            Choisissez une palette existante ou créez votre propre combinaison de couleurs.
            Les changements sont appliqués en temps réel sur tout le site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Palette Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-foreground mb-3">Palette actuelle</h3>
            <PalettePreview palette={currentPalette} isActive={true} />
          </div>

          {/* Available Palettes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Palettes disponibles</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="text-destructive hover:text-destructive"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePalettes.map((palette) => (
                <PalettePreview
                  key={palette.id}
                  palette={palette}
                  isActive={currentPalette.id === palette.id}
                  onSelect={() => setCurrentPalette(palette)}
                  onEdit={() => handleEditPalette(palette)}
                  showEditButton={true}
                />
              ))}
            </div>
          </div>

          {/* Edit Palette Form */}
          {editingPalette && (
            <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">
                  Modifier "{editingPalette.name}"
                </h3>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Check className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ColorInput
                  label="🎨 Couleur Principale"
                  value={tempColors.primary}
                  onChange={(value) => setTempColors(prev => ({ ...prev, primary: value }))}
                />
                <ColorInput
                  label="🌙 Nuance Sombre"
                  value={tempColors.primaryDark}
                  onChange={(value) => setTempColors(prev => ({ ...prev, primaryDark: value }))}
                />
                <ColorInput
                  label="🏺 Couleur Secondaire"
                  value={tempColors.secondary}
                  onChange={(value) => setTempColors(prev => ({ ...prev, secondary: value }))}
                />
                <ColorInput
                  label="✨ Couleur d'Accent"
                  value={tempColors.accent}
                  onChange={(value) => setTempColors(prev => ({ ...prev, accent: value }))}
                />
              </div>
            </div>
          )}

          {/* Create New Palette */}
          <div className="p-4 border border-dashed border-border rounded-lg">
            <h3 className="font-medium text-foreground mb-4">Créer une nouvelle palette</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="palette-name">Nom de la palette</Label>
                <Input
                  id="palette-name"
                  value={newPaletteName}
                  onChange={(e) => setNewPaletteName(e.target.value)}
                  placeholder="Ma palette personnalisée"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ColorInput
                  label="🎨 Couleur Principale"
                  value={tempColors.primary}
                  onChange={(value) => setTempColors(prev => ({ ...prev, primary: value }))}
                />
                <ColorInput
                  label="🌙 Nuance Sombre"
                  value={tempColors.primaryDark}
                  onChange={(value) => setTempColors(prev => ({ ...prev, primaryDark: value }))}
                />
                <ColorInput
                  label="🏺 Couleur Secondaire"
                  value={tempColors.secondary}
                  onChange={(value) => setTempColors(prev => ({ ...prev, secondary: value }))}
                />
                <ColorInput
                  label="✨ Couleur d'Accent"
                  value={tempColors.accent}
                  onChange={(value) => setTempColors(prev => ({ ...prev, accent: value }))}
                />
              </div>
              
              <Button 
                onClick={handleCreateCustomPalette}
                disabled={!newPaletteName.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer et appliquer la palette
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};