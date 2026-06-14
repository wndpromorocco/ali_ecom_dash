import React from 'react';
import { Heart, Plus } from 'lucide-react';
// Removed Button import; using native <button> for custom classes
import { useCurrency } from '@/contexts/CurrencyContext';

type Item = {
  id: number | string;
  image: string;
  name: string;
  description?: string;
  price: number;
};

interface ProductCarouselProps {
  items: Item[];
  onAdd: (item: Item) => void;
  itemsPerSlide?: number;
  autoPlay?: boolean;
  autoIntervalMs?: number; // default 3000ms
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ items, onAdd, itemsPerSlide = 4, autoPlay = false, autoIntervalMs = 3000 }) => {
  const [page, setPage] = React.useState(0);
  const pages = Math.max(1, Math.ceil(items.length / itemsPerSlide));
  const { formatPrice } = useCurrency();

  // Autoplay: advance the page every autoIntervalMs when enabled and multiple pages exist
  React.useEffect(() => {
    if (!autoPlay || pages <= 1) return;
    const id = setInterval(() => {
      setPage((p) => (p + 1) % pages);
    }, autoIntervalMs);
    return () => clearInterval(id);
  }, [autoPlay, autoIntervalMs, pages]);


  const prev = () => setPage((p) => (p - 1 + pages) % pages);
  const next = () => setPage((p) => (p + 1) % pages);

  const start = page * itemsPerSlide;
  const visible = items.slice(start, start + itemsPerSlide);
  const colsClass = itemsPerSlide >= 6 ? 'lg:grid-cols-6' : itemsPerSlide === 5 ? 'lg:grid-cols-5' : itemsPerSlide === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';
  const vwLarge = Math.round(100 / Math.min(itemsPerSlide, 6));

  return (
    <div id="tns2-iw" className="relative w-full">
      {/* Controls */}
      {/* Grid of items */}
      <div className="px-6 md:px-10">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-6`}>
          {visible.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col h-full border border-gray-50">
              {/* Top heart icon centered */}
              <div className="flex justify-center pt-3">
                <button className="p-1.5 rounded-full bg-white text-gray-300 hover:text-red-500 shadow-sm transition-colors border border-gray-50">
                  <Heart className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="relative overflow-hidden p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full aspect-[4/5] object-contain bg-white group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                  sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${vwLarge}vw`}
                  srcSet={`${item.image} 1x, ${item.image} 2x`}
                />
              </div>
              <div className="px-5 pt-2 flex-grow flex flex-col items-center text-center">
                <h3 className="text-[13px] font-black uppercase tracking-tight text-[#5C2E00] leading-tight px-2 min-h-[32px] flex items-center justify-center underline decoration-transparent group-hover:decoration-[#db6513] transition-all underline-offset-4">{item.name}</h3>
                {item.description && (
                  <p className="mt-2 text-[10px] text-gray-400 italic px-4 line-clamp-2 leading-relaxed">{item.description}</p>
                )}
                <div className="flex-grow" />
                <div className="text-[16px] font-black text-[#db6513] mt-4 tracking-tighter tabular-nums">{formatPrice(item.price)}</div>
              </div>
              <div className="px-5 pb-6 mt-4">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => onAdd(item)}
                    className="w-full py-4 bg-[#111827] text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#db6513] hover:text-white transition-all flex items-center justify-center shadow-md active:scale-95 group/btn"
                    data-button-action="add-to-cart"
                    aria-label={`Ajouter ${item.name} au panier`}
                    type="button"
                  >
                    <Plus className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-90" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProductCarousel;
