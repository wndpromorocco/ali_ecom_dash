// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCatalog } from "@/hooks/useCatalog";
import ProductCard from "@/components/ProductCard";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

/* ─────────────────────────────────────────────
  BOUTIQUE PAGE — Product Catalog with Filters
───────────────────────────────────────────── */
export default function Boutique() {
  const { products, categories, isLoading } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  // Get max price from products for the slider
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.max(...products.map(p => p.discountPrice || p.price));
  }, [products]);

  const [priceRange, setPriceRange] = useState([0, maxProductPrice || 1000]);

  // Update price range when products are loaded
  useEffect(() => {
    if (maxProductPrice > 0) {
      setPriceRange([0, maxProductPrice]);
    }
  }, [maxProductPrice]);

  // Read active category filter from URL (?cible=Hommes or ?brand=nike)
  const activeCible = searchParams.get("cible") || "";
  const activeModele = searchParams.get("modele") || "";
  const activeBrand = searchParams.get("brand") || "";

  // Build top-level category list (parent categories = "cibles")
  const topCategories = categories.filter((c) => !c.parentId && c.isActive);

  // Filter & sort products
  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (!p.isActive) return false;

      // Search filter
      const matchesSearch = !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());

      // Cible / Modèle filter
      let matchesCible = true;
      if (activeCible) {
        const selectedParent = categories.find(c => c.name.toLowerCase() === activeCible.toLowerCase());
        const productCategory = categories.find(c => c.id === p.categoryId);

        matchesCible = (p.category || "").toLowerCase() === activeCible.toLowerCase() ||
          (selectedParent && (
            p.categoryId === selectedParent.id ||
            (productCategory && productCategory.parentId === selectedParent.id)
          )) || false;
      }

      // Filter by Exact Sub-category if activeModele is selected
      let matchesModele = true;
      if (activeModele) {
        const modeleCategory = categories.find(c => c.id === activeModele || c.name.toLowerCase() === activeModele.toLowerCase());
        const typeMatch1 = (p.type || "").toLowerCase() === activeModele.toLowerCase();
        const typeMatch2 = modeleCategory && (p.type || "").toLowerCase() === modeleCategory.name.toLowerCase();

        matchesModele = String(p.categoryId) === String(activeModele) || typeMatch1 || !!typeMatch2;
      }

      // Debugging requested by user
      if (activeModele) {
        console.log("Produit:", p.name, "ID Catégorie Produit:", p.categoryId, "ID Modèle Sélectionné:", activeModele);
      }

      // Price filter
      const price = p.discountPrice || p.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      // Brand filter
      const matchesBrand = !activeBrand ||
        (p.name + " " + (p.description || "")).toLowerCase().includes(activeBrand.toLowerCase());

      return matchesSearch && matchesCible && matchesModele && matchesPrice && matchesBrand;
    });

    // Sorting
    if (sort === "price-asc") {
      list = [...list].sort(
        (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
      );
    } else if (sort === "price-desc") {
      list = [...list].sort(
        (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
      );
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, categories, search, activeCible, activeModele, activeBrand, sort, priceRange]);

  const setCategory = (cat: string) => {
    if (cat) {
      setSearchParams({ cible: cat });
    } else {
      setSearchParams({});
    }
  };

  const setModele = (cible: string, modeleId: string) => {
    if (modeleId) {
      setSearchParams({ cible, modele: modeleId });
    } else {
      setSearchParams({ cible });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSearchParams({});
    setPriceRange([0, maxProductPrice]);
    setSort("default");
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-[14px] font-black uppercase tracking-widest text-[#1E3A8A] mb-5 flex items-center gap-2">
          Catégories
          <div className="h-px flex-1 bg-gray-100" />
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => setCategory("")}
            className={`flex items-center justify-between w-full py-2 group transition-all ${!activeCible ? "text-[#2563EB] font-bold" : "text-gray-500 hover:text-[#1E3A8A]"
              }`}
          >
            <span className="text-[12px] uppercase tracking-wider">Tous les produits</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${!activeCible ? "rotate-90 text-[#2563EB]" : "group-hover:translate-x-1"}`} />
          </button>

          {topCategories.map((cat) => {
            const isParentActive = activeCible.toLowerCase() === cat.name.toLowerCase();
            const childModels = categories.filter(c => c.parentId === cat.id && c.isActive);

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center justify-between w-full py-2 group transition-all ${isParentActive ? "text-[#2563EB] font-bold" : "text-gray-500 hover:text-[#1E3A8A]"
                    }`}
                >
                  <span className="text-[12px] uppercase tracking-wider">{cat.name}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${isParentActive ? "rotate-90 text-[#2563EB]" : "group-hover:translate-x-1"}`} />
                </button>

                {/* Nested Models */}
                {isParentActive && childModels.length > 0 && (
                  <div className="pl-4 space-y-1 border-l border-gray-100 ml-1 mt-1 mb-2 animate-in slide-in-from-top-2 duration-300">
                    {childModels.map((sub) => {
                      const isSubActive = activeModele === sub.id || activeModele.toLowerCase() === sub.name.toLowerCase();
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setModele(cat.name, sub.id)}
                          className={`flex items-center justify-between w-full py-1.5 px-2 rounded-sm transition-all ${isSubActive
                            ? "bg-[#2563EB]/10 text-[#2563EB] font-bold"
                            : "text-gray-400 hover:text-[#1E3A8A] hover:bg-gray-50"
                            }`}
                        >
                          <span className="text-[11px] uppercase tracking-tight">{sub.name}</span>
                          {isSubActive && <div className="w-1 h-1 rounded-full bg-[#2563EB]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-[14px] font-black uppercase tracking-widest text-[#1E3A8A] mb-5 flex items-center gap-2">
          Prix
          <div className="h-px flex-1 bg-gray-100" />
        </h3>
        <div className="px-2">
          <Slider
            defaultValue={[0, maxProductPrice]}
            max={maxProductPrice}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      {(activeCible || activeBrand || search || priceRange[0] > 0 || priceRange[1] < maxProductPrice) && (
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full rounded-none border-[#1E3A8A]/20 text-[#1E3A8A] text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] hover:text-white transition-all py-6"
        >
          Effacer les filtres
          <X className="w-3 h-3 ml-2" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── PAGE HEADER ── */}
      <div className="bg-[#faf8f6] border-b border-gray-100 pt-16 md:pt-20 pb-10 md:pb-12 px-4 sm:px-5">
        <div className="max-w-6xl mx-auto text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-[#2563EB]/10 rounded-full mb-3 md:mb-4">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#1E3A8A]">
              Maroquinerie d'Excellence
            </p>
          </div>
          <h1 className="text-[32px] sm:text-[40px] md:text-[56px] font-black uppercase tracking-tighter text-gray-900 leading-[1] md:leading-[0.9] mb-4">
            Boutique <span className="text-[#2563EB]">Fadel trading</span>
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-500 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed">
            Découvrez notre sélection exclusive de chaussures et accessoires en cuir premium, conçus pour allier élégance et confort.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden lg:block w-full lg:w-72 flex-none">
            <FilterSidebar />
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1">

            {/* ── SEARCH & MOBILE CONTROLS ── */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 items-stretch sm:items-center justify-between">

              <div className="flex items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E3A8A] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, style, cuir..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-none text-[12px] font-medium text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-[#1E3A8A] transition-all italic"
                  />
                </div>

                {/* Mobile Filter Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden rounded-none border-gray-200 h-[48px] px-6">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Filtres</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader className="mb-8">
                      <SheetTitle className="text-left font-black uppercase tracking-widest text-[#1E3A8A]">Filtres</SheetTitle>
                      <SheetDescription className="text-left py-2 border-b border-gray-100 italic">Personnalisez votre sélection</SheetDescription>
                    </SheetHeader>
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[10px] font-black text-gray-400 uppercase tracking-widest">Trier:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent border-b border-gray-200 py-2 text-[12px] font-black text-[#1E3A8A] uppercase tracking-widest focus:outline-none focus:border-[#2563EB] cursor-pointer appearance-none px-2"
                >
                  <option value="default">Défaut</option>
                  <option value="price-asc">Prix Croissant</option>
                  <option value="price-desc">Prix Décroissant</option>
                  <option value="name">Alphabétique</option>
                </select>
              </div>
            </div>

            {/* ── STATUS BAR ── */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <p className="text-[12px] text-gray-400 italic font-medium">
                {isLoading ? "Recherche en cours..." : (
                  <>Showing <span className="text-gray-900 font-bold">{visibleProducts.length}</span> results</>
                )}
              </p>
              {activeCible && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full">
                    {activeModele && categories.find(c => c.id === activeModele)?.name ? categories.find(c => c.id === activeModele).name : activeCible}
                  </span>
                  <button onClick={() => setCategory("")} className="text-gray-300 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* ── PRODUCT GRID ── */}
            {isLoading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-none overflow-hidden space-y-4">
                    <div className="aspect-[330/495] bg-gray-100 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-100 animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-lg">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Filter className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-[18px] font-black uppercase tracking-widest text-gray-800 mb-2">Aucun article trouvé</h3>
                <p className="text-[12px] text-gray-400 max-w-xs mx-auto italic mb-8">
                  Désolé, nous n'avons trouvé aucun produit correspondant à vos filtres actuels.
                </p>
                <Button
                  onClick={resetFilters}
                  className="rounded-none bg-[#1E3A8A] hover:bg-[#2563EB] text-white hover:text-[#1E3A8A] px-10 py-6 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Réinitialiser tous les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-700">
                {visibleProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}