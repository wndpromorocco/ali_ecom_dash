import React, { useState } from 'react';
import PDFFlipBook from '@/components/PDFFlipBook';

const PDFCatalogViewer = () => {
  const [pageNum, setPageNum] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(true);

  const sections = [
    { title: "Thés et Tisanes", page: 3, image: "/static/thumb/vignette_thes.png" },
    { title: "Écorces et Légumes séchées", page: 7, image: "/static/thumb/vignette_ecorces.png" },
    { title: "Graines et Fruits secs", page: 13, image: "/static/thumb/vignette_graines.png" },
    { title: "Farines", page: 28, image: "/static/thumb/vignette_farines.png" },
    { title: "Sels et Gommes", page: 34, image: "/static/thumb/vignette_sels.png" },
    { title: "Épices et Marinades", page: 38, image: "/static/thumb/vignette_epices.png" },
    { title: "Herbes séchées", page: 52, image: "/static/thumb/vignette_herbes.png" },
    { title: "Huiles et Olives", page: 59, image: "/static/thumb/vignette_huiles.png" },
    { title: "Vinaigres", page: 61, image: "/static/thumb/vignette_vinaigres.png" },
    { title: "Miel", page: 64, image: "/static/thumb/vignette_miel.png" },
    { title: "Couscous", page: 72, image: "/static/thumb/vignette_couscous.png" }
  ];

  const prevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };

  const nextPage = () => {
    setPageNum(pageNum + 1);
  };

  const goToSection = (page: number) => {
    setPageNum(page);
    setIsMenuOpen(false);
  };

  const handleSwipe = () => {};

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <link
        href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css"
        rel="stylesheet"
      />
      
      {/* Header */}
      <header className="relative w-full h-[60px] bg-cover bg-center flex justify-between items-center px-2.5"
              style={{ backgroundImage: "url('/static/background.jpg')" }}>
        <img 
          src="/static/logo.png" 
          alt="Herbio" 
          className="h-10 cursor-pointer"
          onClick={() => window.open('https://epicerie-bio.herbio.ma', '_self')}
        />
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="bg-transparent border-none text-2xl cursor-pointer text-[#5b665f]"
        >
          ☰
        </button>
      </header>

      {/* Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex justify-center items-center">
          <div className="bg-white p-5 w-[90%] max-w-[500px] max-h-[80%] overflow-y-auto rounded-[10px] relative">
            <span 
              className="absolute top-2.5 right-5 text-[30px] cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              &times;
            </span>
            <h2 className="text-center mb-5">Sommaire</h2>
            <ul className="list-none p-0">
              {sections.map((section, idx) => (
                <li key={idx} className="flex items-center mb-2.5">
                  <img 
                    src={section.image} 
                    alt={section.title}
                    className="w-[50px] h-[50px] mr-2.5 rounded-[5px]"
                  />
                  <button
                    onClick={() => goToSection(section.page)}
                    className="bg-transparent border-none text-left text-lg cursor-pointer text-[#5b665f] hover:underline"
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* PDF Container */}
      <div className="flex-1 flex justify-center items-center overflow-hidden">
        <PDFFlipBook
          pdfUrl="/pdfs/catalogue-fruits.pdf"
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          title="Catalogue Herbio"
          page={pageNum}
        />
      </div>

      {/* Footer */}
      <footer className="flex justify-between items-center h-[60px] px-5 bg-[#f8f8f8] border-t border-[#e0e0e0]">
        <button 
          onClick={prevPage}
          className="bg-[#abb8af] text-white border-none p-2.5 cursor-pointer text-base rounded-[5px] disabled:bg-[#c0c0c0] disabled:cursor-not-allowed"
        >
          <i className="ri-arrow-left-circle-line text-2xl"></i>
        </button>
        <span className="text-base text-[#333]">
          Page {pageNum}
        </span>
        <button 
          onClick={nextPage}
          className="bg-[#abb8af] text-white border-none p-2.5 cursor-pointer text-base rounded-[5px] disabled:bg-[#c0c0c0] disabled:cursor-not-allowed"
        >
          <i className="ri-arrow-right-circle-line text-2xl"></i>
        </button>
      </footer>
    </div>
  );
};

export default PDFCatalogViewer;
