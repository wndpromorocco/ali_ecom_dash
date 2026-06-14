import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCatalog } from "@/hooks/useCatalog";
import { useSettings } from "@/hooks/useSettings";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, MessageSquare, Facebook, Twitter, Instagram, Linkedin, ChevronRight, Search, Loader2, X } from "lucide-react";
import OrderModal from '@/components/OrderModal';
import { API_BASE, DOMAIN_BASE } from "@/config";
import { getValidCssColor, getColorName } from "@/lib/utils";
/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function StarRating({ value, size = "sm", interactive = false, onChange }: { value: number, size?: "sm" | "md" | "lg", interactive?: boolean, onChange?: (val: number) => void }) {
  const [hov, setHov] = useState(0);
  const s = size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-5 h-5" : "w-6 h-6";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = interactive ? (hov || value) >= star : value >= star;
        const half = !interactive && value >= star - 0.5 && value < star;
        return (
          <svg
            key={star}
            className={`${s} transition-colors ${interactive ? "cursor-pointer" : ""} ${filled ? "text-[#db6513]" : half ? "text-[#db6513]/50" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onMouseEnter={() => interactive && setHov(star)}
            onMouseLeave={() => interactive && setHov(0)}
            onClick={() => interactive && onChange && onChange(star)}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BREADCRUMB
───────────────────────────────────────────── */
function Breadcrumb({ product }: { product: any }) {
  return (
    <div className="bg-[#f4f4f4] border-b border-[#5C2E00]/5">
      <div className="max-w-7xl mx-auto px-5 py-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <Link to="/" className="text-[#5C2E00]/40 hover:text-[#5C2E00] transition-colors">Accueil</Link>
          <span className="text-[#5C2E00]/20">›</span>
          <Link to="/boutique" className="text-[#5C2E00]/40 hover:text-[#5C2E00] transition-colors">Boutique</Link>
          <span className="text-[#5C2E00]/20">›</span>
          <Link to={`/boutique?cible=${product.category}`} className="text-[#5C2E00]/40 hover:text-[#5C2E00] transition-colors">{product.category}</Link>
          <span className="text-[#5C2E00]/20">›</span>
          <span className="text-[#db6513]">{product.name}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   IMAGE GALLERY
───────────────────────────────────────────── */
function ImageGallery({ images }: { images: string[] }) {
  const [main, setMain] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Sync animation when image changes
  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 300);
    return () => clearTimeout(timer);
  }, [main]);

  if (!images || images.length === 0) return <div className="bg-[#f4f4f4] h-[440px] flex items-center justify-center text-[#5C2E00]/30 font-black uppercase text-[10px] tracking-widest border border-[#5C2E00]/5 rounded-xl">Image Non Disponible</div>;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  const imgSrc = images[main] || '/placeholder.png';

  return (
    <>
      <div className="relative w-full md:sticky md:top-24 h-fit flex flex-col gap-4 bg-white z-10 p-2 md:p-0">
        {/* Main image container */}
        <div
          className="relative bg-[#F4F4F5] border border-[#5C2E00]/5 rounded-xl overflow-hidden flex items-center justify-center group cursor-crosshair h-[350px] sm:h-[400px] md:h-[520px] touch-none"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onPointerDown={(e) => { if (e.pointerType === 'touch') setIsHovering(true); }}
          onPointerUp={() => setIsHovering(false)}
          onPointerMove={handlePointerMove}
        >
          <img
            key={imgSrc}
            src={imgSrc}
            alt="Product"
            className={`h-full w-full object-contain p-4 transition-all duration-300 ease-out pointer-events-none mix-blend-darken ${isChanging ? 'opacity-0' : 'opacity-100'}`}
            style={{
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: isHovering ? "scale(2.5)" : "scale(1)"
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.png';
            }}
          />

          <span className={`absolute bottom-4 right-4 text-[9px] font-black text-[#5C2E00] uppercase tracking-[0.2em] italic bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[#5C2E00]/10 shadow-sm transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
            Survoler pour inspecter
          </span>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setMain((m) => (m - 1 + images.length) % images.length); }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white border border-[#5C2E00]/10 shadow-lg flex items-center justify-center text-[#5C2E00] hover:text-[#db6513] transition-all opacity-0 group-hover:opacity-100 z-20 rounded-full"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMain((m) => (m + 1) % images.length); }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white border border-[#5C2E00]/10 shadow-lg flex items-center justify-center text-[#5C2E00] hover:text-[#db6513] transition-all opacity-0 group-hover:opacity-100 z-20 rounded-full"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-4 relative z-20">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setMain(i)}
              onMouseEnter={() => setMain(i)}
              className={`relative overflow-hidden bg-[#F4F4F5] rounded-xl border-2 transition-all duration-150 pointer-events-auto group ${main === i ? "border-[#db6513] shadow-md opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-100"}`}
              style={{ height: 100 }}
            >
              <img
                src={src || '/placeholder.png'}
                alt=""
                className="w-full h-full object-contain rounded-lg group-hover:scale-110 transition-transform duration-500 pointer-events-none mix-blend-darken p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png';
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT INFO PANEL
───────────────────────────────────────────── */
function ProductInfo({ product, settings }: { product: any, settings: any }) {
  console.log("Product Data:", product);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || product.color || '');
  const [activeTab, setActiveTab] = useState("description");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: "", city: "", address: "", phone: "" });

  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    } else if (product.color) {
      setSelectedColor(product.color);
    }
    setSelectedSize(null);
  }, [product]);


  // Logic Fix: Promotion validation
  const isPromoActive = useMemo(() => {
    if (!product.discountPrice) return false;
    const now = new Date();
    const start = product.promoStart ? new Date(product.promoStart) : null;
    const end = product.promoEnd ? new Date(product.promoEnd) : null;
    return (!start || now >= start) && (!end || now <= end);
  }, [product]);

  const displayPrice = isPromoActive ? product.discountPrice : product.price;
  const isOutOfStock = product.quantity === 0;
  const discountAmount = product.price > 0 ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  // WhatsApp Link Generator
  const whatsappLink = `https://wa.me/${settings?.whatsapp_number?.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(`Je souhaite commander le modèle *${product.name}* (Ref: ${product.sku}${selectedColor ? `, Couleur: ${getColorName(selectedColor)}` : ''}${selectedSize ? `, Taille: ${selectedSize}` : ''}) - Découvert sur hermado.ma`)}`;

  // Size parsing logic
  const sizeData = product.size || "";
  let availableSizes: (string | number)[] = [];
  if (sizeData.includes('-')) {
    const [min, max] = sizeData.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max) && min <= max) {
      availableSizes = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }
  } else if (sizeData.includes(',')) {
    availableSizes = sizeData.split(',').map(s => s.trim());
  } else if (sizeData) {
    availableSizes = [sizeData];
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5C2E00] border-b-2 border-[#db6513] pb-0.5">{product.category}</span>
        {product.type && <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5C2E00]/60 border border-[#5C2E00]/10 px-2 py-0.5">{product.type}</span>}
        {product.quantity > 0 && product.quantity <= 10 && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#db6513] bg-[#fdf0e8] px-2 py-0.5 shadow-sm border border-orange-100">Plus que {product.quantity} !</span>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-[32px] md:text-[40px] font-black uppercase text-[#5C2E00] leading-[1.1] tracking-tighter mb-2">{product.name}</h1>
        {product.nameAr && <h2 className="text-[24px] font-bold text-[#5C2E00]/60 leading-[1.2] dir-rtl text-right overflow-hidden border-r-4 border-[#db6513] pr-4">{product.nameAr}</h2>}
      </div>

      {/* Rating & Stock */}
      <div className="flex items-center gap-4">
        <StarRating value={5} size="sm" />
        <span className="text-[#5C2E00]/20">|</span>
        {isOutOfStock ? (
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 border border-red-100 italic">En Rupture</span >
        ) : (
          <span className="text-[10px] font-black text-[#db6513] uppercase tracking-widest bg-[#db6513]/5 px-3 py-1 border border-[#db6513]/20 italic">En Stock</span >
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col py-6 border-y border-[#5C2E00]/10">
        <div className="flex items-end gap-4">
          <span className="text-[40px] font-black text-[#5C2E00] leading-none tracking-tighter">{displayPrice}<span className="text-[14px] ml-1 uppercase text-[#5C2E00]/50 tracking-widest">MAD</span></span>
          {isPromoActive && (
            <>
              <span className="text-[20px] text-[#5C2E00]/40 line-through font-bold mb-1">{product.price} MAD</span>
              <span className="mb-2 bg-[#db6513] text-[#5C2E00] text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">−{discountAmount}%</span>
            </>
          )}
        </div>
      </div>

      {/* Description Preview */}
      <p className="text-[13px] text-[#5C2E00]/60 leading-relaxed font-medium">
        {product.description?.length > 180 ? `${product.description.slice(0, 180)}...` : product.description}
      </p>

      {/* Attributes: Color & Size */}
      <div className="flex flex-col gap-6">
        {product?.colors && product.colors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-800 tracking-widest mb-3">Couleur Signature</h4>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((colorHex: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(colorHex)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === colorHex ? 'border-[#D46B2D] scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                  style={{ backgroundColor: getValidCssColor(colorHex) }}
                  title={colorHex}
                  aria-label={`Select color ${colorHex}`}
                />
              ))}
            </div>
            {selectedColor && (
              <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#db6513] animate-in fade-in slide-in-from-left-2 duration-300">
                Sélection : <span className="text-[#5C2E00]">{selectedColor}</span>
              </p>
            )}
          </div>
        )}

        {(!product.category || (product.category.toLowerCase() !== 'sac' && product.category.toLowerCase() !== 'accessoires' && product.category.toLowerCase() !== 'lunettes')) && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Choisir Pointure</h3>
            {!product.size || product.size.trim() === '' ? (
              <p className="text-[11px] font-black uppercase tracking-widest text-[#db6513] bg-[#db6513]/5 border border-[#db6513]/20 px-4 py-3 text-center">
                Pointures disponibles : Contactez-nous
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-4">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 rounded-full flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'bg-[#5C2E00] text-white shadow-md' : 'border border-gray-300 hover:border-[#5C2E00] text-gray-700'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unified Action Buttons */}
      <div className="flex gap-3 mt-4 w-full animate-in slide-in-from-bottom-4 duration-500">
        <button
          className={`flex-1 h-14 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 active:scale-95 transition-transform rounded-sm shadow-md ${isOutOfStock
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-[#5C2E00] text-white"
            }`}
          onClick={(e) => {
            if (isOutOfStock) {
              e.preventDefault();
              return;
            }
            const hasSizes = product.size && product.category?.toLowerCase() !== 'accessoires' && product.category?.toLowerCase() !== 'sac';
            const hasColors = product.colors && product.colors.length > 0;

            if (hasSizes && !selectedSize) {
              toast.error("Veuillez sélectionner une pointure d'abord.");
              return;
            }
            if (hasColors && !selectedColor) {
              toast.error("Veuillez sélectionner une couleur d'abord.");
              return;
            }
            setIsOrderModalOpen(true);
          }}
          disabled={isOutOfStock}
        >
          <MessageSquare className="w-5 h-5" />
          {isOutOfStock ? "Indisponible" : "COMMANDER SUR WHATSAPP"}
        </button>

        {!isOutOfStock && (
          <button
            onClick={() => {
              const hasSizes = product.size && product.category?.toLowerCase() !== 'accessoires' && product.category?.toLowerCase() !== 'sac';
              const hasColors = product.colors && product.colors.length > 0;

              if (hasSizes && !selectedSize) {
                toast.error("Veuillez sélectionner une pointure d'abord.");
                return;
              }
              if (hasColors && !selectedColor) {
                toast.error("Veuillez sélectionner une couleur d'abord.");
                return;
              }
              addToCart(product, selectedSize ? String(selectedSize) : undefined, selectedColor ? String(selectedColor) : undefined);
            }}
            className="w-14 h-14 bg-[#db6513] text-white flex items-center justify-center active:scale-95 transition-transform rounded-sm shadow-md"
          >
            <ShoppingCart className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#5C2E00]/10">
        {[
          { title: "Livraison", desc: "Rapide" },
          { title: "Qualité", desc: "Premium" },
          { title: "Paiement", desc: "Sécurisé" },
        ].map(({ title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-1 border border-[#5C2E00]/5 bg-[#f4f4f4] py-4 text-center hover:border-[#db6513] transition-colors">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#5C2E00]">{title}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#5C2E00]/40">{desc}</span>
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="pt-4 space-y-2">
        <p className="text-[10px] text-[#5C2E00]/50 font-bold uppercase tracking-widest flex items-center gap-2">
          SKU: <span className="text-[#5C2E00]">{product.sku}</span>
        </p>
        <div className="flex items-center gap-4 pt-2">
          <span className="text-[10px] text-[#5C2E00]/50 font-bold uppercase tracking-widest">Partager:</span>
          <div className="flex items-center gap-3">
            <button className="text-[#5C2E00]/40 hover:text-[#5C2E00] transition-colors"><Facebook className="w-4 h-4" /></button>
            <button className="text-[#5C2E00]/40 hover:text-[#5C2E00] transition-colors"><Instagram className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="border-t border-[#5C2E00]/10 pt-8 mt-4">
        <div className="flex gap-8 border-b border-[#5C2E00]/10 mb-6">
          {["description", "caractéristiques"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] font-black uppercase tracking-widest pb-3 border-b-2 transition-all -mb-[1px] ${activeTab === tab ? "border-[#db6513] text-[#5C2E00]" : "border-transparent text-[#5C2E00]/40 hover:text-[#5C2E00]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === "description" && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#5C2E00]/70 leading-relaxed">{product.description || "Aucune description supplémentaire."}</p>
              {product.descriptionAr && (
                <p className="text-[15px] font-medium text-[#5C2E00]/70 leading-relaxed dir-rtl text-right pt-4 border-t border-[#5C2E00]/5">{product.descriptionAr}</p>
              )}
            </div>
          )}
          {activeTab === "caractéristiques" && (
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-[12px] font-medium text-[#5C2E00]/70">
                <span className="w-2 h-2 mt-1 bg-[#db6513] shrink-0"></span>
                <span>Modèle: <strong className="font-black text-[#5C2E00]">{product.type || "Non défini"}</strong></span>
              </li>
              <li className="flex items-start gap-3 text-[12px] font-medium text-[#5C2E00]/70">
                <span className="w-2 h-2 mt-1 bg-[#db6513] shrink-0"></span>
                <span>Couleurs: <strong className="font-black text-[#5C2E00] uppercase">{(product.colors && product.colors.length > 0) ? product.colors.join(', ') : (product.color || "Standard")}</strong></span>
              </li>
              <li className="flex items-start gap-3 text-[12px] font-medium text-[#5C2E00]/70">
                <span className="w-2 h-2 mt-1 bg-[#db6513] shrink-0"></span>
                <span>Département: <strong className="font-black text-[#5C2E00] uppercase">{product.category}</strong></span>
              </li>
            </ul>
          )}
        </div>
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        items={[{ ...product, selectedSize, selectedColor }]}
        totalPrice={displayPrice}
      />
    </div >
  );
}



/* ─────────────────────────────────────────────
   RELATED PRODUCTS
───────────────────────────────────────────── */
function RelatedProducts({ products, currentProductId, category }: { products: any[], currentProductId: string, category: string }) {
  const related = products.filter(p => p.id !== currentProductId && p.category === category).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-5 py-20 border-t border-[#5C2E00]/10 mt-10">
      <div className="text-center mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#db6513] mb-2">Hermado Exclusives</p>
        <h2 className="text-[28px] font-black text-[#5C2E00] uppercase tracking-tighter">Modèles Similaires</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map((p) => {
          const [hov, setHov] = useState(false);
          const currentPrice = (p.discountPrice && p.promoStart && p.promoEnd && new Date() >= new Date(p.promoStart) && new Date() <= new Date(p.promoEnd)) ? p.discountPrice : p.price;
          const imgUrl = (p.images && p.images.length > 0)
            ? (typeof p.images[0] === 'object' ? p.images[0].url : p.images[0])
            : p.image;
          const fullImgUrl = (imgUrl && imgUrl.startsWith('/uploads'))
            ? `${DOMAIN_BASE}${imgUrl}`
            : (imgUrl || '/placeholder.png');

          return (
            <Link to={`/boutique/${p.id}`} key={p.id} className="group block" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
              <div className="relative bg-[#f4f4f4] border border-[#5C2E00]/5 flex items-center justify-center overflow-hidden mb-4" style={{ height: 260 }}>
                <img src={fullImgUrl} alt={p.name} className={`h-40 w-full object-contain p-4 transition-transform duration-700 ${hov ? "scale-110" : "scale-100"}`} />
                {hov && (
                  <div className="absolute inset-0 bg-[#5C2E00]/10 flex flex-col justify-end p-4 transition-opacity animate-in fade-in">
                    <div className="w-full bg-[#5C2E00] text-center text-white text-[9px] font-black uppercase tracking-widest py-3 shadow-xl">Voir les détails</div>
                  </div>
                )}
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5C2E00]/40 mb-1">{p.type || p.category}</p>
              <p className="text-[13px] font-black uppercase text-[#5C2E00] tracking-tighter leading-snug mb-2 group-hover:text-[#db6513] transition-colors">{p.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-black text-[#5C2E00]">{currentPrice} <span className="text-[9px]">MAD</span></span>
                {currentPrice !== p.price && <span className="text-[10px] text-[#5C2E00]/30 line-through font-bold">{p.price} MAD</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT DETAIL PAGE
───────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products, isLoading, error } = useCatalog();
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-[30px]">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#5C2E00]" />
          <p className="text-[#5C2E00] font-black uppercase tracking-widest text-[10px]">Chargement du Modèle</p>
        </div>
      </div>
    )
  }

  const product = products.find(p => p.id === id);

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-4">
          <div className="w-20 h-20 bg-[#f4f4f4] rounded-full flex items-center justify-center mb-6 border border-[#5C2E00]/10">
            <Search className="w-8 h-8 text-[#5C2E00]/30" />
          </div>
          <h1 className="text-[24px] font-black uppercase text-[#5C2E00] mb-2">Modèle Introuvable</h1>
          <p className="text-[12px] text-[#5C2E00]/50 font-medium mb-8">Le modèle que vous cherchez n'est plus disponible ou l'URL est incorrecte.</p>
          <Link to="/boutique" className="bg-[#5C2E00] hover:bg-[#db6513] text-white hover:text-[#5C2E00] font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 transition-colors">
            Retour à la Collection
          </Link>
        </div>
      </div>
    )
  }

  // Ensure images format is an array of valid string urls with API_BASE prefix where needed
  let validImages: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    validImages = product.images.map((img: any) => {
      const url = typeof img === 'object' && img !== null ? img.url : img;
      if (!url) return '';
      return (url.startsWith('/uploads')) ? `${DOMAIN_BASE}${url}` : url;
    }).filter(Boolean);
  } else if (product.image) {
    const imgUrl = product.image;
    validImages = [imgUrl.startsWith('/uploads') ? `${DOMAIN_BASE}${imgUrl}` : imgUrl];
  }


  return (
    <div className="font-sans bg-white min-h-screen flex flex-col">
      <Breadcrumb product={product} />

      {/* Main product section */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 md:py-20 mb-20 md:mb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 xl:gap-20 items-start">
            {/* Left — image gallery */}
            <ImageGallery images={validImages} />

            {/* Right — product info */}
            <ProductInfo
              product={product}
              settings={settings}
            />
          </div>
        </div>

        <RelatedProducts products={products} currentProductId={product.id} category={product.category} />
      </div>
    </div>
  );
}