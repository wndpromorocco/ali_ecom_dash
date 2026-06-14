import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { useCatalog } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, ChevronRight } from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  // Use centralized catalog hook
  const { products: apiProducts, isLoading } = useCatalog();

  // Focus body shortcut: Ctrl+K opens, Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpenChange]);

  const categories = useMemo(() => {
    return Array.from(new Set(apiProducts.map((p) => p.category)));
  }, [apiProducts]);

  const handleSelectProduct = (id: string) => {
    onOpenChange(false);
    navigate(`/boutique/${id}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} className="sm:max-w-4xl w-full h-full sm:h-auto max-w-full rounded-none sm:rounded-xl">
      <div className="p-4 sm:p-6 pb-2">
        <div className="relative flex items-center w-full border-b border-gray-200 focus-within:border-[#5C2E00] transition-colors duration-300 py-2 group">
          <CommandInput
            placeholder="Rechercher l'excellence Fadel trading..."
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:ring-0 text-[16px] sm:text-lg placeholder:text-gray-300 font-medium h-12"
          />
        </div>
      </div>
      <CommandList className="max-h-[500px] p-2">
        <CommandEmpty className="py-20 text-center">
          <div className="text-[12px] font-black uppercase tracking-widest text-gray-300 italic">Aucun chef-d'œuvre trouvé.</div>
        </CommandEmpty>

        <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5C2E00] px-2 mb-2 block">COLLECTIONS & PRODUITS</span>}>
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#db6513] mx-auto"></div>
            </div>
          ) : (
            apiProducts.map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => handleSelectProduct(p.id)}
                className="rounded-none border-b border-gray-100 last:border-0 mb-0 px-4 py-4 aria-selected:bg-gray-50/50 transition-all group flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  {/* Elegantly Proportioned Image */}
                  <div className="w-16 h-20 flex-shrink-0 bg-[#F4F4F5] border border-gray-100/50 rounded-md overflow-hidden flex items-center justify-center">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-[85%] w-auto object-contain mix-blend-darken group-hover:scale-110 transition-transform duration-500 p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#5C2E00]/5 text-[8px] font-black text-[#db6513] uppercase tracking-widest rounded leading-none">
                        {p.category}
                      </span>
                      {p.type && (
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest leading-none">• {p.type}</span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-black uppercase tracking-tight text-[#5C2E00] leading-tight mb-1 group-hover:text-[#db6513] transition-colors truncate">
                      {p.name}
                    </h3>
                    <div className="text-[16px] font-black text-[#5C2E00] tracking-tighter">
                      {formatPrice(p.price)}
                    </div>
                  </div>
                </div>

                {/* Interaction Indicator */}
                <div className="flex-shrink-0 text-gray-200 group-hover:text-[#db6513] transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </CommandItem>
            ))
          )}
        </CommandGroup>

        <CommandGroup heading={<span className="text-[11px] font-black uppercase tracking-widest text-[#5C2E00] px-2 mt-4 mb-2 block">Catégories Prisées</span>}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
            {categories.slice(0, 6).map((c) => (
              <CommandItem
                key={c}
                onSelect={() => { onOpenChange(false); navigate('/boutique'); }}
                className="flex items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-[#db6513]/30 hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest text-[#5C2E00] transition-all"
              >
                {c}
              </CommandItem>
            ))}
          </div>
        </CommandGroup>
      </CommandList>
    </CommandDialog >
  );
};

export default SearchDialog;
