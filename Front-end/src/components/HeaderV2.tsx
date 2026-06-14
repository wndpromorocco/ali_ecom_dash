import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ColorPalettePicker } from './ColorPalettePicker';
import { useState } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import HerbioLogo from '@/assets/logo_herbio.png';
import CartPreview from './CartPreview';

const HeaderV2 = () => {
  const { totalItems } = useCart();
  const { categories } = useCatalog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const navigate = useNavigate();

  const cibles = categories.filter(c => !c.parentId && c.isActive);

  return (
    <header className="relative z-50 mx-2 mt-2">
      <div className="bg-white border border-border rounded-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="group-hover:scale-105 transition-transform duration-300">
                <img
                  src={HerbioLogo}
                  alt="Herbio - Saveur de l'Atlas"
                  className="h-8 sm:h-10 md:h-12 w-auto"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                  srcSet={`${HerbioLogo} 1x, ${HerbioLogo} 2x`}
                />
              </div>
              <span className="hidden sm:block text-sm text-muted-foreground">Saveur de l'Atlas</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              <Link
                to="/"
                className="text-[#1F2937] hover:text-primary font-medium transition-colors touch-target"
              >
                Accueil
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-[#1F2937] hover:text-primary font-medium transition-colors touch-target flex items-center gap-1">
                    Boutique
                    <Menu className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/boutique')}>
                    Voir Tout
                  </DropdownMenuItem>
                  {cibles.map(cible => (
                    <DropdownMenuItem
                      key={cible.id}
                      onClick={() => navigate(`/boutique?cible=${encodeURIComponent(cible.name)}`)}
                      className="uppercase text-[10px] font-bold"
                    >
                      {cible.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                to="/catalogue"
                className="text-[#1F2937] hover:text-primary font-medium transition-colors touch-target"
              >
                Catalogue
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">

              {/* HomeV2 Navigation & Color Palette Picker */}
              <div className="flex items-center gap-2">
                {/* HomeV2 Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-sm touch-target">
                      HomeV2
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate('/homev2')}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary-dark" />
                        <span>Accéder à HomeV2</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Color Palette Picker */}
                <ColorPalettePicker />
              </div>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-[#1F2937] hover:text-primary touch-target"
                onClick={() => setCartPreviewOpen(true)}
                aria-label="Ouvrir le panier"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Votre panier ({totalItems} {totalItems > 1 ? 'articles' : 'article'})</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden touch-target"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-controls="mobile-nav-v2"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav id="mobile-nav-v2" className="md:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="text-foreground/80 hover:text-primary font-medium transition-colors py-2 touch-target"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
                <Link
                  to="/boutique"
                  className="text-foreground/80 hover:text-primary font-medium transition-colors py-2 touch-target"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Boutique
                </Link>
                <Link
                  to="/catalogue"
                  className="text-foreground/80 hover:text-primary font-medium transition-colors py-2 touch-target"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Catalogue
                </Link>
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* Cart Preview */}
      <CartPreview
        isOpen={cartPreviewOpen}
        onClose={() => setCartPreviewOpen(false)}
      />
    </header>
  );
};

export default HeaderV2;
