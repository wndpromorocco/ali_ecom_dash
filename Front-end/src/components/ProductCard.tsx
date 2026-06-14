import { useState } from 'react';
import { ShoppingCart, ShoppingBag, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart, Product } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { API_BASE, DOMAIN_BASE } from '@/config';
import OrderModal from '@/components/OrderModal';
import { getValidCssColor } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const goToDetails = (e: React.MouseEvent) => {
    // Avoid navigating if clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/boutique/${product.id}`, { state: { product } });
  };

  return (
    <>
      <Card
        className="group rounded-sm overflow-hidden cursor-pointer border border-gray-100 hover:shadow-md transition-all p-0 h-full flex flex-col"
        onClick={goToDetails}
        role="button"
        aria-label={`Voir les détails de ${product.name}`}
      >
        <CardContent className="p-0">
          <div className="relative w-full aspect-square overflow-hidden bg-[#F4F4F5] border-b border-gray-100 flex items-center justify-center group rounded-t-lg">
            <img
              src={product.images && product.images.length > 0 && product.images[0].startsWith('/uploads')
                ? `${DOMAIN_BASE}${product.images[0]}`
                : (product.images && product.images.length > 0 ? product.images[0] : (product.image && product.image.startsWith('/uploads') ? `${DOMAIN_BASE}${product.image}` : (product.image || '/placeholder.png')))}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-darken scale-125 transition-transform duration-500 group-hover:scale-[1.40]"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.png';
              }}
            />
            <div className="absolute top-3 left-3 z-20">
              <span className="bg-[#db6513] text-[#5C2E00] px-3 py-1 rounded-none text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-wider uppercase shadow-lg">
                LIVRAISON GRATUITE
              </span>
            </div>
          </div>
        </CardContent>
        <div className="px-3 md:px-4 pt-3 pb-3 flex-grow flex flex-col">
          {product.type && (
            <div className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#5C2E00]/60 mb-1">
              {product.type}
            </div>
          )}
          <h3 className="text-[11px] sm:text-[12px] md:text-[14px] font-bold uppercase text-gray-800 leading-snug line-clamp-2 min-h-[28px] sm:min-h-[36px] mb-1.5">
            {product.name}
          </h3>

          {/* Color Swatches */}
          {(product.colors && product.colors.length > 0) || product.color ? (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {product.colors && product.colors.length > 0 ? (
                product.colors.slice(0, 5).map((c, i) => (
                  <div
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm shrink-0"
                    style={{ backgroundColor: getValidCssColor(c) }}
                    title={c}
                  />
                ))
              ) : (
                <div
                  className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm shrink-0"
                  style={{ backgroundColor: getValidCssColor(product.color || '') }}
                  title={product.color}
                />
              )}
              {product.colors && product.colors.length > 5 && (
                <span className="text-[8px] font-black text-gray-400 mt-0.5">+{product.colors.length - 5}</span>
              )}
            </div>
          ) : null}
          {product.size && (
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase mt-1 mb-2 block">
              Taille: {product.size}
            </span>
          )}

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 sm:gap-3 mb-3">
              <span className="text-[14px] sm:text-[16px] md:text-[18px] font-black text-[#5C2E00]">
                {formatPrice(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && product.price > product.discountPrice && (
                <span className="text-[10px] sm:text-[12px] text-gray-400 line-through font-medium">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 w-full flex-nowrap">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOrderModalOpen(true);
                }}
                className="flex-grow flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 h-10 sm:h-12 md:h-14 rounded-md sm:rounded-lg bg-[#5C2E00] hover:bg-[#db6513] text-white transition-all active:scale-95 shadow-md border-none text-[9px] sm:text-[11px] md:text-[12px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap min-w-0"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="truncate">COMMANDER</span>
              </Button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const isShoes = !product.category || (product.category.toLowerCase() !== 'sac' && product.category.toLowerCase() !== 'accessoires' && product.category.toLowerCase() !== 'lunettes');
                  if (isShoes && product.size && (product.size.includes('-') || product.size.includes(','))) {
                    toast.error('Veuillez sélectionner une taille sur la page produit');
                    navigate(`/boutique/${product.id}`, { state: { product } });
                    return;
                  }

                  let defaultSize;
                  if (!product.size?.includes('-') && !product.size?.includes(',')) defaultSize = product.size;

                  let defaultColor;
                  if (product.colors && product.colors.length === 1) defaultColor = product.colors[0];
                  else if (product.color) defaultColor = product.color;

                  addToCart(product, defaultSize, defaultColor);
                }}
                className="flex-none shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center bg-[#db6513] text-white rounded-md sm:rounded-lg hover:bg-[#c45a11] transition-all active:scale-95 shadow-md"
                title="Ajouter au Panier"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </Card >

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        items={[product]}
        totalPrice={product.discountPrice || product.price}
      />
    </>
  );
};

export default ProductCard;
