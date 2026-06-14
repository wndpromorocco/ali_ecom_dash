import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react';

type PdfViewport = { width: number; height: number };
type PdfPage = {
  getViewport: (params: { scale: number }) => PdfViewport;
  render: (ctx: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => { promise: Promise<void> };
};
type PdfDocument = { numPages: number; getPage: (num: number) => Promise<PdfPage> };
type PdfJsLibLike = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: string | { url: string; disableWorker?: boolean }) => { promise: Promise<PdfDocument> };
};
type PageFlipController = { flip: (pageIndex: number) => void };
type BookRef = { pageFlip: () => PageFlipController };

interface PDFFlipBookProps {
  pdfUrl: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  page?: number;
}

const PDFFlipBook: React.FC<PDFFlipBookProps> = ({ pdfUrl, isOpen, onClose, title, page }) => {
  const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [pages, setPages] = useState<Array<string | null>>([]);
  const bookRef = useRef<BookRef | null>(null);
  const initialStartPageRef = useRef<number>(0);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 620, height: 860 });

  const ensurePdfjs = useCallback(async (): Promise<PdfJsLibLike | null> => {
    let lib = (window as unknown as { pdfjsLib?: PdfJsLibLike }).pdfjsLib;
    if (!lib) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load PDF.js script'));
        document.head.appendChild(s);
      });
      lib = (window as unknown as { pdfjsLib?: PdfJsLibLike }).pdfjsLib || null;
    }
    return lib || null;
  }, []);

  const computeDimensions = useCallback(() => {
    const vw = Math.min(window.innerWidth, 1200);
    const vh = Math.min(window.innerHeight, 900);
    const width = Math.floor(vw * 0.6);
    const height = Math.floor(vh * 0.8);
    setDimensions({ width: Math.max(360, Math.floor(width * scale)), height: Math.max(480, Math.floor(height * scale)) });
  }, [scale]);

  useEffect(() => {
    computeDimensions();
    const h = () => computeDimensions();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [computeDimensions]);

  const renderPageToDataUrl = useCallback(async (doc: PdfDocument, num: number, targetWidth: number): Promise<string> => {
    const pageObj = await doc.getPage(num);
    const viewport1 = pageObj.getViewport({ scale: 1 });
    const scaleFactor = targetWidth / viewport1.width;
    const viewport = pageObj.getViewport({ scale: scaleFactor });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    await pageObj.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/png');
  }, []);

  const preloadAround = useCallback(async (doc: PdfDocument, center: number) => {
    const w = dimensions.width;
    const indices = [center, center + 1, center - 1].filter((p) => p >= 1 && p <= totalPages);
    const nextPages = [...pages];
    let modified = false;
    for (const p of indices) {
      if (!nextPages[p - 1]) {
        try {
          const url = await renderPageToDataUrl(doc, p, w);
          if (nextPages[p - 1] !== url) {
            nextPages[p - 1] = url;
            modified = true;
          }
        } catch {
          if (nextPages[p - 1] !== null) {
            nextPages[p - 1] = null;
            modified = true;
          }
        }
      }
    }
    if (modified) setPages(nextPages);
  }, [dimensions.width, pages, renderPageToDataUrl, totalPages]);

  const loadPDF = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pdfjsLib = await ensurePdfjs();
      if (!pdfjsLib) {
        setError('Erreur lors du chargement du PDF');
        return;
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
      let pdf: PdfDocument | null = null;
      try {
        pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
      } catch {
        pdf = await pdfjsLib.getDocument({ url: pdfUrl, disableWorker: true }).promise;
      }
      if (!pdf) {
        setError('Erreur lors du chargement du PDF');
        return;
      }
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setPages(Array.from({ length: pdf.numPages }, () => null));
      setCurrentPage(1);
    } catch {
      setError('Erreur lors du chargement du PDF');
    } finally {
      setLoading(false);
    }
  }, [ensurePdfjs, pdfUrl]);

  useEffect(() => {
    if (!isOpen) return;
    initialStartPageRef.current = Math.max(0, (page ? page : 1) - 1);
    loadPDF();
  }, [isOpen, loadPDF]);

  useEffect(() => {
    if (!pdfDoc) return;
    const center = page ? page : currentPage;
    preloadAround(pdfDoc, center);
  }, [pdfDoc, currentPage, page, preloadAround, dimensions.width]);

  useEffect(() => {
    if (page === undefined || totalPages <= 0) return;
    const api = bookRef.current?.pageFlip?.();
    if (!api || typeof (api as PageFlipController).flip !== 'function') return;
    (api as PageFlipController).flip(Math.max(0, Math.min(totalPages - 1, page - 1)));
  }, [page, totalPages]);

  const goPrev = () => {
    const api = bookRef.current?.pageFlip?.();
    if (!api || typeof (api as PageFlipController).flip !== 'function') return;
    (api as PageFlipController).flip(Math.max(0, currentPage - 2));
  };
  const goNext = () => {
    const api = bookRef.current?.pageFlip?.();
    if (!api || typeof (api as PageFlipController).flip !== 'function') return;
    (api as PageFlipController).flip(Math.min(totalPages - 1, currentPage));
  };
  const zoomIn = () => setScale((s) => Math.min(2, s + 0.1));
  const zoomOut = () => setScale((s) => Math.max(0.7, s - 0.1));
  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    link.click();
  };

  const flipChildren = useMemo(() => {
    return Array.from({ length: totalPages }, (_, idx) => {
      const dataUrl = pages[idx];
      return (
        <div key={idx} className="bg-white w-full h-full flex items-center justify-center">
          {dataUrl ? (
            <img src={dataUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}
        </div>
      );
    });
  }, [pages, totalPages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-full max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{title || 'Document PDF'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <button onClick={goPrev} className="p-2 hover:bg-gray-200 rounded transition-colors" aria-label="Page précédente">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 min-w-[100px] text-center">
              {loading ? 'Chargement...' : `${currentPage} / ${totalPages}`}
            </span>
            <button onClick={goNext} className="p-2 hover:bg-gray-200 rounded transition-colors" aria-label="Page suivante">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={zoomOut} className="p-2 hover:bg-gray-200 rounded transition-colors" aria-label="Zoom arrière">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-2 hover:bg-gray-200 rounded transition-colors" aria-label="Zoom avant">
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button onClick={downloadPDF} className="p-2 hover:bg-gray-200 rounded transition-colors" aria-label="Télécharger">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-100 p-4 flex items-center justify-center">
          {error ? (
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">⚠️</div>
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <HTMLFlipBook
              ref={bookRef as unknown as React.RefObject<BookRef>}
              startPage={initialStartPageRef.current}
              size="fixed"
              width={dimensions.width}
              height={dimensions.height}
              minWidth={360}
              maxWidth={1200}
              minHeight={480}
              maxHeight={1200}
              drawShadow={true}
              flippingTime={800}
              usePortrait={true}
              startZIndex={10}
              autoSize={true}
              maxShadowOpacity={0.2}
              showCover={false}
              mobileScrollSupport={true}
              clickEventForward={false}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={true}
              disableFlipByClick={false}
              style={{}}
              onFlip={(e) => {
                const d = (e as { data?: number }).data;
                if (typeof d === 'number') {
                  const next = d + 1;
                  if (next !== currentPage) setCurrentPage(next);
                }
              }}
              className="shadow-lg rounded bg-white"
            >
              {flipChildren}
            </HTMLFlipBook>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFFlipBook;
