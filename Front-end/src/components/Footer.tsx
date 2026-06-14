import { Link } from 'react-router-dom';

const Footer = () => {
  /* ── Real SVG social icons ── */
  const IgIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );

  const FbIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );

  const TtIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );

  const socials = [
    { Icon: IgIcon, href: "https://instagram.com/hermado.shoes", label: "Instagram" },
    { Icon: FbIcon, href: "https://facebook.com/hermadoshoes", label: "Facebook" },
    { Icon: TtIcon, href: "https://tiktok.com/@hermado.shoes", label: "TikTok" },
  ];

  return (
    <footer className="bg-[#1a1c2c] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 pb-12 items-start text-center md:text-left">

          {/* Column 1: Brand & Description */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <Link to="/" className="flex items-center focus:outline-none group">
              <span className="text-white font-black text-[22px] uppercase tracking-[0.3em]">
                Fadel trading
              </span>
            </Link>
            <p className="text-gray-400 text-[13px] leading-relaxed max-w-[280px]">
              Votre partenaire de confiance pour l'électroménager et les équipements électroniques de haute qualité. Confort, performance et innovation pour votre maison au meilleur prix.
            </p>
            <div className="flex gap-4">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#db6513] hover:bg-[#db6513] hover:text-white transition-all duration-300 transform hover:scale-110"
                  aria-label={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <h3 className="text-white font-black text-[14px] uppercase tracking-widest text-center md:text-left w-full">
              Liens Rapides
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/boutique" className="text-gray-400 hover:text-[#db6513] transition-colors text-[13px] font-medium">Boutique</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#db6513] transition-colors text-[13px] font-medium">Contact</Link>
              </li>
              <li>
                <Link to="/panier" className="text-gray-400 hover:text-[#db6513] transition-colors text-[13px] font-medium">Mon Panier</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col items-center md:items-start space-y-6 text-center md:text-left">
            <h3 className="text-white font-black text-[14px] uppercase tracking-widest w-full">
              Contactez-nous
            </h3>
            <ul className="space-y-5 flex flex-col items-center md:items-start w-full">
              <li className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-[#db6513]/10 text-[#db6513] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <a href="tel:+212665448023" className="text-gray-400 hover:text-[#db6513] transition-colors text-[13px] font-medium">
                  +212 665 44 80 23
                </a>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-8 h-8 bg-[#db6513]/10 text-[#db6513] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-gray-400 text-[13px] font-medium">contact@fadeltrading.com</span>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-[#db6513]/10 text-[#db6513] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-center md:text-left">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Av.+Sa%C3%AFd+Abou+Jemaa,+Casablanca+20250"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#db6513] text-[13px] font-medium leading-tight transition-colors"
                  >
                    Av. Saïd Abou Jemaa, Casablanca 20250
                  </a>
                  <p className="text-gray-600 text-[11px] uppercase tracking-tighter mt-1">Lun – Dim : 09:30 – 19:30</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 border-t border-white/5 flex flex-col items-center">
          <p className="text-gray-600 text-[11px] font-medium tracking-wide text-center uppercase">
            © {new Date().getFullYear()} Fadel trading — Développé par <span className="text-[#db6513] font-black">WND</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;