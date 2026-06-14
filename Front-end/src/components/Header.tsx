import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import CartPreview from "./CartPreview";
import SearchDialog from "./SearchDialog";
import { useCatalog } from "@/hooks/useCatalog";
import { Menu, X as CloseIcon, ShoppingBag, Search as SearchIcon, Instagram, Facebook, Twitter, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   GLOBAL HEADER COMPONENT
───────────────────────────────────────────── */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [activeDrop, setActiveDrop] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { categories } = useCatalog();
  const { totalItems } = useCart();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const NAV_LINKS = [
    { label: "Accueil", path: "/" },
    { label: "Boutique", path: "/boutique" },
    { label: "Contact", path: "/contact" }
  ];

  // Map dynamic categories (Cibles - those without parentId)
  const cibles = categories.filter(c => !c.parentId && c.isActive);

  const BOUTIQUE_ITEMS = cibles.length > 0
    ? cibles.map(c => ({
      label: c.name,
      path: `/boutique?cible=${encodeURIComponent(c.name)}`
    }))
    : [
      { label: "Hommes", path: "/boutique?cible=Hommes" },
      { label: "Femmes", path: "/boutique?cible=Femmes" },
      { label: "Enfants", path: "/boutique?cible=Enfants" }
    ];

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* ANNOUNCEMENT BAR - Optimized for Mobile visibility & centering */}
      <div className="bg-[#5C2E00] text-white border-b border-white/10">
        <div className="w-full flex items-center justify-center text-center px-2 py-2">
          <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] items-center text-center flex-wrap max-w-lg mx-auto font-black uppercase tracking-wider">
            <Truck size={14} className="text-[#E6A37C] animate-pulse shrink-0" />
            <span className="leading-tight">LIVRAISON GRATUITE SUR TOUTES LES COMMANDES</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between h-20 md:h-24 lg:h-28 relative">

          {/* Mobile Left: Hamburger Menu */}
          <div className="flex lg:hidden justify-start z-10 relative">
            <button
              className="p-1 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu className="w-7 h-7 text-[#5C2E00]" />
            </button>
          </div>

          {/* Logo Section (Left on desktop, Mathematically Centered on mobile via absolute) */}
          <div className="z-10 lg:static absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:translate-x-0 lg:translate-y-0">
            <Link to="/" className="flex items-center gap-2 lg:gap-4 focus:outline-none group">
              <img
                src="/images/logo.png"
                alt="Fadel trading Symbol"
                className="h-10 sm:h-12 md:h-12 lg:h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              />
              <span className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter text-[#5C2E00] uppercase italic leading-none whitespace-nowrap">
                Fadel trading
              </span>
            </Link>
          </div>

          {/* Desktop Center: Navigation Links (Absolute Centered) */}
          <nav className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center z-20">
            <ul className="flex items-center gap-10">
              {NAV_LINKS.map((item) => {
                const isActive = location.pathname === item.path;
                const isBoutique = item.path === "/boutique";

                return (
                  <li
                    key={item.label}
                    className="relative py-2 flex items-center cursor-pointer"
                    onMouseEnter={() => isBoutique && setActiveDrop(true)}
                    onMouseLeave={() => isBoutique && setActiveDrop(false)}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest ${isActive ? "text-[#db6513]" : "text-gray-500 hover:text-[#5C2E00]"
                        } transition-colors duration-200`}
                    >
                      {item.label}
                      {isBoutique && (
                        <svg className={`w-2.5 h-2.5 transition-transform duration-300 ${activeDrop ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </Link>

                    {isBoutique && activeDrop && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-xl border-t-2 border-[#db6513] min-w-[180px] py-2 animate-in fade-in slide-in-from-top-1 z-[90]">
                        {BOUTIQUE_ITEMS.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            className="block px-6 py-3 text-[10px] font-black uppercase tracking-wider text-gray-600 hover:text-[#db6513] hover:bg-gray-50 transition-all"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right: Icons (Cart & Search) */}
          <div className="flex items-center justify-end gap-3 md:gap-4 lg:gap-6 z-10 relative">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 hover:bg-gray-50 rounded-full transition-colors focus:outline-none group"
              aria-label="Rechercher"
            >
              <SearchIcon className="w-5 h-5 lg:w-6 lg:h-6 text-[#5C2E00]/80 group-hover:text-[#db6513] cursor-pointer transition-colors" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1.5 hover:bg-gray-50 rounded-full transition-colors focus:outline-none group"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-[#5C2E00]/80 group-hover:text-[#db6513] cursor-pointer transition-colors" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key={totalItems}
                    className="absolute -top-1 -right-1 bg-[#db6513] text-white text-[9px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white pointer-events-none shadow-sm"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {open && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop Blur */}
            <div
              className="absolute inset-0 bg-[#5C2E00]/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
              onClick={() => setOpen(false)}
            />
            {/* Drawer Content */}
            <div className="absolute top-0 left-0 bottom-0 w-[80%] sm:w-[350px] bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <img src="/images/logo.png" alt="Fadel trading" className="h-10 w-auto object-contain" />
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-[#5C2E00] transition-colors">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-8 flex-1 overflow-y-auto flex flex-col gap-10">
                <nav className="flex flex-col gap-8">
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`block text-xl font-black uppercase tracking-widest ${location.pathname === item.path ? "text-[#db6513]" : "text-[#5C2E00] hover:text-[#db6513]"
                        } transition-colors`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="pt-8 border-t border-gray-50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C2E00]/40 mb-6 px-2">Suivez-nous</p>
                  <div className="flex gap-6 px-2">
                    <a href="#" className="p-2 bg-gray-50 rounded-full text-[#5C2E00] hover:text-[#db6513] transition-colors">
                      <Instagram size={24} />
                    </a>
                    <a href="#" className="p-2 bg-gray-50 rounded-full text-[#5C2E00] hover:text-[#db6513] transition-colors">
                      <Facebook size={24} />
                    </a>
                    <a href="#" className="p-2 bg-gray-50 rounded-full text-[#5C2E00] hover:text-[#db6513] transition-colors">
                      <Twitter size={24} />
                    </a>
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C2E00]/40 mb-4 px-2">Collections</p>
                  <div className="grid grid-cols-1 gap-2">
                    {BOUTIQUE_ITEMS.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.path}
                        className="block px-2 py-3 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#db6513] transition-all"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-50 bg-[#faf8f6]">
                <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 text-center">
                  © Fadel trading MAROC
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      <CartPreview isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
