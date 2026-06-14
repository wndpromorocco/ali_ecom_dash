import React, { useState, useEffect, useMemo, memo } from "react";
import { Truck, RefreshCw, Headphones, HandCoins } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useCatalog } from "@/hooks/useCatalog";
import GlobalProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";

/* ─────────────────────────────────────────────
  COUNTDOWN HOOK
───────────────────────────────────────────── */
function useCountdown(endDate) {
  const calc = () => {
    if (!endDate) return { days: 0, hours: 0, mins: 0, secs: 0 };
    const d = Math.max(0, new Date(endDate).getTime() - Date.now());
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      mins: Math.floor((d % 3600000) / 60000),
      secs: Math.floor((d % 60000) / 1000),
    };
  };
  const [t_data, setT_data] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT_data(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return t_data;
}

import { API_BASE, DOMAIN_BASE } from "@/config";

/* ─────────────────────────────────────────────
  DATA
───────────────────────────────────────────── */


const GALLERY_IMGS = [
  "/images/gallery/gallery-1.jpg",
  "/images/gallery/gallery-2.jpg",
  "/images/gallery/gallery-3.jpg",
  "/images/gallery/gallery-4.jpg",
  "/images/gallery/gallery-5.jpg",
];

/* ─────────────────────────────────────────────
  HERO
───────────────────────────────────────────── */
function Hero({ slides = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  const scrollToProducts = () => {
    document.getElementById("latest-products")?.scrollIntoView({ behavior: "smooth" });
  };

  if (slides.length === 0) {
    return (
      <section className="relative bg-white overflow-hidden md:h-[480px] h-[400px]">
        {/* Background Decoratives */}
        <div className="absolute top-0 right-0 h-full bg-[#db6513] w-[58%]" style={{ clipPath: "polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)" }} />
        <div className="absolute top-0 right-0 h-full w-[54%] bg-white/10" style={{ clipPath: "polygon(2% 0%, 9% 0%, 7% 100%, 0% 100%)" }} />
        <div className="absolute top-0 right-0 h-full w-[48%] bg-white/5" style={{ clipPath: "polygon(2% 0%, 8% 0%, 6% 100%, 0% 100%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center px-5">
          <div className="w-full md:w-5/12 text-center md:text-left">
            <h1 className="text-[42px] md:text-[52px] font-black text-gray-900 leading-[1] mb-8 uppercase tracking-tighter italic">
              Chaussures<br />Premium Cuir !
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link
                to="/boutique"
                className="flex min-h-[48px] items-center gap-3 bg-[#5C2E00] hover:bg-[#db6513] text-white hover:text-[#5C2E00] text-[10px] font-black uppercase tracking-[0.2em] px-7 py-3.5 rounded-full transition-all duration-300 shadow-xl"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12 11.58-15c-.2-.68-.83-1.15-1.57-1.15H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                Acheter Maintenant
              </Link>
            </div>
          </div>

          <div className="hidden md:flex w-7/12 justify-center pt-8">
            <img
              src="/images/hero-shoe.png"
              alt="Hero Shoe"
              className="w-[400px] select-none rotate-[-8deg] translate-x-8 translate-y-2 drop-shadow-[0_40px_60px_rgba(0,0,0,0.4)] mix-blend-multiply transition-all duration-700 hover:scale-105"
            />
          </div>
        </div>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section className="relative bg-white overflow-hidden md:h-[480px] h-[420px] shadow-sm z-20">
      {/* Background Decoratives - simplified for dynamic slides to avoid overlap issues */}
      <div className="absolute inset-0 bg-gray-50/50" />
      <div className="absolute top-0 right-0 h-full bg-[#db6513] w-[35%] md:w-[45%]" style={{ clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)" }} />

      <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center pt-8 md:pt-0 px-4 sm:px-5 gap-4 md:gap-10">
        <div className="w-full md:w-5/12 text-center md:text-left animate-in fade-in slide-in-from-left-8 duration-700 order-2 md:order-1">
          <h1 className="text-[28px] sm:text-[38px] md:text-[50px] font-black text-gray-900 leading-[1.1] md:leading-[1] mb-2 md:mb-6 uppercase tracking-tighter italic">
            {slide.title?.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}<br className="hidden md:block" />
                {i < slide.title.split('\n').length - 1 && <span className="md:hidden"> </span>}
              </React.Fragment>
            )) || "Chaussures Premium"}
          </h1>
          <p className="text-[10px] sm:text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-4 md:mb-8 max-w-sm mx-auto md:mx-0">
            {slide.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Link
              to="/boutique"
              className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-3 bg-[#5C2E00] hover:bg-[#db6513] text-white hover:text-[#5C2E00] text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-[#5C2E00]/20 active:scale-95"
            >
              Collection Boutique
            </Link>
          </div>
        </div>

        <div className="flex md:w-7/12 justify-center items-center h-[220px] md:h-full relative order-1 md:order-2 w-full mt-4 md:mt-0">
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-75 -z-10 animate-pulse" />
          <img
            key={slide.id}
            src={slide.imageUrl.startsWith('http') ? slide.imageUrl : `${DOMAIN_BASE}${slide.imageUrl}`}
            alt={slide.title}
            className="h-full md:max-h-[85%] w-auto object-contain select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:drop-shadow-[0_35px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 fade-in duration-700 hover:scale-[1.03] transition-transform cursor-pointer"
          />
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-[145px] left-1/2 -translate-x-1/2 md:bottom-10 md:left-8 md:translate-x-0 flex gap-3 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${current === i ? 'w-10 bg-[#5C2E00] shadow-sm' : 'w-3 bg-[#5C2E00]/20 hover:bg-[#5C2E00]/40'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
  PRE-FOOTER TRUST SIGNALS (COD FOCUS)
 ───────────────────────────────────────────── */
function PreFooter() {
  const items = [
    { label: "Livraison Gratuite", icon: <Truck strokeWidth={1.5} className="w-7 h-7 text-[#db6513]" /> },
    { label: "Politique de Retour", icon: <RefreshCw strokeWidth={1.5} className="w-7 h-7 text-[#db6513]" /> },
    { label: "Assistance 24/7", icon: <Headphones strokeWidth={1.5} className="w-7 h-7 text-[#db6513]" /> },
    { label: "Paiement à la Livraison", icon: <HandCoins strokeWidth={1.5} className="w-7 h-7 text-[#db6513]" /> },
  ];

  return (
    <section className="bg-[#1a1c2c] pt-12 pb-8 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 divide-x divide-white/10 text-center">
          {items.map(({ label, icon }) => (
            <div key={label} className="flex flex-col items-center justify-center gap-4 px-4">
              {icon}
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/80">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
  GALLERY GRID
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
  GALLERY GRID
 ───────────────────────────────────────────── */
function GalleryGrid({ images = [], bf = null }) {
  // Pad images to 5 if needed
  const displayImages = [...images];
  while (displayImages.length < 5) displayImages.push({ imageUrl: "/images/gallery/gallery-1.jpg" });

  return (
    <div className="w-full bg-[#faf8f6] py-16 md:py-24 mb-0">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:h-[380px]">
          {/* Slot 1 */}
          <div className="col-span-1 md:row-span-2 overflow-hidden rounded-sm bg-[#e3dfda] h-[180px] md:h-full shadow-sm border border-[#d6d1ca] isolate">
            <img
              src={displayImages[0]?.imageUrl?.startsWith('/uploads') ? `${DOMAIN_BASE}${displayImages[0].imageUrl}` : displayImages[0]?.imageUrl}
              alt=""
              className="w-full h-full object-contain p-4 hover:scale-105 transition-all duration-500 drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] mix-blend-darken"
            />
          </div>
          {/* Slot 2 */}
          <div className="col-span-1 md:row-span-1 overflow-hidden rounded-sm bg-[#e3dfda] h-[180px] shadow-sm border border-[#d6d1ca] isolate">
            <img
              src={displayImages[1]?.imageUrl?.startsWith('/uploads') ? `${DOMAIN_BASE}${displayImages[1].imageUrl}` : displayImages[1]?.imageUrl}
              alt=""
              className="w-full h-full object-contain p-4 hover:scale-105 transition-all duration-500 drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] mix-blend-darken"
            />
          </div>
          {/* Slot 3 */}
          <div className="col-span-1 md:row-span-1 overflow-hidden rounded-sm bg-[#e3dfda] h-[180px] shadow-sm border border-[#d6d1ca] isolate">
            <img
              src={displayImages[2]?.imageUrl?.startsWith('/uploads') ? `${DOMAIN_BASE}${displayImages[2].imageUrl}` : displayImages[2]?.imageUrl}
              alt=""
              className="w-full h-full object-contain p-4 hover:scale-105 transition-all duration-500 drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] mix-blend-darken"
            />
          </div>
          {/* Black Friday Slot */}
          {bf?.isActive !== false ? (
            <div
              className="col-span-1 md:row-span-2 flex flex-col items-center justify-center p-6 rounded-sm h-[180px] md:h-full overflow-hidden text-center transition-all duration-300"
              style={{ backgroundColor: bf?.bgColor || "#db6513" }}
            >
              <span className="text-4xl mb-4">{bf?.emoji || "👟"}</span>
              <p
                className="font-black text-[22px] uppercase leading-none italic"
                style={{ color: bf?.textColor || "#dc2626" }}
              >
                {bf?.line1 || "BLACK"}
              </p>
              <p
                className="font-black text-[22px] uppercase leading-none italic mb-4"
                style={{ color: bf?.textColor || "#dc2626" }}
              >
                {bf?.line2 || "FRIDAY"}
              </p>
              <div
                className="border-2 rounded-full px-4 py-1"
                style={{ borderColor: bf?.borderColor || "#dc2626" }}
              >
                <span
                  className="font-black text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: bf?.textColor || "#dc2626" }}
                >
                  {bf?.badgeText || "Super Soldes"}
                </span>
              </div>
            </div>
          ) : (
            <div className="col-span-1 md:row-span-2 overflow-hidden rounded-sm bg-[#e3dfda] h-[180px] md:h-full shadow-sm border border-[#d6d1ca] isolate">
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <span className="text-4xl">👟</span>
              </div>
            </div>
          )}
          {/* Slot 4 */}
          <div className="col-span-1 md:row-span-1 overflow-hidden rounded-sm bg-[#e3dfda] h-[180px] shadow-sm border border-[#d6d1ca] isolate">
            <img
              src={displayImages[3]?.imageUrl?.startsWith('/uploads') ? `${DOMAIN_BASE}${displayImages[3].imageUrl}` : displayImages[3]?.imageUrl}
              alt=""
              className="w-full h-full object-contain p-4 hover:scale-105 transition-all duration-500 drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] mix-blend-darken"
            />
          </div>
          {/* Slot 5 */}
          <div className="col-span-1 md:row-span-1 overflow-hidden rounded-sm bg-[#e3dfda] h-[180px] shadow-sm border border-[#d6d1ca] isolate">
            <img
              src={displayImages[4]?.imageUrl?.startsWith('/uploads') ? `${DOMAIN_BASE}${displayImages[4].imageUrl}` : displayImages[4]?.imageUrl}
              alt=""
              className="w-full h-full object-contain p-4 hover:scale-105 transition-all duration-500 drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)] mix-blend-darken"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
  LATEST PRODUCTS
───────────────────────────────────────────── */
function LatestProducts() {
  const { products, isLoading } = useCatalog();
  const latestProducts = products.filter(p => p.isActive).slice(0, 8);

  return (
    <section id="latest-products" className="max-w-[1320px] mx-auto px-4 md:px-10 mb-16 md:mb-24 mt-8 md:mt-12 scroll-mt-20">
      <div className="flex flex-col items-center mb-8 md:mb-10">
        <div className="flex items-center gap-4 md:gap-10">
          <button className="hidden sm:flex w-9 h-9 rounded-full border border-[#5C2E00]/10 items-center justify-center text-[#5C2E00]/40 hover:border-[#db6513] hover:text-[#db6513] hover:bg-[#db6513]/10 transition-all duration-300 group">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-[18px] md:text-[22px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] text-[#5C2E00]">Derniers Produits</h2>
            <p className="text-[8px] md:text-[10px] text-[#5C2E00]/60 font-semibold uppercase tracking-[0.2em] md:tracking-[0.25em] mt-1.5 px-4 md:px-0">Découvrez nos styles les plus populaires</p>
          </div>
          <button className="hidden sm:flex w-9 h-9 rounded-full border border-[#5C2E00]/10 items-center justify-center text-[#5C2E00]/40 hover:border-[#db6513] hover:text-[#db6513] hover:bg-[#db6513]/10 transition-all duration-300 group">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#5C2E00]/50 animate-pulse">Chargement de la collection...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {latestProducts.map((p) => <GlobalProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
  HOT DEAL SECTION (Memoized to prevent flicker during countdown)
───────────────────────────────────────────── */
const HotDeal = memo(({ promo }: { promo: any }) => {
  const { addToCart } = useCart();
  const { days, hours, mins, secs } = useCountdown(promo?.promoEndDate);
  const [imageLoaded, setImageLoaded] = useState(false);
  const pad = (v) => String(v).padStart(2, "0");

  if (!promo || !promo.isActive) return null;

  const product = promo.product;

  const bgWithCacheBust = useMemo(() => {
    const bgImage = promo?.imageUrl
      ? (promo.imageUrl.startsWith('http') ? promo.imageUrl : `${DOMAIN_BASE}${promo.imageUrl}`)
      : "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80";

    // Use a stable property like updatedAt to bust cache only when record actually changes
    const ts = promo.updatedAt ? new Date(promo.updatedAt).getTime() : 'initial';
    return `${bgImage}${bgImage.includes('?') ? '&' : '?'}t=${ts}`;
  }, [promo?.imageUrl, promo?.updatedAt]);

  // Preload image to handle smooth transition
  useEffect(() => {
    if (!bgWithCacheBust) return;
    const img = new Image();
    img.src = bgWithCacheBust;
    img.onload = () => setImageLoaded(true);
  }, [bgWithCacheBust]);

  return (
    <section className="flex flex-col md:flex-row mb-0 animate-in fade-in duration-1000">
      <div
        className="relative flex flex-col items-center justify-center px-10 py-24 md:w-1/2 overflow-hidden transition-all duration-700"
        style={{ minHeight: 520 }}
      >
        {/* Background Layer with smooth fade-in */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: `url(${bgWithCacheBust})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        {/* Skeleton/Placeholder while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Hermado Exclusive</div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center max-w-sm">
          <h2 className="text-white font-black text-[34px] uppercase leading-[0.95] mb-4 tracking-tighter italic">
            {promo.sectionTitle}
          </h2>
          <p className="text-gray-300 text-[11px] mb-10 font-black uppercase tracking-[0.2em]">{promo.sectionSubtitle}</p>
          <div className="bg-white rounded shadow-2xl flex divide-x divide-gray-100 mb-8 md:mb-12 mx-auto w-fit overflow-hidden">
            {[
              { v: pad(days), l: "Jours" },
              { v: pad(hours), l: "Heures" },
              { v: pad(mins), l: "Min" },
              { v: pad(secs), l: "Sec" },
            ].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 py-3 md:py-5 min-w-[55px] sm:min-w-[65px] md:min-w-[85px]">
                <span className="text-[20px] sm:text-[22px] md:text-[32px] font-black text-gray-900 leading-none mb-1">{v}</span>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">{l}</span>
              </div>
            ))}
          </div>
          <Link to="/boutique" className="inline-flex min-h-[48px] items-center justify-center bg-[#db6513] hover:bg-[#5C2E00] text-[#5C2E00] hover:text-white text-[11px] font-black uppercase tracking-[0.2em] px-12 py-4 rounded-full transition-all shadow-xl hover:scale-105 active:scale-95 shadow-[#db6513]/20">
            Acheter Maintenant
          </Link>
        </div>
      </div>
      <div className="md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#db6513]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#5C2E00]/5 rounded-full blur-3xl" />

        <div className="flex flex-col items-center text-center relative z-10">
          <img
            src={product?.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${DOMAIN_BASE}${product.images[0]}`) : "/images/gallery/gallery-1.jpg"}
            alt="Deal product"
            loading="eager"
            className="w-80 h-auto drop-shadow-[0_25px_60px_rgba(0,0,0,0.15)] mb-10 transform -rotate-12 select-none hover:rotate-0 transition-transform duration-700"
          />
          <div className="flex flex-col gap-3">
            <h3 className="text-gray-900 font-black text-[20px] uppercase tracking-tighter leading-tight max-w-xs text-center italic">
              {product?.name || "CHAUSSURES CONFORT PREMIUM"}
            </h3>
            <div className="flex items-center gap-3 justify-center mb-4">
              <span className="text-[22px] font-black text-[#5C2E00]">
                {product?.discountPrice || product?.price || "---"} MAD
              </span>
              {(product?.discountPrice && product.price > product.discountPrice) && (
                <span className="text-[14px] text-red-500 line-through font-bold opacity-40">
                  {product.price} MAD
                </span>
              )}
            </div>
            <button
              onClick={() => {
                if (!product) return;
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.discountPrice || product.price,
                  image: product.images[0],
                  category: product.categoryId,
                  quantity: 1
                });
              }}
              className="flex min-h-[48px] items-center justify-center bg-[#5C2E00] hover:bg-white text-white hover:text-[#5C2E00] hover:border-[#5C2E00] border-2 border-transparent text-[10px] font-black uppercase tracking-[0.2em] px-10 py-4 rounded-full transition-all shadow-xl mx-auto shadow-[#5C2E00]/20 active:scale-95"
            >
              Ajouter au Panier
            </button>
          </div>
        </div>
      </div>
    </section >
  );
});

/* ─────────────────────────────────────────────
  BRANDS STRIP
───────────────────────────────────────────── */
function BrandsStrip() {
  const brands = [
    { name: 'Gucci', logo: '/brand-logos/gucci.jpeg' },
    { name: 'Louboutin', logo: '/brand-logos/louboutin.jpeg' },
    { name: 'Prada', logo: '/brand-logos/prada.jpeg' },
    { name: 'Salvatore Ferragamo', logo: '/brand-logos/ferragamo.jpeg' },
    { name: 'Versace', logo: '/brand-logos/versace.jpeg' },
  ];

  // Repeat the logos 4 times to fill the screen and ensure a seamless loop
  const repeatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <section className="bg-white border-y border-gray-200 py-4 md:py-5 overflow-hidden relative z-10 flex items-center">
      <div className="animate-marquee-wrapper marquee-fade w-full overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap items-center w-max">
          {/* We render the repeated set twice: the total width is 2 * (4 * 5 logos) = 40 logos. 
              The animation moves -50% (halfway), so it loops back to the start of the second main group. */}
          <div className="flex items-center shrink-0">
            {repeatedBrands.map((brand, i) => (
              <div key={`${brand.name}-${i}-1`} className="flex items-center justify-center mx-8 lg:mx-16">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-12 md:h-16 lg:h-20 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer mix-blend-multiply"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center shrink-0">
            {repeatedBrands.map((brand, i) => (
              <div key={`${brand.name}-${i}-2`} className="flex items-center justify-center mx-8 lg:mx-16">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-12 md:h-16 lg:h-20 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer mix-blend-multiply"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
  INSTAGRAM SECTION
───────────────────────────────────────────── */
function InstagramSection() {
  const photos = [
    "/images/footer/img1.jpeg",
    "/images/footer/img2.jpeg",
    "/images/footer/img3.jpeg",
    "/images/footer/img4.jpeg",
    "/images/footer/img5.jpeg",
    "/images/footer/img6.jpeg",
  ];
  return (
    <section className="w-full pt-0 border-b border-gray-100">
      <a href="https://www.instagram.com/hermado.shoes" target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden">
        <div className="grid grid-cols-3 md:grid-cols-6 h-[200px] md:h-[250px] gap-0">
          {photos.map((img, i) => (
            <div key={i} className="relative overflow-hidden">
              <img src={img} alt="Hermado Instagram" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-center justify-center">
          <span className="text-white font-black text-[13px] uppercase tracking-[0.3em] border-2 border-white/30 px-6 py-2">@hermado.shoes</span>
        </div>
      </a>
    </section>
  );
}

/* ─────────────────────────────────────────────
  HOME PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const { data: homepageData, isLoading } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const [heroRes, promoRes, gallRes, bfRes] = await Promise.all([
        fetch(`${API_BASE}/homepage/hero`),
        fetch(`${API_BASE}/homepage/promo`),
        fetch(`${API_BASE}/homepage/gallery`),
        fetch(`${API_BASE}/homepage/blackfriday`)
      ]);

      const results = {
        heroSlides: [],
        promo: null,
        gallery: [],
        bf: null
      };

      if (heroRes.ok) results.heroSlides = (await heroRes.json()).data || [];
      if (promoRes.ok) results.promo = (await promoRes.json()).data;
      if (gallRes.ok) results.gallery = (await gallRes.json()).data || [];
      if (bfRes.ok) results.bf = (await bfRes.json()).data;

      return results;
    },
    refetchInterval: 30000, // Optional: Poll every 30 seconds to catch admin updates
    refetchOnWindowFocus: true
  });

  if (isLoading && !homepageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-[#5C2E00]/40 animate-pulse italic">
          Expérience de Luxe en cours...
        </div>
      </div>
    );
  }

  const { heroSlides, promo, gallery, bf } = homepageData || { heroSlides: [], promo: null, gallery: [], bf: null };

  return (
    <div className="font-sans bg-white selection:bg-[#db6513]/30 selection:text-[#5C2E00]">
      <Hero slides={heroSlides} />
      <BrandsStrip />
      <GalleryGrid images={gallery} bf={bf} />
      <LatestProducts />
      <HotDeal promo={promo} />
      <InstagramSection />
      <PreFooter />
    </div>
  );
}
